-- Create site_terms table for global terms and conditions
CREATE TABLE public.site_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_terms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all site terms" 
ON public.site_terms 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active site terms" 
ON public.site_terms 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_terms_updated_at
BEFORE UPDATE ON public.site_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial 10 sections with predefined names
INSERT INTO public.site_terms (section_name, section_order, content) VALUES
('Introduction', 1, ''),
('Who we are — "We" / Fortune Bridge Agency (FBA)', 2, ''),
('Using Fortune Bridge as a Normal User (Ticket Buyer)', 3, ''),
('Using Fortune Bridge as an Organiser (Game Host)', 4, ''),
('Issue handling — common scenarios & remedies', 5, ''),
('Payments, payouts & escrow', 6, ''),
('Suspension, termination & refunds', 7, ''),
('Intellectual property', 8, ''),
('Changes to Terms', 9, ''),
('Quick checklist (what you must do)', 10, '');