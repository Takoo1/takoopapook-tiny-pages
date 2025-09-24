-- Update Shipping Policy with comprehensive content
UPDATE site_terms SET content = 'Fortune Bridge operates exclusively as a digital lottery platform. All lottery tickets are delivered electronically through our secure digital delivery system.

There are no physical products shipped. All communications, tickets, and services are provided digitally through email and our online platform.' 
WHERE policy_type = 'shipping' AND section_name = 'Digital Delivery';

UPDATE site_terms SET content = 'AUTOMATIC DIGITAL DELIVERY:
- Tickets generated instantly upon successful payment
- Delivered to registered email address within 5-10 minutes
- Backup delivery through user account dashboard
- SMS notification sent for delivery confirmation (if opted-in)

DELIVERY CONFIRMATION:
- Email receipt with ticket numbers and game details
- PDF ticket attachment with unique identifiers
- Account dashboard update with purchase history
- QR codes for ticket verification

DELIVERY TIMEFRAMES:
- Standard processing: 5-10 minutes
- High traffic periods: Up to 30 minutes
- Technical issues: Maximum 2 hours with notification
- System maintenance: Advance notice provided' 
WHERE policy_type = 'shipping' AND section_name = 'Ticket Delivery Timeframes';

INSERT INTO site_terms (section_name, section_order, policy_type, content) VALUES 
('Account Access Requirements', 3, 'shipping', 'To receive digital deliveries, you must:

EMAIL REQUIREMENTS:
- Provide valid, active email address
- Ensure inbox capacity for attachments
- Check spam/junk folders for deliveries
- Whitelist fortunebridge.online domain

ACCOUNT SECURITY:
- Maintain secure account credentials
- Enable two-factor authentication (recommended)
- Keep contact information updated
- Report access issues immediately

TECHNICAL REQUIREMENTS:
- PDF reader for ticket viewing
- Internet connection for account access
- Modern web browser for optimal experience
- Mobile device compatibility for apps'),

('Delivery Issues and Support', 4, 'shipping', 'COMMON DELIVERY ISSUES:
1. Email not received within timeframe
2. Tickets delivered to spam folder
3. PDF attachment corrupted or unreadable
4. Account access problems

IMMEDIATE ACTIONS:
- Check spam/junk/promotions folders
- Verify email address in account settings
- Try alternative email address if available
- Contact support with transaction ID

SUPPORT CONTACT:
- Email: delivery@fortunebridge.online
- Live chat: Available during business hours
- Response time: Within 2 hours for delivery issues
- Emergency support: For urgent pre-draw issues'),

('Digital Security and Authentication', 5, 'shipping', 'TICKET SECURITY FEATURES:
- Unique ticket identification numbers
- QR codes for authenticity verification  
- Digital watermarks and security features
- Blockchain-based verification (where applicable)

ANTI-FRAUD MEASURES:
- Email domain verification
- IP address monitoring for suspicious activity
- Duplicate ticket prevention systems
- Secure PDF generation with encryption

TICKET VALIDATION:
- Real-time verification through our platform
- Mobile app scanning capabilities
- Customer service verification support
- Third-party validation services available'),

('Terms of Digital Service', 6, 'shipping', 'DIGITAL DELIVERY TERMS:
- Delivery deemed complete upon successful email transmission
- Customer responsible for email accessibility and security
- No re-delivery fees for customer email issues
- Tickets remain accessible through account dashboard

SERVICE LIMITATIONS:
- No liability for email provider issues
- Customer responsible for email account security
- Delivery attempts made to registered address only
- Support provided for genuine delivery failures only

LEGAL COMPLIANCE:
- All digital communications comply with anti-spam laws
- Customer consent obtained for marketing communications
- Opt-out mechanisms provided in all emails
- Data protection compliance for all digital interactions');

UPDATE site_terms SET content = 'DIGITAL DELIVERY SUPPORT:
Primary Contact: delivery@fortunebridge.online  
Technical Support: support@fortunebridge.online
Account Issues: accounts@fortunebridge.online

24/7 EMERGENCY SUPPORT:
Available for urgent issues within 24 hours of scheduled draws:
- Phone support during business hours
- Email support monitored continuously
- Live chat for immediate assistance

RESPONSE TIMEFRAMES:
- Delivery issues: Within 2 hours
- Technical problems: Within 4 hours  
- Account access: Within 6 hours
- General inquiries: Within 24 hours

BUSINESS HOURS:
Monday - Sunday: 24/7 automated systems
Live support: 8:00 AM - 10:00 PM (Local Time)
Emergency draws: Extended support hours' 
WHERE policy_type = 'shipping' AND section_name = 'Customer Support for Delivery Issues';