import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, RefreshCw, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  status: 'not_processed' | 'processing' | 'completed' | 'failed';
}

interface ContentSummary {
  id: string;
  file_path: string;
  summary: string;
  topics: string[];
  status: string;
  created_at: string;
}

export const FileProcessingDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [summaries, setSummaries] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('file-discovery', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files from Google Drive",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_type', 'google_drive')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const processFile = async (fileId: string) => {
    if (!user) return;

    setProcessing(prev => new Set(prev).add(fileId));
    
    try {
      const { data, error } = await supabase.functions.invoke('file-processor', {
        body: { fileId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `File "${data.fileName}" processed successfully`,
      });

      // Refresh files and summaries
      await Promise.all([fetchFiles(), fetchSummaries()]);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchSummaries();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Not Processed';
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSummaries = summaries.filter(summary => {
    const fileName = files.find(f => f.id === summary.file_path)?.name || '';
    return fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           summary.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
           summary.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">File Processing Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Process and summarize your Google Drive files
          </p>
        </div>
        <Button onClick={fetchFiles} disabled={loading} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files and summaries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Files
            </CardTitle>
            <CardDescription>
              Files from your Google Drive ready for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <Progress value={undefined} className="w-full mb-2" />
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No files found</p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.modifiedTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Badge variant="secondary" className={getStatusColor(file.status)}>
                        {getStatusText(file.status)}
                      </Badge>
                      {file.status === 'not_processed' && (
                        <Button
                          size="sm"
                          onClick={() => processFile(file.id)}
                          disabled={processing.has(file.id)}
                          className="text-xs sm:text-sm"
                        >
                          {processing.has(file.id) ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Process'
                          )}
                        </Button>
                      )}
                      {file.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processFile(file.id)}
                          disabled={processing.has(file.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Processed Content
            </CardTitle>
            <CardDescription>
              Summaries and topics from your processed files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredSummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No summaries available</p>
                </div>
              ) : (
                filteredSummaries.map((summary) => {
                  const fileName = files.find(f => f.id === summary.file_path)?.name || 'Unknown file';
                  return (
                    <div key={summary.id} className="p-3 rounded-lg border space-y-2">
                      <h4 className="font-medium">{fileName}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {summary.summary}
                      </p>
                      {summary.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {summary.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Processed {new Date(summary.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};