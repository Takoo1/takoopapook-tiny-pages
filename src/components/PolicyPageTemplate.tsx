import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PolicyTerm {
  id: string;
  section_name: string;
  section_order: number;
  content: string;
  is_active: boolean;
  updated_at: string;
}

interface PolicyPageTemplateProps {
  policyType: 'terms' | 'privacy' | 'refund' | 'shipping';
  title: string;
  description?: string;
}

export default function PolicyPageTemplate({ policyType, title, description }: PolicyPageTemplateProps) {
  const [terms, setTerms] = useState<PolicyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    fetchPolicyContent();
  }, [policyType]);

  const fetchPolicyContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_terms')
        .select('*')
        .eq('policy_type', policyType)
        .eq('is_active', true)
        .order('section_order');

      if (error) throw error;
      
      setTerms(data || []);
      // Open first section by default
      if (data && data.length > 0) {
        setOpenSections([data[0].id]);
      }
    } catch (error) {
      console.error('Error fetching policy content:', error);
      toast.error('Failed to load policy content');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (!openSections.includes(sectionId)) {
        toggleSection(sectionId);
      }
    }
  };

  const getLastUpdated = () => {
    if (!terms.length) return '';
    const lastUpdated = Math.max(...terms.map(term => new Date(term.updated_at).getTime()));
    return new Date(lastUpdated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!terms.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground">No content available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-lg mb-4">{description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Last updated: {getLastUpdated()}
        </p>
      </div>

      {/* Quick Navigation */}
      {terms.length > 3 && (
        <Card className="mb-8 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {terms.map((term) => (
                <button
                  key={term.id}
                  onClick={() => scrollToSection(term.id)}
                  className="text-left p-2 rounded hover:bg-muted/40 transition-colors text-sm text-primary hover:underline"
                >
                  {term.section_order}. {term.section_name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Content */}
      <div className="space-y-4">
        {terms.map((term, index) => (
          <Card 
            key={term.id} 
            id={`section-${term.id}`}
            className="overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <Collapsible 
              open={openSections.includes(term.id)}
              onOpenChange={() => toggleSection(term.id)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-left flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {term.section_order}
                      </span>
                      <span className="text-lg">{term.section_name}</span>
                    </CardTitle>
                    {openSections.includes(term.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="ml-11 text-muted-foreground leading-relaxed whitespace-pre-line">
                    {term.content}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 bg-muted/20 rounded-lg text-center">
        <p className="text-muted-foreground mb-2">
          Questions about this policy?
        </p>
        <div className="space-y-1">
          <p className="text-sm">
            Contact us at: <a href="mailto:support@fortunebridge.online" className="text-primary hover:underline">support@fortunebridge.online</a>
          </p>
          <p className="text-sm">
            Visit our <a href="/contact" className="text-primary hover:underline">Contact Page</a> or return to <a href="/" className="text-primary hover:underline">Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}