import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettings {
  id: string;
  share_personal_content: boolean;
  share_work_content: boolean;
  auto_approve_topics: boolean;
  excluded_topics: string[];
  excluded_file_patterns: string[];
  data_retention_days: number;
}

export const PrivacyControls = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState("");
  const [newPattern, setNewPattern] = useState("");

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching privacy settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<PrivacySettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update privacy settings",
          variant: "destructive",
        });
        return;
      }

      setSettings({ ...settings, ...updates });
      toast({
        title: "Settings Updated",
        description: "Your privacy preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const addExcludedTopic = () => {
    if (!newTopic.trim() || !settings) return;
    
    const updatedTopics = [...settings.excluded_topics, newTopic.trim()];
    updateSettings({ excluded_topics: updatedTopics });
    setNewTopic("");
  };

  const removeExcludedTopic = (topicToRemove: string) => {
    if (!settings) return;
    
    const updatedTopics = settings.excluded_topics.filter(topic => topic !== topicToRemove);
    updateSettings({ excluded_topics: updatedTopics });
  };

  const addFilePattern = () => {
    if (!newPattern.trim() || !settings) return;
    
    const updatedPatterns = [...settings.excluded_file_patterns, newPattern.trim()];
    updateSettings({ excluded_file_patterns: updatedPatterns });
    setNewPattern("");
  };

  const removeFilePattern = (patternToRemove: string) => {
    if (!settings) return;
    
    const updatedPatterns = settings.excluded_file_patterns.filter(pattern => pattern !== patternToRemove);
    updateSettings({ excluded_file_patterns: updatedPatterns });
  };

  if (loading) {
    return <div>Loading privacy settings...</div>;
  }

  if (!settings) {
    return <div>No privacy settings found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Sharing Preferences</CardTitle>
          <CardDescription>
            Control what types of content can be used for collaboration discovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-personal">Share Personal Content</Label>
              <p className="text-sm text-muted-foreground">
                Allow personal files and documents to be analyzed for collaboration
              </p>
            </div>
            <Switch
              id="share-personal"
              checked={settings.share_personal_content}
              onCheckedChange={(checked) => updateSettings({ share_personal_content: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-work">Share Work Content</Label>
              <p className="text-sm text-muted-foreground">
                Allow work-related files and documents to be analyzed
              </p>
            </div>
            <Switch
              id="share-work"
              checked={settings.share_work_content}
              onCheckedChange={(checked) => updateSettings({ share_work_content: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-approve">Auto-approve Topics</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve sharing suggestions for detected topics
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={settings.auto_approve_topics}
              onCheckedChange={(checked) => updateSettings({ auto_approve_topics: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excluded Topics</CardTitle>
          <CardDescription>
            Topics that should never be included in collaboration discovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter topic to exclude (e.g., health, finance)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExcludedTopic()}
            />
            <Button onClick={addExcludedTopic} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.excluded_topics.map((topic, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {topic}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeExcludedTopic(topic)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Exclusion Patterns</CardTitle>
          <CardDescription>
            File patterns that should be excluded from analysis (supports wildcards)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter pattern (e.g., *private*, *.personal)"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFilePattern()}
            />
            <Button onClick={addFilePattern} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.excluded_file_patterns.map((pattern, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {pattern}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilePattern(pattern)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            How long your processed content summaries are kept
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="retention-days">Retention Period (days)</Label>
            <Input
              id="retention-days"
              type="number"
              min="1"
              max="90"
              value={settings.data_retention_days}
              onChange={(e) => updateSettings({ data_retention_days: parseInt(e.target.value) || 30 })}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Summaries will be automatically deleted after this period
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};