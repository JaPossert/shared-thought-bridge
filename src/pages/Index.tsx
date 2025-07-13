import { HeroSection } from "@/components/HeroSection";
import { ProcessFlow } from "@/components/ProcessFlow";
import { TrustSection } from "@/components/TrustSection";
import { DashboardPreview } from "@/components/DashboardPreview";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProcessFlow />
      <TrustSection />
      <DashboardPreview />
    </div>
  );
};

export default Index;
