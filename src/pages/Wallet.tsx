import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Plus, Gift, Users, Wallet as WalletIcon, Sparkles, Check, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";

export default function Wallet() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fcPackages = [
    { amount: 100, price: 33, popular: false, label: "Starter" },
    { amount: 300, price: 100, popular: true, label: "Popular" },
    { amount: 500, price: 167, popular: false, label: "Value" },
    { amount: 1000, price: 333, popular: false, label: "Elite" }
  ];

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      setUser(session.user);
      await Promise.all([
        loadFcBalance(session.user.id),
        loadReferralCode(session.user.id)
      ]);
      setInitialLoading(false);
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadFcBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('fc_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();
      if (!error && data) setFcBalance(data.balance);
    } catch (error) {
      console.error('Error loading FC balance:', error);
    }
  };

  const loadReferralCode = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', userId)
        .single();
      if (!error && data?.referral_code) setReferralCode(data.referral_code);
    } catch (error) {
      console.error('Error loading referral code:', error);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({
      title: "Referral link copied!",
      description: "Share and earn 100 FC for each friend's first purchase.",
    });
  };

  const handleFcPurchase = async (amount: number) => {
    if (!user) return;
    setLoading(true);
    setPurchasingId(amount);
    try {
      const { data, error } = await supabase.rpc('purchase_fc', {
        amount_fc: amount,
        payment_details: { method: 'demo', package: amount }
      });
      if (error) throw error;
      toast({
        title: "FC Purchase Successful!",
        description: `You purchased ${amount} FC. New balance: ${data[0]?.new_balance || 0} FC.`,
      });
      await loadFcBalance(user.id);
    } catch (error) {
      console.error('Error purchasing FC:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPurchasingId(null);
    }
  };

  const handleCustomPurchase = async () => {
    const amount = parseInt(customAmount);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount (minimum 1 FC).",
        variant: "destructive",
      });
      return;
    }
    await handleFcPurchase(amount);
    setCustomAmount("");
  };

  const equivalentValue = Math.round((fcBalance / 3) * 100) / 100;

  return (
    <div className="min-h-screen relative font-['Manrope']">
      {/* Ambient gold spot (matches Home) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.6), transparent 60%)' }}
        />
        <div
          className="absolute top-[40%] -left-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.5), transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="home-eyebrow">Fortune Wallet</div>
            <h1 className="home-section-title text-2xl md:text-3xl leading-tight">My Wallet</h1>
          </div>
        </div>

        {/* Balance Summary Card */}
        {initialLoading ? (
          <Skeleton className="h-40 rounded-[24px]" />
        ) : (
          <section
            className="relative rounded-[24px] p-5 md:p-7 overflow-hidden animate-fade-in-up"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.55), hsl(var(--noir-deep)/0.75))',
              border: '1px solid hsl(var(--noir-gold)/0.28)',
              boxShadow: '0 12px 36px -18px hsl(0 0% 0% / 0.65)'
            }}
          >
            <div
              className="absolute -top-16 -right-10 w-52 h-52 rounded-full blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.55), transparent 60%)' }}
            />
            <div className="relative flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'hsl(var(--noir-charcoal))',
                  border: '1px solid hsl(var(--noir-gold)/0.35)',
                  boxShadow: '0 8px 20px -8px hsl(var(--noir-gold)/0.35)'
                }}
              >
                <img src={fcCoin} alt="FC" className="w-11 h-11" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="home-eyebrow mb-1 flex items-center gap-1.5">
                  <WalletIcon className="w-3 h-3" style={{ color: 'hsl(var(--noir-gold))' }} />
                  Current Balance
                </div>
                <div
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                  style={{ color: 'hsl(var(--noir-gold))' }}
                >
                  {fcBalance.toLocaleString()}
                  <span className="text-base md:text-lg font-semibold ml-1.5" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
                    FC
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--noir-cream)/0.65)' }}>
                  ≈ ₹{equivalentValue.toLocaleString()} discount value
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 flex items-start gap-2 text-xs" style={{ borderTop: '1px solid hsl(var(--noir-cream)/0.08)', color: 'hsl(var(--noir-cream)/0.75)' }}>
              <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--noir-gold))' }} />
              <span>3 FC = ₹1 discount when purchasing tickets. Redeem instantly at checkout.</span>
            </div>
          </section>
        )}

        {/* Purchase Packages */}
        <section
          className="relative rounded-[24px] p-4 md:p-7 overflow-hidden animate-fade-in-up"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.28), hsl(var(--noir-deep)/0.6))',
            border: '1px solid hsl(var(--noir-gold)/0.18)',
            boxShadow: '0 10px 32px -18px hsl(0 0% 0% / 0.55)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="min-w-0">
              <div className="home-eyebrow">Top Up</div>
              <h2 className="home-section-title text-xl md:text-2xl">Purchase Packages</h2>
            </div>
            <span className="home-tier-pill flex-shrink-0">
              <span className="dot" />
              FC Store
            </span>
          </div>

          {initialLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-[18px]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {fcPackages.map((pkg) => (
                <div
                  key={pkg.amount}
                  className="relative rounded-[18px] p-4 flex flex-col items-center text-center transition-transform active:scale-[0.98]"
                  style={{
                    background: pkg.popular
                      ? 'linear-gradient(180deg, hsl(var(--noir-gold)/0.10), hsl(var(--noir-mid)/0.55))'
                      : 'hsl(var(--noir-charcoal)/0.55)',
                    border: pkg.popular
                      ? '1px solid hsl(var(--noir-gold)/0.55)'
                      : '1px solid hsl(var(--noir-gold)/0.15)',
                    boxShadow: pkg.popular
                      ? '0 10px 28px -12px hsl(var(--noir-gold)/0.35)'
                      : '0 6px 18px -12px hsl(0 0% 0% / 0.5)'
                  }}
                >
                  {pkg.popular && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
                      style={{
                        background: 'linear-gradient(180deg, hsl(var(--noir-gold-soft)), hsl(var(--noir-gold)))',
                        color: 'hsl(var(--noir-deep))'
                      }}
                    >
                      BEST VALUE
                    </span>
                  )}
                  <div className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'hsl(var(--noir-cream)/0.65)' }}>
                    {pkg.label}
                  </div>
                  <img src={fcCoin} alt="FC" className="w-8 h-8 mb-2" />
                  <div className="text-lg md:text-xl font-extrabold" style={{ color: 'hsl(var(--noir-gold))' }}>
                    {pkg.amount} FC
                  </div>
                  <div className="text-sm md:text-base font-semibold mt-0.5 mb-3" style={{ color: 'hsl(var(--noir-cream))' }}>
                    ₹{pkg.price}
                  </div>
                  <button
                    onClick={() => handleFcPurchase(pkg.amount)}
                    disabled={loading}
                    className="home-gold-btn w-full text-xs disabled:opacity-60"
                  >
                    {purchasingId === pkg.amount ? "Processing..." : "Purchase"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Amount */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid hsl(var(--noir-cream)/0.08)' }}>
            <Label htmlFor="custom-amount" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--noir-cream)/0.75)' }}>
              Custom Amount
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter FC amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                className="text-sm"
              />
              <button
                onClick={handleCustomPurchase}
                disabled={loading || !customAmount}
                className="home-gold-btn text-xs whitespace-nowrap disabled:opacity-60"
              >
                {loading && !purchasingId ? "..." : "Purchase"}
              </button>
            </div>
          </div>
        </section>

        {/* Referral Section */}
        <section
          id="referral-section"
          className="relative rounded-[24px] p-4 md:p-7 overflow-hidden animate-fade-in-up scroll-mt-[72px]"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.28), hsl(var(--noir-deep)/0.6))',
            border: '1px solid hsl(var(--noir-gold)/0.18)',
            boxShadow: '0 10px 32px -18px hsl(0 0% 0% / 0.55)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="min-w-0">
              <div className="home-eyebrow">Earn Together</div>
              <h2 className="home-section-title text-xl md:text-2xl">Referral Program</h2>
            </div>
            <span className="home-tier-pill flex-shrink-0">
              <span className="dot" />
              +100 FC
            </span>
          </div>

          {initialLoading ? (
            <Skeleton className="h-32 rounded-[18px]" />
          ) : (
            <>
              <Label htmlFor="referral-link" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--noir-cream)/0.75)' }}>
                Your Referral Link
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="referral-link"
                  value={`${window.location.origin}?ref=${referralCode}`}
                  readOnly
                  className="text-xs md:text-sm"
                />
                <button
                  onClick={copyReferralLink}
                  className="home-gold-btn flex items-center gap-1.5 text-xs whitespace-nowrap"
                  aria-label="Copy referral link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* How it works rows */}
              <div className="mt-5 space-y-2.5">
                {[
                  { icon: Share2, title: "Share your link", desc: "Send it to friends across any app." },
                  { icon: UserPlus, title: "They sign up", desc: "New user joins using your link." },
                  { icon: Gift, title: "You earn 100 FC", desc: "Credited on their first purchase." },
                  { icon: ShieldCheck, title: "No limits", desc: "Refer as many friends as you like." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 p-3 rounded-[14px]"
                    style={{
                      background: 'hsl(var(--noir-charcoal)/0.45)',
                      border: '1px solid hsl(var(--noir-gold)/0.12)'
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(var(--noir-mid))',
                        border: '1px solid hsl(var(--noir-gold)/0.3)'
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: 'hsl(var(--noir-gold))' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight" style={{ color: 'hsl(var(--noir-cream))' }}>
                        {title}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--noir-cream)/0.65)' }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
