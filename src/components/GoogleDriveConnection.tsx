
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleDriveConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch user's Google Drive connection status
  const { data: driveConnection, isLoading } = useQuery({
    queryKey: ['google-drive-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_type', 'google_drive')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('google-drive-auth', {
        body: { action: 'connect' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Google Drive",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('google-drive-auth', {
        body: { action: 'disconnect' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-drive-connection'] });
      toast({
        title: "Disconnected successfully",
        description: "Your Google Drive has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection failed",
        description: error.message || "Failed to disconnect from Google Drive",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isConnected = driveConnection?.connection_status === 'connected';
  const isExpired = driveConnection?.connection_status === 'expired';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Google Drive Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Drive to scan and analyze your files for knowledge discovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your Google Drive is connected and ready to use. Last synced: {
                driveConnection?.last_sync 
                  ? new Date(driveConnection.last_sync).toLocaleString()
                  : 'Never'
              }
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your Google Drive connection has expired. Please reconnect to continue using the service.
            </AlertDescription>
          </Alert>
        )}

        {!isConnected && !isExpired && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Google Drive to start scanning your files for knowledge discovery.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!isConnected || isExpired ? (
            <Button 
              onClick={handleConnect}
              disabled={isConnecting || connectMutation.isPending}
              className="flex items-center gap-2"
            >
              {(isConnecting || connectMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isExpired ? 'Reconnect' : 'Connect'} Google Drive
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="flex items-center gap-2"
            >
              {disconnectMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Disconnect
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="text-sm text-muted-foreground">
            <p>✓ Access to your Google Drive files</p>
            <p>✓ Automatic file scanning and analysis</p>
            <p>✓ Secure token storage with encryption</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
