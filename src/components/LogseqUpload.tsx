import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle } from "lucide-react";

export const LogseqUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JSON file from your Logseq graph export",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Read file content
      const fileContent = await file.text();
      
      // Validate it's a proper JSON
      let logseqData;
      try {
        logseqData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error("Invalid JSON file");
      }

      // Process the logseq graph
      const { data, error } = await supabase.functions.invoke('logseq-processor', {
        body: { 
          fileName: file.name,
          graphData: logseqData,
          fileSize: file.size
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Logseq graph "${file.name}" processed successfully`,
      });

      setUploadedFile(file.name);
    } catch (error) {
      console.error('Error processing logseq file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process logseq file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Logseq Graph Upload
        </CardTitle>
        <CardDescription>
          Upload your Logseq graph export (JSON file) for processing and summarization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          {uploadedFile ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <p className="text-sm font-medium">{uploadedFile}</p>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload your Logseq graph export
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JSON files exported from Logseq
              </p>
            </div>
          )}
        </div>

        <Button 
          onClick={triggerFileSelect}
          disabled={uploading}
          className="w-full"
          variant={uploadedFile ? "outline" : "default"}
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-pulse" />
              Processing...
            </>
          ) : uploadedFile ? (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Another Graph
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Select Logseq JSON File
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to export from Logseq:</strong></p>
          <p>1. Go to Settings → Export</p>
          <p>2. Choose "Export graph as JSON"</p>
          <p>3. Upload the exported JSON file here</p>
        </div>
      </CardContent>
    </Card>
  );
};