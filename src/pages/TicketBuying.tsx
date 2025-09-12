import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingCart, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";
import { generateAndDownloadTicket, type SerialConfig } from "@/lib/generateTicketImage";

interface SelectedTicket {
  id: string;
  number: number;
}

export default function TicketBuying() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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
  const [ticketPrice, setTicketPrice] = useState<number>(200); // Default fallback price
  const [gameData, setGameData] = useState<{
    title: string;
    ticket_image_url: string | null;
    ticket_serial_config: SerialConfig | null;
  } | null>(null);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
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

    // Fetch game data including ticket price and serial config
    const fetchGameData = async () => {
      if (!gameId) return;
      try {
        const { data, error } = await supabase
          .from('lottery_games')
          .select('title, ticket_price, ticket_image_url, ticket_serial_config')
          .eq('id', gameId)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          setTicketPrice(Number(data.ticket_price) || 200);
          setGameData({
            title: data.title || 'Lottery Game',
            ticket_image_url: data.ticket_image_url,
            ticket_serial_config: data.ticket_serial_config as SerialConfig || null
          });
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        // Keep the default fallback price
      }
    };

    fetchGameData();
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

      // Referral handling is now done automatically in ensure_fc_setup function
    });
  }, []);

  // Suggest discount based on 3 FC = Rs 1, only if FC >= 50
  useEffect(() => {
    const totalRs = selectedTickets.length * ticketPrice;
    if (fcBalance !== null && fcBalance >= 50) {
      const maxDiscount = Math.min(Math.floor(fcBalance / 3), totalRs);
      setSuggestedDiscountRs(maxDiscount);
      setSuggestedFcToUse(maxDiscount * 3);
    } else {
      setSuggestedDiscountRs(0);
      setSuggestedFcToUse(0);
    }
  }, [selectedTickets, fcBalance, ticketPrice]);

  const handleApplyDiscount = async () => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in to redeem Fortune Coins.", variant: "destructive" });
      return;
    }
    if (!suggestedDiscountRs || suggestedDiscountRs <= 0) return;
    
    setApplyingDiscount(true);
    try {
      // First, refresh the current FC balance to ensure accuracy
      const { data: balanceData } = await supabase
        .from('fc_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentBalance = balanceData?.balance ?? 0;
      setFcBalance(currentBalance);
      
      // Recalculate the maximum possible discount with fresh balance
      const totalRs = selectedTickets.length * ticketPrice;
      const maxPossibleDiscount = Math.min(Math.floor(currentBalance / 3), totalRs);
      
      if (maxPossibleDiscount <= 0) {
        toast({ 
          title: "Insufficient FC balance", 
          description: `You need at least 3 FC to get a discount. Current balance: ${currentBalance} FC.`,
          variant: "destructive" 
        });
        return;
      }
      
      // Just mark discount as applied - don't actually deduct FC yet
      setDiscountApplied(true);
      
      // Update the suggested values for UI consistency
      const discountToApply = Math.min(suggestedDiscountRs, maxPossibleDiscount);
      setSuggestedDiscountRs(discountToApply);
      setSuggestedFcToUse(discountToApply * 3);
      
      toast({ 
        title: "Discount will be applied", 
        description: `${discountToApply * 3} FC will be redeemed for Rs ${discountToApply} discount after purchase.` 
      });
    } catch (error: any) {
      toast({ 
        title: "Unable to prepare discount", 
        description: error.message, 
        variant: "destructive" 
      });
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
            booked_by_user_id: userId || null, // CRITICAL: Set the user ID
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

      // Now handle FC redemption if discount was applied
      if (userId && discountApplied && suggestedDiscountRs > 0) {
        try {
          // Refresh FC balance and recalculate discount
          const { data: balanceData } = await supabase
            .from('fc_balances')
            .select('balance')
            .eq('user_id', userId)
            .maybeSingle();
          
          const currentBalance = balanceData?.balance ?? 0;
          const totalRs = selectedTickets.length * ticketPrice;
          const actualDiscount = Math.min(Math.floor(currentBalance / 3), totalRs, suggestedDiscountRs);
          
          if (actualDiscount > 0) {
            const { error: redeemError } = await supabase.rpc('redeem_fc_by_rupees', { 
              discount_rupees: actualDiscount 
            });
            
            if (!redeemError) {
              toast({
                title: "Purchase Complete!",
                description: `${selectedTickets.length} ticket(s) booked! Used ${actualDiscount * 3} FC for Rs ${actualDiscount} discount.`,
              });
            } else {
              toast({
                title: "Tickets Booked Successfully",
                description: "Tickets booked but FC redemption failed. No FC was deducted.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Tickets Booked Successfully", 
              description: "Insufficient FC for discount. No FC was deducted.",
            });
          }
        } catch (fcError) {
          toast({
            title: "Tickets Booked Successfully",
            description: "Tickets booked but FC redemption encountered an error. No FC was deducted.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: `${selectedTickets.length} ticket(s) booked successfully!`,
        });
      }

      try {
        if (userId) {
          const prices = selectedTickets.map(() => ticketPrice);
          await supabase.rpc('award_purchase_bonus', { ticket_prices: prices });
          await supabase.rpc('award_referrer_bonus_if_applicable');
        }
      } catch (e) {
        console.error('FC award error', e);
      }

      // Tickets available for download in MyTickets page

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

  const totalPriceRs = selectedTickets.length * ticketPrice;

  // Calculate FC reward that will be earned from this purchase
  const calculateFcReward = (price: number): number => {
    if (price >= 1000) return 30;
    if (price >= 500) return 10;
    return 0;
  };

  const totalFcReward = selectedTickets.length * calculateFcReward(ticketPrice);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-4 md:py-8">
      <div className="max-w-2xl mx-auto px-3 md:px-6">
        {/* Header */}
        {!isMobile && (
          <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/lottery/${gameId}`)}
              className="border-border/50 hover:bg-card/50"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-sm">Back</span>
            </Button>
          </div>
        )}

        {/* Ticket Buying Form */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-4 md:pb-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 md:w-6 h-5 md:h-6 text-lottery-gold" />
              <CardTitle className="text-lg md:text-2xl font-bold">Buy Tickets</CardTitle>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Complete your purchase for {selectedTickets.length} ticket(s): {selectedTickets.map(t => `#${t.number}`).join(', ')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Selected Tickets Summary */}
            <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm md:text-base">Order Summary</h3>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span>Tickets ({selectedTickets.length}):</span>
                <span className="text-right">{selectedTickets.map(t => `#${t.number}`).join(', ')}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm mb-1">
                <span>Subtotal:</span>
                <span>Rs {totalPriceRs}</span>
              </div>
              {discountApplied && suggestedDiscountRs > 0 && (
                <div className="flex justify-between text-xs md:text-sm mb-1 text-green-600">
                  <span>FC Discount Applied:</span>
                  <span>- Rs {suggestedDiscountRs}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm md:text-base border-t border-border/30 pt-2">
                <span>Total Payable:</span>
                <span className="text-lottery-gold">Rs {discountApplied ? (totalPriceRs - suggestedDiscountRs) : totalPriceRs}</span>
              </div>
            </div>

            {/* FC Tip and Discount */}
            <div className="bg-card/50 border border-border/30 p-3 md:p-4 rounded-lg">
              <div className="flex items-start gap-2 md:gap-3">
                <img src={fcCoin} alt="Fortune Coin (FC) icon" className="w-5 md:w-6 h-5 md:h-6 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm">
                  {!userId && (
                    <p className="text-muted-foreground">Sign in to earn and redeem Fortune Coins (FC).</p>
                  )}
                  {userId && fcBalance === null && (
                    <p className="text-muted-foreground">Checking your FC balance...</p>
                  )}
                  {userId && fcBalance !== null && fcBalance < 50 && (
                    <p className="text-muted-foreground">You have <span className="font-semibold">{fcBalance}</span> FC. Minimum 50 FC required for discounts.</p>
                  )}
                  {userId && fcBalance !== null && fcBalance >= 50 && (
                    <p>You have <span className="font-semibold">{fcBalance}</span> FC. Use <span className="font-semibold">{suggestedFcToUse}</span> for instant <span className="font-semibold">Rs {suggestedDiscountRs}</span> discount.</p>
                  )}
                </div>
              </div>
              {userId && suggestedDiscountRs > 0 && !discountApplied && (
                <Button size="sm" className="mt-2 md:mt-3 text-xs md:text-sm" onClick={handleApplyDiscount} disabled={applyingDiscount}>
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

            {/* FC Reward Message */}
            {totalFcReward > 0 && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 md:p-4 rounded-lg">
                <div className="flex items-center gap-2 md:gap-3">
                  <img src={fcCoin} alt="Fortune Coin (FC) icon" className="w-5 md:w-6 h-5 md:h-6 flex-shrink-0" />
                  <p className="text-sm md:text-base font-semibold text-green-700 dark:text-green-300">
                    {!userId ? "Sign in first to Get FC back on ticket purchase" : `Congratulations! You will get ${totalFcReward} FC for this purchase`}
                  </p>
                </div>
              </div>
            )}

            {/* Buy Button */}
            <Button 
              onClick={handleBuyTickets}
              disabled={loading || !formData.name || !formData.address || !formData.contactNumber}
              className="w-full bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground text-sm md:text-base"
              size="lg"
            >
              {loading ? "Processing..." : `Buy Tickets - Rs ${discountApplied ? (totalPriceRs - suggestedDiscountRs) : totalPriceRs}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}