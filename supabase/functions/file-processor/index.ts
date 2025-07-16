import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    const { fileId } = await req.json();
    if (!fileId) {
      throw new Error('File ID is required');
    }

    // Get Google Drive connection
    const { data: dataSource, error: dsError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('source_type', 'google_drive')
      .eq('connection_status', 'connected')
      .single();

    if (dsError || !dataSource) {
      throw new Error('No Google Drive connection found');
    }

    const accessToken = dataSource.metadata?.access_token;
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Create or update processing record
    const contentHash = `gdrive_${fileId}`;
    await supabase
      .from('content_summaries')
      .upsert({
        user_id: user.id,
        file_path: fileId,
        content_hash: contentHash,
        source_type: 'google_drive',
        status: 'processing'
      });

    // Get file metadata
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error(`Failed to get file metadata: ${fileResponse.status}`);
    }

    const fileMetadata = await fileResponse.json();
    let content = '';

    // Extract content based on file type
    if (fileMetadata.mimeType === 'application/vnd.google-apps.document') {
      // Google Docs - export as plain text
      const exportResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (exportResponse.ok) {
        content = await exportResponse.text();
      }
    } else if (fileMetadata.mimeType === 'text/plain') {
      // Plain text file
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (downloadResponse.ok) {
        content = await downloadResponse.text();
      }
    }

    if (!content) {
      throw new Error('Could not extract content from file');
    }

    // Truncate content if too long (for API limits)
    const maxLength = 10000;
    const truncatedContent = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;

    // Generate summary using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes documents and extracts key topics. Provide a concise summary and list the main topics covered.'
          },
          {
            role: 'user',
            content: `Please summarize this document and extract the main topics:\n\n${truncatedContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const summary = openAIData.choices[0].message.content;

    // Extract topics (simple approach - look for bullet points or common patterns)
    const topicMatches = summary.match(/(?:•|-)?\s*([A-Z][^.!?]*(?:[.!?]|$))/g) || [];
    const topics = topicMatches
      .map(topic => topic.replace(/^[•-]\s*/, '').trim())
      .filter(topic => topic.length > 10 && topic.length < 100)
      .slice(0, 5);

    // Update content summary
    await supabase
      .from('content_summaries')
      .update({
        summary: summary,
        topics: topics,
        status: 'completed'
      })
      .eq('user_id', user.id)
      .eq('file_path', fileId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: summary,
        topics: topics,
        fileName: fileMetadata.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in file-processor function:', error);
    
    // Update status to failed
    try {
      const { fileId } = await req.json();
      if (fileId) {
        await supabase
          .from('content_summaries')
          .update({ status: 'failed' })
          .eq('file_path', fileId);
      }
    } catch (updateError) {
      console.error('Failed to update status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});