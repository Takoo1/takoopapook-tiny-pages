-- Update Privacy Policy with comprehensive content
UPDATE site_terms SET content = 'Fortune Bridge Digital Services ("Fortune Bridge", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://fortunebridge.online and use our lottery platform services.

By accessing or using our services, you agree to the collection and use of information in accordance with this policy.' 
WHERE policy_type = 'privacy' AND section_name = 'Introduction';

UPDATE site_terms SET content = 'We collect several types of information:

PERSONAL INFORMATION:
- Name, email address, phone number
- Date of birth and age verification documents
- Government-issued identification for KYC compliance
- Postal address and billing information

FINANCIAL INFORMATION:
- Payment card details (processed securely through payment processors)
- Bank account information for withdrawals
- Transaction history and payment records

TECHNICAL INFORMATION:
- IP address, browser type, operating system
- Device identifiers and characteristics
- Location data (with your consent)
- Website usage patterns and preferences

COMMUNICATIONS:
- Customer service interactions
- Survey responses and feedback
- Marketing preferences and communications' 
WHERE policy_type = 'privacy' AND section_name = 'Information We Collect';

UPDATE site_terms SET content = 'We use your information for the following purposes:

SERVICE PROVISION:
- Creating and managing your account
- Processing lottery ticket purchases
- Verifying your identity and age (18+ requirement)
- Facilitating prize distributions and withdrawals

LEGAL COMPLIANCE:
- Complying with anti-money laundering (AML) laws
- Meeting know-your-customer (KYC) requirements
- Reporting to gaming authorities as required
- Maintaining records as legally mandated

COMMUNICATION:
- Sending transaction confirmations and receipts
- Providing customer support services
- Sending important service announcements
- Marketing communications (with consent)

PLATFORM IMPROVEMENT:
- Analyzing usage patterns to improve our services
- Fraud prevention and security monitoring
- Technical support and troubleshooting' 
WHERE policy_type = 'privacy' AND section_name = 'How We Use Your Information';

UPDATE site_terms SET content = 'We may share your information in the following circumstances:

WITH SERVICE PROVIDERS:
- Payment processors for secure transaction processing
- Identity verification services for KYC compliance
- Cloud hosting providers for data storage
- Customer support platforms

WITH AUTHORITIES:
- Gaming regulatory bodies as required by law
- Law enforcement agencies when legally compelled
- Tax authorities for prize reporting requirements
- Anti-money laundering authorities

BUSINESS TRANSFERS:
- In connection with mergers, acquisitions, or asset sales
- To successors or assigns of our business

We do NOT:
- Sell your personal information to third parties
- Share information for marketing purposes without consent
- Disclose information except as outlined in this policy' 
WHERE policy_type = 'privacy' AND section_name = 'Information Sharing';

UPDATE site_terms SET content = 'We implement robust security measures:

TECHNICAL SAFEGUARDS:
- SSL/TLS encryption for data transmission
- Secure servers with regular security updates
- Multi-factor authentication where applicable
- Regular security audits and penetration testing

ADMINISTRATIVE SAFEGUARDS:
- Limited access to personal information
- Employee training on data protection
- Confidentiality agreements with staff
- Incident response procedures

PHYSICAL SAFEGUARDS:
- Secure data centers with controlled access
- Environmental controls and monitoring
- Backup and disaster recovery systems

Despite these measures, no electronic transmission is 100% secure. We cannot guarantee absolute security but strive to use commercially reasonable measures to protect your information.' 
WHERE policy_type = 'privacy' AND section_name = 'Data Security';

INSERT INTO site_terms (section_name, section_order, policy_type, content) VALUES 
('Data Retention', 7, 'privacy', 'We retain your personal information for the following periods:

ACCOUNT INFORMATION:
- Active accounts: Duration of service relationship
- Closed accounts: 7 years after closure for legal compliance

TRANSACTION RECORDS:
- Financial records: 7 years for tax and regulatory compliance
- Game participation records: 5 years minimum per gaming regulations

MARKETING DATA:
- Until you unsubscribe or withdraw consent
- Anonymized analytics data: Up to 3 years

You may request account closure and data deletion, subject to legal retention requirements.'),

('Cookies and Tracking', 8, 'privacy', 'Our website uses cookies and similar technologies:

ESSENTIAL COOKIES:
- Required for website functionality
- Remember login status and preferences
- Enable secure transactions

ANALYTICS COOKIES:
- Google Analytics for website usage statistics
- Performance monitoring and optimization
- Anonymous traffic analysis

MARKETING COOKIES (with consent):
- Personalized advertising
- Social media integration
- Conversion tracking

You can manage cookie preferences in your browser settings. Disabling essential cookies may affect website functionality.'),

('Your Rights', 9, 'privacy', 'Under applicable data protection laws, you have the following rights:

ACCESS: Request copies of your personal information
CORRECTION: Update inaccurate or incomplete information
DELETION: Request removal of your data (subject to legal requirements)
PORTABILITY: Receive your data in a structured format
RESTRICTION: Limit how we process your information
OBJECTION: Opt-out of marketing communications

To exercise these rights, contact us at privacy@fortunebridge.online with proof of identity.

For EU residents: You have the right to lodge a complaint with your local data protection authority.'),

('International Transfers', 10, 'privacy', 'Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your jurisdiction.

When we transfer personal information internationally, we ensure appropriate safeguards are in place:
- Standard contractual clauses approved by regulatory authorities
- Adequacy decisions by competent authorities
- Other legally recognized transfer mechanisms

We take steps to ensure your information receives adequate protection wherever it is processed.');

UPDATE site_terms SET content = 'For questions about this Privacy Policy or our data practices, contact us:

Email: privacy@fortunebridge.online
Legal Team: legal@fortunebridge.online
Postal Address: Fortune Bridge Digital Services, Legal Department
Response Time: We respond to privacy inquiries within 48 hours

Data Protection Officer: dpo@fortunebridge.online (for EU-related inquiries)

This Privacy Policy may be updated periodically. We will notify you of material changes via email or website notice.' 
WHERE policy_type = 'privacy' AND section_name = 'Contact Us';