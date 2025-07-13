import { Button } from "@/components/ui/button";
import { Shield, Users, Lock, Eye } from "lucide-react";
export function HeroSection() {
  return <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-trust-light/20 to-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)_/_0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)_/_0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 mb-8 shadow-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Privacy-First Knowledge Discovery</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-foreground">Discover </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Shared Knowledge</span>
            <br />
            <span className="text-foreground">Without </span>
            <span className="bg-gradient-to-r from-accent to-privacy bg-clip-text text-transparent">Sharing Data</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">Connect your second brains with trusted collaborators and discover knowledge overlaps through end-to-end encrypted semantic analysis—
no raw data ever leaves your control.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" className="px-8 py-3">
              Start Private Discovery
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              See How It Works
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Zero Raw Data Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Trusted by
agrowing number of users</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
}