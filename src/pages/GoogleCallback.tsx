
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
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Authorization failed",
          description: error,
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      if (!code) {
        toast({
          title: "Authorization failed",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      try {
        // Exchange the code for tokens
        const { data, error: exchangeError } = await supabase.functions.invoke('google-drive-auth', {
          body: { action: 'exchange_code', code }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        toast({
          title: "Google Drive connected!",
          description: "Your Google Drive has been successfully connected.",
        });

        navigate('/settings');
      } catch (error: any) {
        console.error('Token exchange error:', error);
        toast({
          title: "Connection failed",
          description: error.message || "Failed to connect Google Drive",
          variant: "destructive",
        });
        navigate('/settings');
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">Connecting your Google Drive...</h2>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
