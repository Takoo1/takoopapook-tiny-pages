-- Create user terms acceptance table
CREATE TABLE public.user_terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  acceptance_type text NOT NULL CHECK (acceptance_type IN ('ticket_purchase', 'organizer_access', 'user_login')),
  accepted_at timestamp with time zone DEFAULT now(),
  terms_version text DEFAULT '1.0',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own terms acceptance"
ON public.user_terms_acceptance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own terms acceptance"
ON public.user_terms_acceptance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_terms_acceptance_user_type ON public.user_terms_acceptance(user_id, acceptance_type);