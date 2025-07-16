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

    // Get Google Drive connection
    const { data: dataSource, error: dsError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('source_type', 'google_drive')
      .eq('connection_status', 'connected')
      .single();

    if (dsError || !dataSource) {
      return new Response(
        JSON.stringify({ error: 'No Google Drive connection found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token from metadata
    const accessToken = dataSource.metadata?.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch files from Google Drive
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const driveData = await response.json();
    
    // Filter for supported file types
    const supportedTypes = [
      'application/vnd.google-apps.document',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const filteredFiles = driveData.files.filter((file: any) => 
      supportedTypes.includes(file.mimeType)
    );

    // Get processing status for each file
    const { data: processedFiles } = await supabase
      .from('content_summaries')
      .select('file_path, status')
      .eq('user_id', user.id)
      .eq('source_type', 'google_drive');

    const processedMap = new Map(
      processedFiles?.map(p => [p.file_path, p.status]) || []
    );

    const filesWithStatus = filteredFiles.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size,
      status: processedMap.get(file.id) || 'not_processed'
    }));

    return new Response(
      JSON.stringify({ files: filesWithStatus }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in file-discovery function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});