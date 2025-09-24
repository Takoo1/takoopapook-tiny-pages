-- Update Refund Policy with comprehensive content
UPDATE site_terms SET content = 'Fortune Bridge Digital Services operates a professional lottery platform. This Cancellation & Refund Policy outlines the terms and conditions regarding cancellations, refunds, and returns for our digital lottery services.

All ticket purchases are governed by this policy and applicable gaming regulations. By purchasing tickets, you agree to these terms.' 
WHERE policy_type = 'refund' AND section_name = 'Ticket Cancellation Policy';

UPDATE site_terms SET content = 'GENERAL POLICY:
Lottery tickets are generally non-refundable once purchased and confirmed. This is standard practice in the gaming industry to maintain game integrity.

ELIGIBLE CIRCUMSTANCES FOR REFUNDS:
1. Technical System Errors:
   - Payment processed but tickets not generated
   - System failures during transaction completion
   - Duplicate charges due to technical issues

2. Game Cancellations by Organizers:
   - Complete game cancellation before draw date
   - Organizer-initiated postponements exceeding 30 days
   - Regulatory issues preventing game completion

3. Fraud or Unauthorized Transactions:
   - Unauthorized use of payment methods
   - Identity theft or account compromise
   - Disputed transactions with valid proof

4. Legal Compliance Issues:
   - Age verification failures post-purchase
   - Jurisdiction restrictions discovered after payment
   - Regulatory compliance violations' 
WHERE policy_type = 'refund' AND section_name = 'Refund Eligibility';

UPDATE site_terms SET content = 'REFUND REQUEST PROCEDURE:
1. Contact our support team within 48 hours of purchase
2. Provide transaction ID and detailed explanation
3. Submit supporting documentation if applicable
4. Await verification and approval decision

REQUIRED INFORMATION:
- Full name and account email
- Transaction ID or reference number
- Date and time of purchase
- Reason for refund request
- Supporting evidence (if applicable)

PROCESSING TIMEFRAMES:
- Initial review: 24-48 hours
- Investigation period: 3-5 business days
- Approved refunds processed: 5-10 business days
- Complex cases: Up to 15 business days

Contact: refunds@fortunebridge.online' 
WHERE policy_type = 'refund' AND section_name = 'Refund Process';

UPDATE site_terms SET content = 'APPROVED REFUND PROCESSING:
- Refunds processed to original payment method only
- Credit/Debit cards: 5-10 business days
- Digital wallets: 3-7 business days
- Bank transfers: 7-14 business days

PROCESSING FEES:
- Technical error refunds: No processing fees
- Game cancellation refunds: No processing fees
- Customer-initiated refunds: Subject to 2.5% processing fee
- International transactions: Additional currency conversion fees may apply

PARTIAL REFUNDS:
May apply in cases of:
- Promotional tickets with terms violations
- Multi-game packages with partial eligibility
- Service fee deductions for administrative costs' 
WHERE policy_type = 'refund' AND section_name = 'Processing Time';

UPDATE site_terms SET content = 'AUTOMATIC REFUND SCENARIOS:
- Game cancelled by organizer: Full refund within 5-7 business days
- System-wide technical failures: Automatic processing initiated
- Regulatory compliance issues: Refunds processed as required by law

COMMUNICATION:
- Email notification upon game cancellation
- Refund confirmation sent within 24 hours of processing
- Customer service available for status inquiries
- Tracking reference provided for all refunds

NON-REFUNDABLE SCENARIOS:
- Change of mind after ticket confirmation
- Personal financial circumstances changes
- Misunderstanding of game rules or prizes
- Lost or forgotten login credentials
- Results dissatisfaction or losing outcomes' 
WHERE policy_type = 'refund' AND section_name = 'Game Cancellations';

INSERT INTO site_terms (section_name, section_order, policy_type, content) VALUES 
('Dispute Resolution', 7, 'refund', 'INTERNAL DISPUTE PROCESS:
1. Initial customer service review
2. Supervisor escalation if required
3. Management review for complex cases
4. Final decision communicated in writing

EXTERNAL DISPUTE RESOLUTION:
- Banking disputes through card issuer
- Consumer protection agencies
- Gaming regulatory authorities
- Legal proceedings as last resort

DOCUMENTATION:
All refund decisions are documented and available upon request. We maintain comprehensive records of all transactions and refund processing for regulatory compliance.'),

('Chargeback Policy', 8, 'refund', 'CHARGEBACK PROTECTION:
We reserve the right to dispute illegitimate chargebacks and may:
- Provide transaction evidence to payment processors
- Restrict future services for fraudulent chargebacks
- Pursue legal action for deliberate fraud

LEGITIMATE CHARGEBACKS:
We cooperate fully with legitimate chargeback investigations and provide:
- Complete transaction records
- Communication history
- Service delivery confirmation
- Refund processing documentation');

UPDATE site_terms SET content = 'REFUND CONTACT INFORMATION:
Primary Contact: refunds@fortunebridge.online
General Support: support@fortunebridge.online
Legal Inquiries: legal@fortunebridge.online

BUSINESS HOURS:
Monday - Friday: 9:00 AM - 6:00 PM (Local Time)
Saturday: 10:00 AM - 4:00 PM (Local Time)
Sunday: Closed (Emergency support available)

RESPONSE TIMEFRAMES:
- Email inquiries: 24-48 hours
- Urgent refund requests: Same business day
- Complex investigations: Up to 5 business days

This policy is subject to change. Material changes will be communicated via email and website notice 30 days prior to implementation.' 
WHERE policy_type = 'refund' AND section_name = 'Contact for Refunds';