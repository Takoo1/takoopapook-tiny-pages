import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageSquare, Send, Clock, User } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: session?.user?.id || null,
          user_session: session ? null : crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919365841168", "_blank");
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-lg md:text-2xl font-bold text-foreground">Contact Us</h1>
        <p className="text-[13px] md:text-[15px] text-muted-foreground">
          Get in touch with us for any questions, support, or feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Contact Information */}
        <div className="space-y-4 md:space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-lg font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm md:text-base font-medium text-foreground">Address</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Fortune Bridge Headquarters<br />
                    123 Business District<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm md:text-base font-medium text-foreground">Email</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    support@fortunebridge.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm md:text-base font-medium text-foreground">Phone</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    +91 98765 43210<br />
                    +91 87654 32109
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-sm md:text-base font-medium text-foreground">Business Hours</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Support */}
          <Card className="bg-gradient-to-br from-green-500/5 to-green-600/10 border-green-500/20">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-[15px] md:text-[19px] font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                </svg>
                WhatsApp Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] md:text-[13px] text-muted-foreground mb-3 md:mb-4">
                Get instant support through WhatsApp. Our team is available to help you with any queries.
              </p>
              <Button 
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-2 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                </svg>
                Chat on WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report an Issue Form */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-sm md:text-lg font-bold flex items-center gap-2">
              <Send className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs md:text-sm">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="text-xs md:text-sm h-8 md:h-10"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs md:text-sm">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="text-xs md:text-sm h-8 md:h-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs md:text-sm">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="text-xs md:text-sm h-8 md:h-10"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-xs md:text-sm">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="text-xs md:text-sm min-h-[80px] md:min-h-[120px] resize-none"
                  placeholder="Please describe your issue or feedback in detail..."
                />
              </div>

              <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/30 rounded-md">
                <User className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <p className="text-[9px] md:text-[10px] text-muted-foreground">
                  Your message will be reviewed by our team within 24 hours. 
                  For urgent matters, please use WhatsApp support.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}