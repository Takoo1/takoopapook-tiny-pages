import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SiteTerm {
  id: string;
  section_name: string;
  section_order: number;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Terms() {
  const [terms, setTerms] = useState<SiteTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('site_terms')
        .select('*')
        .eq('is_active', true)
        .order('section_order');

      if (error) throw error;
      setTerms(data || []);
      
      // Initialize first section as open
      if (data && data.length > 0) {
        setOpenSections({ [data[0].id]: true });
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: "Error",
        description: "Failed to load terms and conditions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Open the section if it's closed
      if (!openSections[sectionId]) {
        toggleSection(sectionId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Content Skeletons */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          
          <div className="text-center border-b pb-6">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-foreground">Terms & Conditions</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using Fortune Bridge services.
            </p>
            <Badge variant="outline" className="mt-4">
              Last updated: {terms.length > 0 ? new Date(Math.max(...terms.map(t => new Date(t.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
            </Badge>
          </div>
        </div>

        {terms.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Terms Available</h3>
            <p className="text-muted-foreground">
              Terms and conditions are currently being prepared. Please check back soon.
            </p>
          </Card>
        ) : (
          <>
            {/* Quick Navigation */}
            <Card className="mb-8 bg-muted/30 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {terms.map((term) => (
                    <Button
                      key={term.id}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => scrollToSection(term.id)}
                    >
                      <span className="text-sm truncate">
                        {term.section_name}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terms Content */}
            <div className="space-y-6">
              {terms.map((term, index) => (
                <Card 
                  key={term.id} 
                  id={`section-${term.id}`}
                  className="bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Collapsible
                    open={openSections[term.id]}
                    onOpenChange={() => toggleSection(term.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 text-left">
                            <Badge 
                              variant="outline" 
                              className="shrink-0 bg-primary/10 text-primary border-primary/30 font-semibold"
                            >
                              {term.section_order}
                            </Badge>
                            <div>
                              <CardTitle className="text-xl text-foreground leading-tight">
                                {term.section_name}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="shrink-0 ml-4">
                            {openSections[term.id] ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent>
                        <Separator className="mb-6" />
                        {term.content ? (
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-foreground leading-relaxed text-sm md:text-base">
                              {term.content}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-muted-foreground text-sm">
                              Content for this section is currently being prepared.
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <Card className="mt-12 bg-muted/30 border-border/50">
              <CardContent className="py-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Questions about these terms?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                    If you have any questions about these Terms and Conditions, 
                    please contact us through our contact page or customer support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/contact">
                        Contact Us
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">
                        Return to Home
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}