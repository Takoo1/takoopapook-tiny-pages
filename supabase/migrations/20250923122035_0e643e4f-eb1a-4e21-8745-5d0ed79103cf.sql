-- Add policy_type column to site_terms table
ALTER TABLE public.site_terms 
ADD COLUMN policy_type TEXT NOT NULL DEFAULT 'terms';

-- Update existing records to have 'terms' as policy type
UPDATE public.site_terms 
SET policy_type = 'terms' 
WHERE policy_type = 'terms';

-- Create index for better performance on policy type queries
CREATE INDEX idx_site_terms_policy_type ON public.site_terms(policy_type);

-- Insert default content for other policy types
INSERT INTO public.site_terms (section_name, section_order, policy_type, content, is_active) VALUES
-- Privacy Policy sections
('Introduction', 1, 'privacy', 'This Privacy Policy describes how Fortune Bridge ("we", "us", or "our") collects, uses, and protects your personal information when you use our lottery platform and services.', true),
('Information We Collect', 2, 'privacy', 'We collect information you provide directly to us, such as when you create an account, purchase tickets, or contact us. This may include your name, email address, phone number, and payment information.', true),
('How We Use Your Information', 3, 'privacy', 'We use your information to provide our services, process transactions, send communications about your account or transactions, and improve our platform.', true),
('Information Sharing', 4, 'privacy', 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.', true),
('Data Security', 5, 'privacy', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.', true),
('Contact Us', 6, 'privacy', 'If you have any questions about this Privacy Policy, please contact us at privacy@fortunebridge.online', true),

-- Cancellation & Refund Policy sections  
('Ticket Cancellation Policy', 1, 'refund', 'Lottery tickets purchased through Fortune Bridge are generally non-refundable once the purchase is complete and confirmed.', true),
('Refund Eligibility', 2, 'refund', 'Refunds may be considered only in the following circumstances: technical errors during purchase, cancelled games by organizers, or duplicate transactions.', true),
('Refund Process', 3, 'refund', 'To request a refund for eligible transactions, contact our support team within 24 hours of purchase with your transaction details.', true),
('Processing Time', 4, 'refund', 'Eligible refunds will be processed within 7-10 business days to the original payment method used for the purchase.', true),
('Game Cancellations', 5, 'refund', 'If a lottery game is cancelled by the organizer, all participants will receive a full refund automatically within 5-7 business days.', true),
('Contact for Refunds', 6, 'refund', 'For refund inquiries, please contact us at refunds@fortunebridge.online with your transaction ID and reason for refund.', true),

-- Shipping/Delivery Policy sections
('Digital Delivery', 1, 'shipping', 'Fortune Bridge operates as a digital lottery platform. All tickets are delivered electronically to your registered email address.', true),
('Ticket Generation', 2, 'shipping', 'Upon successful payment, your lottery tickets are automatically generated and sent to your email within 5-10 minutes.', true),
('Email Delivery', 3, 'shipping', 'Tickets are delivered as PDF attachments to the email address associated with your account. Please check your spam folder if you do not receive them.', true),
('Account Access', 4, 'shipping', 'You can also access your purchased tickets anytime by logging into your account and visiting the "My Tickets" section.', true),
('Delivery Issues', 5, 'shipping', 'If you experience any issues receiving your tickets, please contact our support team immediately at support@fortunebridge.online', true),
('No Physical Shipping', 6, 'shipping', 'As we provide digital services only, there is no physical shipping or delivery involved in our lottery ticket sales.', true);