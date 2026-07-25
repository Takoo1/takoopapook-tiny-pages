import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export const FAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQs:', error);
        return;
      }

      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-6 w-48 mx-auto bg-muted rounded-lg animate-pulse" />
          <div className="h-3 w-64 mx-auto bg-muted rounded-lg animate-pulse mb-4" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section data-block-filter-bar="true" className="py-10 px-4">

      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            <span className="text-gold-shimmer">Questions You May Ask</span>
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mt-2">
            Find answers to common questions about our lottery games and services
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border border-border/60 bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_-10px_hsl(var(--primary)/0.3)] data-[state=open]:border-primary/40 data-[state=open]:shadow-[0_10px_30px_-15px_hsl(var(--primary)/0.5)] transition-all animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
            >
              <AccordionTrigger className="px-4 py-4 text-left hover:no-underline group [&[data-state=open]]:pb-3">
                <div className="flex items-start gap-3 w-full">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-[11px]">
                    {index + 1}
                  </span>
                  <h3 className="text-sm md:text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors pr-2">
                    {faq.question}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="ml-10 text-muted-foreground leading-relaxed whitespace-pre-line text-xs md:text-sm">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom card */}
        <div className="mt-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 text-primary">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Still have questions?</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Contact our support team for personalized assistance
          </p>
        </div>
      </div>
    </section>
  );
};
