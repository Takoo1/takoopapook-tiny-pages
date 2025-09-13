import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Scroll } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TermsSection {
  section_name: string;
  content: string;
  section_order: number;
}

interface TermsPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  acceptanceType: 'ticket_purchase' | 'organizer_access' | 'user_login';
  sectionsToShow: number[]; // Array of section numbers to display
  title?: string;
}

export default function TermsPopupModal({
  isOpen,
  onClose,
  onAccept,
  acceptanceType,
  sectionsToShow,
  title = "Terms & Conditions"
}: TermsPopupModalProps) {
  const [terms, setTerms] = useState<TermsSection[]>([]);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTerms();
      setHasScrolledToEnd(false);
      setHasAccepted(false);
    }
  }, [isOpen]);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('site_terms')
        .select('section_name, content, section_order')
        .eq('is_active', true)
        .in('section_order', sectionsToShow)
        .order('section_order');

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: "Error",
        description: "Failed to load terms and conditions",
        variant: "destructive",
      });
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    
    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = async () => {
    if (!hasAccepted || !hasScrolledToEnd) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save acceptance to database for logged-in users
        const { error } = await supabase
          .from('user_terms_acceptance')
          .insert({
            user_id: user.id,
            acceptance_type: acceptanceType,
            terms_version: '1.0'
          });

        if (error) throw error;
      } else {
        // Save to localStorage for anonymous users
        const acceptanceData = {
          acceptanceType,
          acceptedAt: new Date().toISOString(),
          termsVersion: '1.0'
        };
        localStorage.setItem(`terms_accepted_${acceptanceType}`, JSON.stringify(acceptanceData));
      }

      toast({
        title: "Terms Accepted",
        description: "Thank you for accepting our terms and conditions",
      });

      onAccept();
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      toast({
        title: "Error",
        description: "Failed to save terms acceptance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openFullTerms = () => {
    window.open('/terms', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Scroll className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea 
            className="flex-1 px-4" 
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4 pb-4">
              {terms.map((term) => (
                <div key={term.section_order} className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">
                    {term.section_order}. {term.section_name}
                  </h4>
                  <div 
                    className="text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: term.content }}
                  />
                </div>
              ))}
              
              {terms.length > 0 && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openFullTerms}
                    className="w-full gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read Complete Terms & Conditions
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 border-t bg-background p-4 space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-acceptance"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
                disabled={!hasScrolledToEnd}
                className="mt-0.5"
              />
              <label
                htmlFor="terms-acceptance"
                className={`text-sm leading-tight ${
                  hasScrolledToEnd ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                I have read the terms carefully and I agree to follow them
              </label>
            </div>

            {!hasScrolledToEnd && (
              <p className="text-xs text-muted-foreground">
                Please scroll to the end to continue
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasAccepted || !hasScrolledToEnd || loading}
                className="flex-1"
              >
                {loading ? 'Accepting...' : 'Accept & Continue'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}