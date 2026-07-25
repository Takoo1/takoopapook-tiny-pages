import React, { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText, Mail, Home as HomeIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

    document.title = `${title} | Fortune Bridge`;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || `Fortune Bridge ${title} - Professional lottery platform with secure payments and transparent policies.`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://fortunebridge.online/${policyType}`);
  }, [policyType, title, description]);

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
      if (data && data.length > 0) setOpenSections([data[0].id]);
    } catch (error) {
      console.error('Error fetching policy content:', error);
      toast.error('Failed to load policy content');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!openSections.includes(sectionId)) toggleSection(sectionId);
    }
  };

  const getLastUpdated = () => {
    if (!terms.length) return '';
    const lastUpdated = Math.max(...terms.map(term => new Date(term.updated_at).getTime()));
    return new Date(lastUpdated).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="px-4 py-5 pb-8 max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-2/3 bg-muted rounded-lg animate-pulse" />
        <div className="h-3 w-full bg-muted rounded-lg animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded-lg animate-pulse" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!terms.length) {
    return (
      <div className="px-4 py-16 text-center max-w-lg mx-auto">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground">No content available at this time.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 pb-10 max-w-2xl mx-auto space-y-5">
      {/* Page Header */}
      <header className="animate-fade-in">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" /> Last updated: {getLastUpdated()}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-gold-shimmer">{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        )}
      </header>

      {/* Quick Navigation */}
      {terms.length > 3 && (
        <section className="animate-fade-in">
          <h2 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quick Navigation
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_20px_-12px_hsl(var(--primary)/0.25)]">
            {terms.map((term, i) => (
              <button
                key={term.id}
                onClick={() => scrollToSection(term.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/60 ${
                  i < terms.length - 1 ? 'border-b border-border/60' : ''
                }`}
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-[11px]">
                  {term.section_order}
                </span>
                <span className="text-sm font-medium truncate flex-1">{term.section_name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {terms.map((term, index) => {
          const isOpen = openSections.includes(term.id);
          return (
            <section
              key={term.id}
              id={`section-${term.id}`}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_20px_-12px_hsl(var(--primary)/0.25)] animate-fade-in transition-all data-[open=true]:border-primary/40"
              data-open={isOpen}
              style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(term.id)}>
                <CollapsibleTrigger className="w-full text-left">
                  <div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/40 transition-colors">
                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs">
                      {term.section_order}
                    </span>
                    <h3 className="flex-1 text-sm md:text-base font-semibold leading-snug">{term.section_name}</h3>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-5">
                    <div className="ml-11 border-l border-primary/20 pl-4">
                      <div className="whitespace-pre-wrap text-[13px] md:text-sm leading-[1.7] text-foreground/85">
                        {term.content || 'Content for this section is currently being prepared.'}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-5 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <Mail className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Questions?</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Contact us at{' '}
          <a href="mailto:support@fortunebridge.online" className="text-primary underline">
            support@fortunebridge.online
          </a>
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" asChild className="rounded-2xl h-10">
            <Link to="/contact"><Mail className="w-4 h-4 mr-1.5" /> Contact Us</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-2xl h-10">
            <Link to="/"><HomeIcon className="w-4 h-4 mr-1.5" /> Return Home</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
