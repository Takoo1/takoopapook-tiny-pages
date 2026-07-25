import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, ShieldCheck, Sparkles, Ticket, User, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useTermsContext } from "@/contexts/TermsContext";
const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";
import { type SerialConfig } from "@/lib/generateTicketImage";

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
  const { checkAcceptance } = useTermsAcceptance();
  const { showTermsPopup } = useTermsContext();

  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [formData, setFormData] = useState({ name: '', address: '', contactNumber: '', optionalContact: '' });
  const [loading, setLoading] = useState(false);
  const [fcBalance, setFcBalance] = useState<number | null>(null);
  const [suggestedDiscountRs, setSuggestedDiscountRs] = useState(0);
  const [suggestedFcToUse, setSuggestedFcToUse] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(200);
  const [gameData, setGameData] = useState<{
    title: string;
    ticket_image_url: string | null;
    ticket_serial_config: SerialConfig | null;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const tickets = location.state?.selectedTickets || [];
    if (tickets.length === 0) {
      toast({ title: "No tickets selected", description: "Please select tickets before proceeding to buy.", variant: "destructive" });
      navigate(`/lottery/${gameId}`);
      return;
    }
    setSelectedTickets(tickets);

    const fetchGameData = async () => {
      if (!gameId) return;
      try {
        const { data, error } = await supabase
          .from('lottery_games')
          .select('title, ticket_price, ticket_image_url, ticket_serial_config')
          .eq('id', gameId).maybeSingle();
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
      }
    };
    fetchGameData();
  }, [location.state, gameId, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      try { await supabase.rpc('ensure_fc_setup'); } catch {}
      try {
        const { data } = await supabase.from('fc_balances').select('balance').eq('user_id', uid).maybeSingle();
        setFcBalance(data?.balance ?? 0);
      } catch {}
    });
  }, []);

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
      const { data: balanceData } = await supabase.from('fc_balances').select('balance').eq('user_id', userId).maybeSingle();
      const currentBalance = balanceData?.balance ?? 0;
      setFcBalance(currentBalance);
      const totalRs = selectedTickets.length * ticketPrice;
      const maxPossibleDiscount = Math.min(Math.floor(currentBalance / 3), totalRs);
      if (maxPossibleDiscount <= 0) {
        toast({ title: "Insufficient FC balance", description: `You need at least 3 FC to get a discount. Current balance: ${currentBalance} FC.`, variant: "destructive" });
        return;
      }
      setDiscountApplied(true);
      const discountToApply = Math.min(suggestedDiscountRs, maxPossibleDiscount);
      setSuggestedDiscountRs(discountToApply);
      setSuggestedFcToUse(discountToApply * 3);
      toast({ title: "Discount will be applied", description: `${discountToApply * 3} FC will be redeemed for Rs ${discountToApply} discount after purchase.` });
    } catch (error: any) {
      toast({ title: "Unable to prepare discount", description: error.message, variant: "destructive" });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!formData.name || !formData.address || !formData.contactNumber) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!userId) {
      const hasAccepted = await checkAcceptance('ticket_purchase');
      if (!hasAccepted) {
        showTermsPopup('ticket_purchase', [1, 3, 10], () => proceedWithPurchase(), "Terms & Conditions - Ticket Purchase");
        return;
      }
    }
    proceedWithPurchase();
  };

  const proceedWithPurchase = async () => {
    setLoading(true);
    try {
      const updates = selectedTickets.map(ticket =>
        supabase.from('lottery_tickets').update({
          status: 'sold_online',
          booked_by_user_id: userId || null,
          booked_by_name: formData.name,
          booked_by_address: formData.address,
          booked_by_phone: formData.contactNumber,
          booked_by_email: formData.optionalContact || null,
          booked_at: new Date().toISOString()
        }).eq('id', ticket.id).eq('status', 'available')
      );
      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);
      if (hasError) throw new Error("Failed to book some tickets");

      if (userId && discountApplied && suggestedDiscountRs > 0) {
        try {
          const { data: balanceData } = await supabase.from('fc_balances').select('balance').eq('user_id', userId).maybeSingle();
          const currentBalance = balanceData?.balance ?? 0;
          const totalRs = selectedTickets.length * ticketPrice;
          const actualDiscount = Math.min(Math.floor(currentBalance / 3), totalRs, suggestedDiscountRs);
          if (actualDiscount > 0) {
            const { error: redeemError } = await supabase.rpc('redeem_fc_by_rupees', { discount_rupees: actualDiscount });
            if (!redeemError) {
              toast({ title: "Purchase Complete!", description: `${selectedTickets.length} ticket(s) booked! Used ${actualDiscount * 3} FC for Rs ${actualDiscount} discount.` });
            } else {
              toast({ title: "Tickets Booked Successfully", description: "Tickets booked but FC redemption failed. No FC was deducted.", variant: "destructive" });
            }
          } else {
            toast({ title: "Tickets Booked Successfully", description: "Insufficient FC for discount. No FC was deducted." });
          }
        } catch (fcError) {
          toast({ title: "Tickets Booked Successfully", description: "Tickets booked but FC redemption encountered an error. No FC was deducted.", variant: "destructive" });
        }
      } else {
        toast({ title: "Success!", description: `${selectedTickets.length} ticket(s) booked successfully!` });
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
      navigate(`/lottery/${gameId}`);
    } catch (error) {
      console.error('Error booking tickets:', error);
      toast({ title: "Error", description: "Failed to book tickets. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalPriceRs = selectedTickets.length * ticketPrice;
  const calculateFcReward = (price: number): number => {
    if (price >= 1000) return 30;
    if (price >= 500) return 10;
    return 0;
  };
  const totalFcReward = selectedTickets.length * calculateFcReward(ticketPrice);
  const finalPayable = discountApplied ? (totalPriceRs - suggestedDiscountRs) : totalPriceRs;
  const canSubmit = !!formData.name && !!formData.address && !!formData.contactNumber;

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Desktop back header */}
      {!isMobile && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/lottery/${gameId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-40 space-y-4">
        {/* Header Card */}
        <Card className="rounded-[20px] p-5 border border-border/60 bg-gradient-to-br from-lottery-gold/8 via-card to-card">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-lottery-gold/15 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-lottery-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Checkout</div>
              <h1 className="text-lg font-bold text-foreground truncate">
                {gameData?.title || 'Buy Tickets'}
              </h1>
            </div>
          </div>
        </Card>

        {/* Order Summary Card */}
        <Card className="rounded-[20px] p-5 border border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Order Summary</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              <Ticket className="w-3 h-3" /> {selectedTickets.length}
            </span>
          </div>

          {/* Selected numbers */}
          <div className="rounded-xl bg-muted/40 border border-border/40 p-3 mb-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Ticket Numbers</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTickets.map(t => (
                <span key={t.id} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-background border border-border/60 text-xs font-semibold tabular-nums">
                  #{t.number}
                </span>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({selectedTickets.length} × ₹{ticketPrice})</span>
              <span className="tabular-nums text-foreground font-medium">₹{totalPriceRs}</span>
            </div>
            {discountApplied && suggestedDiscountRs > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>FC Discount ({suggestedFcToUse} FC)</span>
                <span className="tabular-nums font-medium">− ₹{suggestedDiscountRs}</span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-foreground">Total Payable</span>
              <span className="text-2xl font-extrabold text-gold-shimmer tabular-nums">₹{finalPayable}</span>
            </div>
          </div>
        </Card>

        {/* FC Discount Card */}
        {(userId || fcBalance === null) && (
          <Card className="rounded-[20px] p-5 border border-border/60 bg-gradient-to-br from-lottery-gold/6 to-transparent">
            <div className="flex items-start gap-3">
              <img src={fcCoin} alt="Fortune Coin" className="w-9 h-9 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Fortune Coins</div>
                {!userId && (
                  <p className="text-sm text-foreground mt-0.5">Sign in to earn and redeem Fortune Coins.</p>
                )}
                {userId && fcBalance === null && (
                  <Skeleton className="h-4 w-40 mt-1" />
                )}
                {userId && fcBalance !== null && fcBalance < 50 && (
                  <p className="text-sm text-foreground mt-0.5">
                    Balance: <span className="font-bold">{fcBalance} FC</span> · Need ≥ 50 FC for a discount.
                  </p>
                )}
                {userId && fcBalance !== null && fcBalance >= 50 && (
                  <p className="text-sm text-foreground mt-0.5">
                    Balance: <span className="font-bold">{fcBalance} FC</span>. Use <span className="font-bold">{suggestedFcToUse}</span> for ₹{suggestedDiscountRs} instant discount.
                  </p>
                )}
              </div>
            </div>
            {userId && suggestedDiscountRs > 0 && !discountApplied && (
              <Button size="sm" onClick={handleApplyDiscount} disabled={applyingDiscount}
                className="w-full mt-3 rounded-2xl h-11 bg-lottery-gold hover:bg-lottery-gold/90 text-black font-semibold">
                {applyingDiscount ? 'Applying…' : `Apply ₹${suggestedDiscountRs} FC Discount`}
              </Button>
            )}
            {discountApplied && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Discount applied
              </div>
            )}
          </Card>
        )}

        {/* Buyer Details Card */}
        <Card className="rounded-[20px] p-5 border border-border/60">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Buyer Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name *
              </Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name" />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Address *
              </Label>
              <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address" rows={3} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="contactNumber" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Contact Number *
                </Label>
                <Input id="contactNumber" inputMode="tel" value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter your phone number" />
              </div>
              <div>
                <Label htmlFor="optionalContact" className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input id="optionalContact" type="email" value={formData.optionalContact}
                  onChange={(e) => handleInputChange('optionalContact', e.target.value)}
                  placeholder="Enter your email" />
              </div>
            </div>
          </div>
        </Card>

        {/* FC Reward Chip */}
        {totalFcReward > 0 && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 flex items-center gap-3">
            <img src={fcCoin} alt="FC" className="w-8 h-8 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {!userId
                ? "Sign in first to earn FC back on this purchase"
                : `You'll earn ${totalFcReward} FC on this purchase`}
            </p>
          </div>
        )}

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure booking · Verified organiser
        </div>
      </div>

      {/* Sticky Purchase Bar */}
      <div className={`fixed left-0 right-0 z-30 px-4 pb-3 pt-2 ${isMobile ? 'bottom-16' : 'bottom-0'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-background/90 backdrop-blur-xl border border-border/60 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.25)] p-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Total {discountApplied && suggestedDiscountRs > 0 ? '(after discount)' : ''}
              </div>
              <div className="text-lg font-bold text-gold-shimmer leading-tight tabular-nums">
                ₹{finalPayable}
              </div>
            </div>
            <Button
              onClick={handleBuyTickets}
              disabled={loading || !canSubmit}
              className="flex-1 h-12 rounded-2xl font-semibold bg-lottery-gold hover:bg-lottery-gold/90 text-black shadow-lg disabled:opacity-60"
              size="lg"
            >
              {loading ? 'Processing…' : `Pay ₹${finalPayable}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
