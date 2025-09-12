import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface SiteTerm {
  id: string;
  section_name: string;
  section_order: number;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function TermsManager() {
  const [terms, setTerms] = useState<SiteTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [previewStates, setPreviewStates] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('site_terms')
        .select('*')
        .order('section_order');

      if (error) throw error;
      setTerms(data || []);
      
      // Initialize edited content state
      const contentMap: Record<string, string> = {};
      data?.forEach(term => {
        contentMap[term.id] = term.content;
      });
      setEditedContent(contentMap);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch terms content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (termId: string, content: string) => {
    setEditedContent(prev => ({
      ...prev,
      [termId]: content
    }));
  };

  const saveTermContent = async (termId: string) => {
    setSavingStates(prev => ({ ...prev, [termId]: true }));
    
    try {
      const { error } = await supabase
        .from('site_terms')
        .update({ 
          content: editedContent[termId] || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', termId);

      if (error) throw error;

      // Update local state
      setTerms(prev => prev.map(term => 
        term.id === termId 
          ? { ...term, content: editedContent[termId] || '', updated_at: new Date().toISOString() }
          : term
      ));

      toast({
        title: "Success",
        description: "Section content saved successfully",
      });
    } catch (error) {
      console.error('Error saving term:', error);
      toast({
        title: "Error",
        description: "Failed to save section content",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, [termId]: false }));
    }
  };

  const togglePreview = (termId: string) => {
    setPreviewStates(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const hasUnsavedChanges = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    return term && editedContent[termId] !== term.content;
  };

  const getCharacterCount = (termId: string) => {
    return editedContent[termId]?.length || 0;
  };

  const getLineCount = (termId: string) => {
    return (editedContent[termId]?.split('\n').length || 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading terms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-foreground">Terms & Conditions Manager</h2>
        <p className="text-muted-foreground mt-2">
          Manage the content for each section of your terms and conditions. 
          Formatting (line breaks, spacing, bullet points) will be preserved exactly as you type them.
        </p>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1">
          {terms.map((term, index) => (
            <TabsTrigger 
              key={term.id} 
              value={index.toString()} 
              className="text-xs p-2 h-auto whitespace-normal text-center relative"
            >
              <div className="space-y-1">
                <div className="font-medium">Section {term.section_order}</div>
                <div className="text-[10px] opacity-80 line-clamp-2">
                  {term.section_name}
                </div>
                {hasUnsavedChanges(term.id) && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-orange-500" />
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {terms.map((term, index) => (
          <TabsContent key={term.id} value={index.toString()} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Section {term.section_order}: {term.section_name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {term.section_order === 1 && "This is the introduction section - no bullet points needed."}
                      {term.section_order === 4 && "This section supports sub-points. Use proper indentation for sub-points."}
                      {term.section_order > 1 && term.section_order !== 4 && "Use bullet points (•) or numbered lists as needed."}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(term.id)}
                      className="shrink-0"
                    >
                      {previewStates[term.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {previewStates[term.id] ? "Edit" : "Preview"}
                    </Button>
                    <Button
                      onClick={() => saveTermContent(term.id)}
                      disabled={savingStates[term.id] || !hasUnsavedChanges(term.id)}
                      size="sm"
                      className="shrink-0"
                    >
                      {savingStates[term.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getCharacterCount(term.id)} characters</span>
                  <span>{getLineCount(term.id)} lines</span>
                  {hasUnsavedChanges(term.id) && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {previewStates[term.id] ? (
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[400px]">
                    <h4 className="font-semibold mb-3 text-foreground">Preview:</h4>
                    <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                      {editedContent[term.id] || 'No content yet. Click "Edit" to add content.'}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={editedContent[term.id] || ''}
                    onChange={(e) => handleContentChange(term.id, e.target.value)}
                    placeholder={`Enter content for ${term.section_name}...

Tips:
• Use bullet points with • symbol
• Press Enter twice for paragraph breaks
• Use proper indentation for sub-points (section 4)
• All formatting will be preserved exactly as typed`}
                    className="min-h-[400px] font-mono text-sm"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}