import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, FileText, Brain, Users, TrendingUp } from "lucide-react";
export function DashboardPreview() {
  const overlapTopics = [{
    topic: "Machine Learning Research",
    similarity: 92,
    docs: 15,
    status: "approved"
  }, {
    topic: "Climate Change Data",
    similarity: 87,
    docs: 8,
    status: "pending"
  }, {
    topic: "Urban Planning Methods",
    similarity: 76,
    docs: 12,
    status: "approved"
  }, {
    topic: "Sustainable Technology",
    similarity: 71,
    docs: 6,
    status: "rejected"
  }, {
    topic: "Data Visualization",
    similarity: 68,
    docs: 9,
    status: "pending"
  }];
  return <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">See Knowledge Overlaps in Action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Preview of the collaborative discovery interface—where shared insights emerge without compromising privacy
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Mock dashboard */}
          <Card className="p-8 bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl">
            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Knowledge Discovery Session</h3>
                  <p className="text-muted-foreground">with Dr. Sarah Senior • Research Collaboration</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-trust-light/20 text-primary border-primary/20">
                <Brain className="w-3 h-3 mr-1" />
                Active Discovery
              </Badge>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">847</div>
                  <div className="text-xs text-muted-foreground">Documents Analyzed</div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">23</div>
                  <div className="text-xs text-muted-foreground">Overlap Topics Found</div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-privacy/5 to-privacy/10 border-privacy/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-privacy mb-1">78%</div>
                  <div className="text-xs text-muted-foreground">Privacy Score (beta)</div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-muted/5 to-muted/10 border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">12</div>
                  <div className="text-xs text-muted-foreground">Approved Shares</div>
                </div>
              </Card>
            </div>
            
            {/* Overlap topics list */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold">Discovered Knowledge Overlaps</h4>
                <div className="flex items-center gap-4">
                  {overlapTopics.some(item => item.status === 'pending') && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-3">
                        <X className="w-3 h-3 mr-1" />
                        Reject All
                      </Button>
                      <Button size="sm" variant="trust" className="h-8 px-3">
                        <Check className="w-3 h-3 mr-1" />
                        Approve All
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>Ranked by semantic similarity</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {overlapTopics.map((item, index) => <Card key={index} className="p-4 bg-background/60 border border-border/30 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{item.topic}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.docs} docs
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Similarity:</span>
                          <Progress value={item.similarity} className="flex-1 max-w-32" />
                          <span className="text-sm font-medium text-primary">{item.similarity}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {item.status === 'approved' && <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>}
                        {item.status === 'rejected' && <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                            <X className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>}
                        {item.status === 'pending' && <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <X className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="trust" className="h-8 px-3">
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>}
                      </div>
                    </div>
                  </Card>)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>;
}