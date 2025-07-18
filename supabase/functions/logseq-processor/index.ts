import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from "../_shared/cors.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

interface LogseqBlock {
  id: string;
  content: string;
  page?: string;
  children?: LogseqBlock[];
  properties?: Record<string, any>;
}

interface LogseqPage {
  name: string;
  blocks?: LogseqBlock[];
  properties?: Record<string, any>;
}

interface LogseqGraph {
  pages?: LogseqPage[];
  blocks?: LogseqBlock[];
  version?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { fileName, graphData, fileSize } = await req.json()

    console.log(`Processing Logseq graph: ${fileName} (${fileSize} bytes)`)

    // Validate logseq data structure
    const logseqGraph: LogseqGraph = graphData
    if (!logseqGraph.pages && !logseqGraph.blocks) {
      throw new Error('Invalid Logseq graph structure - missing pages or blocks')
    }

    // Extract all text content from the graph
    const extractContent = (block: LogseqBlock): string => {
      let content = block.content || ''
      if (block.children) {
        content += ' ' + block.children.map(extractContent).join(' ')
      }
      return content
    }

    let allContent = ''
    let pageCount = 0
    let blockCount = 0

    // Process pages
    if (logseqGraph.pages) {
      for (const page of logseqGraph.pages) {
        pageCount++
        allContent += `\n\n=== Page: ${page.name} ===\n`
        
        if (page.blocks) {
          for (const block of page.blocks) {
            blockCount++
            allContent += extractContent(block) + '\n'
          }
        }
      }
    }

    // Process standalone blocks
    if (logseqGraph.blocks) {
      for (const block of logseqGraph.blocks) {
        blockCount++
        allContent += extractContent(block) + '\n'
      }
    }

    // Generate content hash
    const encoder = new TextEncoder()
    const data = encoder.encode(allContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Check if we already processed this content
    const { data: existing } = await supabase
      .from('content_summaries')
      .select('id')
      .eq('content_hash', contentHash)
      .eq('user_id', user.id)
      .eq('source_type', 'logseq')
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ 
          message: 'Content already processed',
          fileName,
          summaryId: existing.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create content summary record
    const { data: summary, error: insertError } = await supabase
      .from('content_summaries')
      .insert({
        user_id: user.id,
        content_hash: contentHash,
        source_type: 'logseq',
        file_path: fileName,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Process content with OpenAI in background
    const processContent = async () => {
      try {
        // Truncate content if too long (OpenAI has token limits)
        const maxLength = 50000 // Approximately 12-15k tokens
        const truncatedContent = allContent.length > maxLength 
          ? allContent.substring(0, maxLength) + '...\n[Content truncated due to length]'
          : allContent

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are analyzing a Logseq personal knowledge graph. This graph contains ${pageCount} pages and ${blockCount} blocks. Please provide a comprehensive summary and extract key topics.`
              },
              {
                role: 'user',
                content: `Please analyze this Logseq graph content and provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key topics and themes (as a JSON array)

Content:
${truncatedContent}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`)
        }

        const aiResult = await response.json()
        const aiContent = aiResult.choices[0]?.message?.content

        if (!aiContent) {
          throw new Error('No content returned from OpenAI')
        }

        // Extract summary and topics from AI response
        const lines = aiContent.split('\n')
        let summaryText = ''
        let topics: string[] = []

        let inSummary = false
        let inTopics = false

        for (const line of lines) {
          const trimmedLine = line.trim()
          
          if (trimmedLine.includes('summary') || trimmedLine.includes('Summary')) {
            inSummary = true
            inTopics = false
            continue
          }
          
          if (trimmedLine.includes('topics') || trimmedLine.includes('Topics') || trimmedLine.includes('[')) {
            inSummary = false
            inTopics = true
            continue
          }
          
          if (inSummary && trimmedLine) {
            summaryText += trimmedLine + ' '
          }
          
          if (inTopics && trimmedLine) {
            // Try to parse as JSON array first
            try {
              if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                topics = JSON.parse(trimmedLine)
              }
            } catch {
              // If not JSON, treat as comma-separated or bullet points
              if (trimmedLine.includes(',')) {
                topics = trimmedLine.split(',').map(t => t.trim().replace(/^[-*•]/, '').trim())
              } else if (trimmedLine.match(/^[-*•]/)) {
                topics.push(trimmedLine.replace(/^[-*•]/, '').trim())
              }
            }
          }
        }

        // Fallback: if parsing failed, use the whole response as summary
        if (!summaryText.trim()) {
          summaryText = aiContent
        }

        // Update the summary with results
        await supabase
          .from('content_summaries')
          .update({
            summary: summaryText.trim(),
            topics: topics.filter(t => t.length > 0),
            status: 'completed'
          })
          .eq('id', summary.id)

        console.log(`Successfully processed Logseq graph: ${fileName}`)
      } catch (error) {
        console.error('Error in background processing:', error)
        
        // Update status to failed
        await supabase
          .from('content_summaries')
          .update({ status: 'failed' })
          .eq('id', summary.id)
      }
    }

    // Start background processing
    EdgeRuntime.waitUntil(processContent())

    return new Response(
      JSON.stringify({ 
        message: 'Logseq graph processing started',
        fileName,
        summaryId: summary.id,
        stats: {
          pages: pageCount,
          blocks: blockCount,
          contentLength: allContent.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing logseq graph:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process logseq graph'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})