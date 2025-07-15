
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HeroSection } from "@/components/HeroSection";
import { ProcessFlow } from "@/components/ProcessFlow";
import { TrustSection } from "@/components/TrustSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/settings")}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="bg-background/80 backdrop-blur-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </nav>
      
      <HeroSection />
      <ProcessFlow />
      <TrustSection />
      <DashboardPreview />
    </div>
  );
};

export default Index;
