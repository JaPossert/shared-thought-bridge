
import { useAuth } from "@/hooks/useAuth";
import { HeroSection } from "@/components/HeroSection";
import { ProcessFlow } from "@/components/ProcessFlow";
import { TrustSection } from "@/components/TrustSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, LogIn, UserPlus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Navigation for authenticated users
  const AuthenticatedNav = () => (
    <nav className="absolute top-4 right-4 z-50 flex flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/files")}
        className="bg-background/80 backdrop-blur-sm"
      >
        <FileText className="h-4 w-4 mr-2" />
        Files
      </Button>
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
  );

  // Navigation for unauthenticated users
  const UnauthenticatedNav = () => (
    <nav className="absolute top-4 right-4 z-50 flex flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/auth?mode=signin")}
        className="bg-background/80 backdrop-blur-sm"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
      <Button
        size="sm"
        onClick={() => navigate("/auth?mode=signup")}
        className="bg-primary text-primary-foreground backdrop-blur-sm"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Join the Waitlist
      </Button>
    </nav>
  );

  return (
    <div className="min-h-screen relative">
      {user ? <AuthenticatedNav /> : <UnauthenticatedNav />}
      
      <HeroSection />
      <ProcessFlow />
      <TrustSection />
      <DashboardPreview />
    </div>
  );
};

export default Index;
