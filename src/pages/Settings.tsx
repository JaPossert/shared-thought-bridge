
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrivacyControls } from "@/components/PrivacyControls";
import { TopicApprovalSystem } from "@/components/TopicApprovalSystem";
import { GoogleDriveConnection } from "@/components/GoogleDriveConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
            <TabsTrigger value="topics">Topic Approval</TabsTrigger>
            <TabsTrigger value="account">Account & Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="privacy">
            <PrivacyControls />
          </TabsContent>
          
          <TabsContent value="topics">
            <TopicApprovalSystem />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
              <GoogleDriveConnection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
