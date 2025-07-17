import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        toast({
          title: "Connection failed",
          description: `Google authorization failed: ${error}`,
          variant: "destructive",
        });
        navigate('/file-processing');
        return;
      }

      if (code && state) {
        try {
          const { data, error: exchangeError } = await supabase.functions.invoke('google-drive-auth', {
            body: { 
              action: 'exchange_code', 
              code: code,
              state: state 
            }
          });

          if (exchangeError) {
            throw exchangeError;
          }

          toast({
            title: "Connected successfully",
            description: "Your Google Drive has been connected.",
          });
        } catch (error: any) {
          console.error('Error exchanging code:', error);
          toast({
            title: "Connection failed",
            description: error.message || "Failed to complete Google Drive connection",
            variant: "destructive",
          });
        }
      }

      navigate('/file-processing');
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h1 className="text-xl font-semibold">Connecting to Google Drive...</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;