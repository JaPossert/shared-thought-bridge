import { Shield, Clock, FileX, Award, Lock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TrustSection() {
  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Architecture",
      description: "End-to-end encryption ensures we never see your raw content—only anonymized embeddings",
      badge: "SOC 2 Compliant"
    },
    {
      icon: Clock,
      title: "Automatic Data Deletion",
      description: "Summaries deleted after 30 days, encrypted backups after 90 days—no permanent storage",
      badge: "GDPR Compliant"
    },
    {
      icon: FileX,
      title: "Granular Content Control",
      description: "Exclude work content, personal notes, or emotional data—you decide what's analyzed",
      badge: "User Controlled"
    },
    {
      icon: Award,
      title: "Independent Security Audits",
      description: "Regular penetration testing and security research, following Proton's transparency model",
      badge: "Verified"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 px-4">
          <div className="inline-flex items-center gap-2 bg-trust-light/20 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trust & Security</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Your Privacy is Our Foundation</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with military-grade encryption and designed so that even we can't access your sensitive information
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4 lg:px-0">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-background/60 backdrop-blur-sm border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Trust metrics */}
          <div className="bg-gradient-to-r from-background/80 to-trust-light/10 backdrop-blur-sm border border-border/30 rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-primary mb-2">0</h4>
                <p className="text-sm text-muted-foreground">Raw documents accessed by our servers</p>
              </div>
              
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <FileX className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-2xl font-bold text-accent mb-2">30 Days</h4>
                <p className="text-sm text-muted-foreground">Maximum data retention period</p>
              </div>
              
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-privacy/20 to-privacy/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-privacy" />
                </div>
                <h4 className="text-2xl font-bold text-privacy mb-2">256-bit</h4>
                <p className="text-sm text-muted-foreground">AES encryption standard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}