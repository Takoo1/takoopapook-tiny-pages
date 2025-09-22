import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 bg-muted rounded-lg animate-pulse mb-4"></div>
            <div className="h-4 bg-muted rounded-lg animate-pulse max-w-md mx-auto"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-3 md:mb-4">
            Questions You May Ask
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Find answers to common questions about our lottery games and services
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-lg">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className={`border-b border-border/30 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-background/30' : 'bg-muted/20'
                }`}
              >
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-5 text-left hover:no-underline group">
                  <div className="w-full">
                    <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 text-left pr-4">
                      {faq.question}
                    </h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="pr-4">
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs md:text-base">
                      {faq.answer}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-6 md:mt-8 p-4 md:p-6 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-muted-foreground mb-2 text-xs md:text-base">
            Still have questions?
          </p>
          <p className="text-xs md:text-sm text-primary font-medium">
            Contact our support team for personalized assistance
          </p>
        </div>
      </div>
    </section>
  );
};