import { ArrowRight, Database, Brain, Search, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ProcessFlow() {
  const steps = [
    {
      icon: Database,
      title: "Connect Data Sources",
      description: "Grant temporary read-only access to your Google Drive, Notion, or other knowledge bases",
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "AI Analysis & Filtering",
      description: "Our LLM analyzes your content while respecting your privacy boundaries and exclusion rules",
      color: "text-accent"
    },
    {
      icon: Search,
      title: "Semantic Matching",
      description: "We compare embeddings (not raw content) to find thematic overlaps with your collaborator",
      color: "text-privacy"
    },
    {
      icon: CheckCircle,
      title: "Selective Sharing",
      description: "You approve each suggestion before any information is shared—full control at every step",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How Privacy-First Discovery Works</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Our zero-knowledge architecture ensures your sensitive data never leaves your control
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 lg:px-0">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6 h-full bg-background/80 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-background to-secondary/50 flex items-center justify-center shadow-md">
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </Card>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}