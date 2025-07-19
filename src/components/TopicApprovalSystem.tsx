import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiscoverableTopic {
  id: string;
  topic: string;
  confidence: number;
  file_sources: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const TopicApprovalSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<DiscoverableTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiscoverableTopics();
    }
  }, [user]);

  const fetchDiscoverableTopics = async () => {
    try {
      // Get content summaries and extract unique topics
      const { data: summaries, error } = await supabase
        .from('content_summaries')
        .select('topics, file_path, created_at')
        .eq('user_id', user?.id)
        .not('topics', 'is', null);

      if (error) {
        console.error('Error fetching summaries:', error);
        return;
      }

      // Process topics into discoverable format
      const topicMap = new Map<string, DiscoverableTopic>();
      
      summaries?.forEach(summary => {
        summary.topics?.forEach((topic: string) => {
          if (!topicMap.has(topic)) {
            topicMap.set(topic, {
              id: `topic-${topic}`,
              topic,
              confidence: 0.8, // Mock confidence for now
              file_sources: [],
              status: 'pending',
              created_at: summary.created_at
            });
          }
          
          const existingTopic = topicMap.get(topic)!;
          if (!existingTopic.file_sources.includes(summary.file_path || '')) {
            existingTopic.file_sources.push(summary.file_path || '');
          }
        });
      });

      setTopics(Array.from(topicMap.values()));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTopicStatus = async (topicId: string, status: 'approved' | 'rejected') => {
    setTopics(prev => 
      prev.map(topic => 
        topic.id === topicId ? { ...topic, status } : topic
      )
    );

    toast({
      title: status === 'approved' ? "Topic Approved" : "Topic Rejected",
      description: `The topic has been ${status} for collaboration discovery`,
    });
  };

  const bulkApprove = () => {
    setTopics(prev => 
      prev.map(topic => 
        topic.status === 'pending' ? { ...topic, status: 'approved' as const } : topic
      )
    );

    toast({
      title: "Bulk Approval Complete",
      description: "All pending topics have been approved",
    });
  };

  const bulkReject = () => {
    setTopics(prev => 
      prev.map(topic => 
        topic.status === 'pending' ? { ...topic, status: 'rejected' as const } : topic
      )
    );

    toast({
      title: "Bulk Rejection Complete",
      description: "All pending topics have been rejected",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingTopics = topics.filter(t => t.status === 'pending');
  const approvedTopics = topics.filter(t => t.status === 'approved');
  const rejectedTopics = topics.filter(t => t.status === 'rejected');

  if (loading) {
    return <div>Loading topics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Topic Approval for Collaboration
          </CardTitle>
          <CardDescription>
            Review and approve topics that can be used to discover collaboration opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={bulkApprove} 
              size="sm" 
              disabled={pendingTopics.length === 0}
            >
              Approve All ({pendingTopics.length})
            </Button>
            <Button 
              onClick={bulkReject} 
              variant="outline" 
              size="sm"
              disabled={pendingTopics.length === 0}
            >
              Reject All
            </Button>
          </div>

          <div className="grid gap-2 mb-6">
            <div className="text-sm text-muted-foreground">
              Summary: {approvedTopics.length} approved, {rejectedTopics.length} rejected, {pendingTopics.length} pending
            </div>
          </div>
        </CardContent>
      </Card>

      {pendingTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Topics ({pendingTopics.length})</CardTitle>
            <CardDescription>
              Topics detected in your content that need approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(topic.status)}
                      <span className="font-medium">{topic.topic}</span>
                      <Badge variant="outline">
                        {Math.round(topic.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Found in {topic.file_sources.length} file(s)
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateTopicStatus(topic.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTopicStatus(topic.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(approvedTopics.length > 0 || rejectedTopics.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Topics</CardTitle>
            <CardDescription>
              Topics you've already approved or rejected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...approvedTopics, ...rejectedTopics].map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(topic.status)}
                    <span>{topic.topic}</span>
                    <Badge className={getStatusColor(topic.status)}>
                      {topic.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTopicStatus(topic.id, topic.status === 'approved' ? 'rejected' : 'approved')}
                  >
                    Toggle
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};