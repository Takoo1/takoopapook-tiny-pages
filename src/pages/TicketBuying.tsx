import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import fcCoin from "@/assets/fc-coin.png";

interface SelectedTicket {
  id: string;
  number: number;
}

export default function TicketBuying() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    optionalContact: ''
  });
  const [loading, setLoading] = useState(false);

  const [fcBalance, setFcBalance] = useState<number | null>(null);
  const [suggestedDiscountRs, setSuggestedDiscountRs] = useState(0);
  const [suggestedFcToUse, setSuggestedFcToUse] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get selected tickets from location state
    const tickets = location.state?.selectedTickets || [];
    if (tickets.length === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select tickets before proceeding to buy.",
        variant: "destructive",
      });
      navigate(`/lottery/${gameId}`);
      return;
    }
    setSelectedTickets(tickets);
  }, [location.state, gameId, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Initialize FC for signed-in user and capture referral
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;

      try { await supabase.rpc('ensure_fc_setup'); } catch {}

      try {
        const { data } = await supabase
          .from('fc_balances')
          .select('balance')
          .eq('user_id', uid)
          .maybeSingle();
        setFcBalance(data?.balance ?? 0);
      } catch {}

      try {
        const ref = localStorage.getItem('ref_code');
        if (ref) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('referral_code', ref)
            .maybeSingle();
          if (referrer && referrer.user_id !== uid) {
            await supabase
              .from('profiles')
              .update({ referred_by_user_id: referrer.user_id })
              .eq('user_id', uid);
          }
        }
      } catch {}
    });
  }, []);

  // Suggest discount based on 3 FC = Rs 1
  useEffect(() => {
    const totalRs = selectedTickets.length * 200; // Assume Rs 200 per ticket (example)
    if (fcBalance !== null) {
      const maxDiscount = Math.min(Math.floor(fcBalance / 3), totalRs);
      setSuggestedDiscountRs(maxDiscount);
      setSuggestedFcToUse(maxDiscount * 3);
    }
  }, [selectedTickets, fcBalance]);

  const handleApplyDiscount = async () => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in to redeem Fortune Coins.", variant: "destructive" });
      return;
    }
    if (!suggestedDiscountRs || suggestedDiscountRs <= 0) return;
    setApplyingDiscount(true);
    try {
      const { data, error } = await supabase.rpc('redeem_fc_by_rupees', { discount_rupees: suggestedDiscountRs });
      if (error) throw error;
      const newBal = Array.isArray(data) && data.length ? (data as any)[0].new_balance : (fcBalance ?? 0) - suggestedFcToUse;
      setFcBalance(newBal);
      setDiscountApplied(true);
      toast({ title: "Discount applied", description: `Used ${suggestedFcToUse} FC for Rs ${suggestedDiscountRs} discount.` });
    } catch (error: any) {
      toast({ title: "Unable to apply discount", description: error.message, variant: "destructive" });
    } finally {
      setApplyingDiscount(false);
    }
  };
  const handleBuyTickets = async () => {
    if (!formData.name || !formData.address || !formData.contactNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update all selected tickets
      // Update tickets to sold_online status - only if they're still available
      const updates = selectedTickets.map(ticket => 
        supabase
          .from('lottery_tickets')
          .update({
            status: 'sold_online',
            booked_by_name: formData.name,
            booked_by_address: formData.address,
            booked_by_phone: formData.contactNumber,
            booked_by_email: formData.optionalContact || null,
            booked_at: new Date().toISOString()
          })
          .eq('id', ticket.id)
          .eq('status', 'available') // Prevent double booking
      );

      const results = await Promise.all(updates);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error("Failed to book some tickets");
      }

      toast({
        title: "Success!",
        description: `${selectedTickets.length} ticket(s) booked successfully!`,
      });

      try {
        if (userId) {
          const prices = selectedTickets.map(() => 200);
          await supabase.rpc('award_purchase_bonus', { ticket_prices: prices });
          await supabase.rpc('award_referrer_bonus_if_applicable');
        }
      } catch (e) {
        console.error('FC award error', e);
      }

      navigate(`/lottery/${gameId}`);
    } catch (error) {
      console.error('Error booking tickets:', error);
      toast({
        title: "Error",
        description: "Failed to book tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedTickets.length * 10; // Assuming $10 per ticket, you may want to get actual price

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/lottery/${gameId}`)}
            className="border-border/50 hover:bg-card/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </div>

        {/* Ticket Buying Form */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-lottery-gold" />
              <CardTitle className="text-2xl font-bold">Buy Tickets</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Complete your purchase for {selectedTickets.length} ticket(s): {selectedTickets.map(t => `#${t.number}`).join(', ')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Tickets Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm mb-2">
                <span>Tickets ({selectedTickets.length}):</span>
                <span>{selectedTickets.map(t => `#${t.number}`).join(', ')}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-lottery-gold">${totalPrice}</span>
              </div>
            </div>

            {/* FC Tip and Discount */}
            <div className="bg-card/50 border border-border/30 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={fcCoin} alt="Fortune Coin (FC) icon" className="w-6 h-6" />
                <div className="text-sm">
                  {!userId && (
                    <p className="text-muted-foreground">Sign in to earn and redeem Fortune Coins (FC).</p>
                  )}
                  {userId && fcBalance === null && (
                    <p className="text-muted-foreground">Checking your FC balance...</p>
                  )}
                  {userId && fcBalance !== null && (
                    <p>You have <span className="font-semibold">{fcBalance}</span> FC. Use <span className="font-semibold">{suggestedFcToUse}</span> for instant <span className="font-semibold">Rs {suggestedDiscountRs}</span> discount.</p>
                  )}
                </div>
              </div>
              {userId && suggestedDiscountRs > 0 && !discountApplied && (
                <Button size="sm" className="mt-3" onClick={handleApplyDiscount} disabled={applyingDiscount}>
                  {applyingDiscount ? 'Applying...' : `Apply Rs ${suggestedDiscountRs} discount`}
                </Button>
              )}
              {discountApplied && (
                <p className="text-xs text-muted-foreground mt-2">Discount applied using FC.</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-sm font-medium">
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="optionalContact" className="text-sm font-medium">
                  Optional Contact (Email)
                </Label>
                <Input
                  id="optionalContact"
                  value={formData.optionalContact}
                  onChange={(e) => handleInputChange('optionalContact', e.target.value)}
                  placeholder="Enter your email (optional)"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Buy Button */}
            <Button 
              onClick={handleBuyTickets}
              disabled={loading || !formData.name || !formData.address || !formData.contactNumber}
              className="w-full bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground"
              size="lg"
            >
              {loading ? "Processing..." : `Buy Tickets - $${totalPrice}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}