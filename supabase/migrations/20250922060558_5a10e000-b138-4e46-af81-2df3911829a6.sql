-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active FAQs" 
ON public.faqs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all FAQs" 
ON public.faqs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, display_order) VALUES 
('How do I purchase lottery tickets?', 'You can purchase tickets by selecting a game, choosing your preferred ticket numbers, and completing the payment process. We accept various payment methods for your convenience.', 1),
('When are the lottery draws conducted?', 'Lottery draws are conducted on the scheduled game dates. You can view the exact date and time for each game on the game details page.', 2),
('How will I know if I win?', 'Winners will be notified via email and SMS. You can also check the winners section on our website after each draw.', 3),
('Can I cancel my ticket after purchase?', 'Ticket sales are final and cannot be cancelled once purchased. Please review your selection carefully before completing your purchase.', 4),
('What payment methods do you accept?', 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets for secure and convenient payments.', 5);