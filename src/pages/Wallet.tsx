import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Plus, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import fcCoin from "@/assets/fc-coin.png";

export default function Wallet() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fcPackages = [
    { amount: 100, price: 33, popular: false },
    { amount: 300, price: 100, popular: true },
    { amount: 500, price: 167, popular: false },
    { amount: 1000, price: 333, popular: false }
  ];

  useEffect(() => {
    // Check auth and load data
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
    };

    loadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/');
      }
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

      if (!error && data) {
        setFcBalance(data.balance);
      }
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

      if (!error && data?.referral_code) {
        setReferralCode(data.referral_code);
      }
    } catch (error) {
      console.error('Error loading referral code:', error);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral link copied!",
      description: "Share this link to earn 100 FC for each friend who signs up and makes their first purchase.",
    });
  };

  const handleFcPurchase = async (amount: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('purchase_fc', {
        amount_fc: amount,
        payment_details: { method: 'demo', package: amount }
      });

      if (error) throw error;

      toast({
        title: "FC Purchase Successful!",
        description: `You purchased ${amount} FC. Your new balance is ${data[0]?.new_balance || 0} FC.`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>
            <p className="text-muted-foreground">Manage your Fortune Coins (FC)</p>
          </div>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <img src={fcCoin} alt="FC" className="w-12 h-12" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {fcBalance.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Fortune Coins (FC)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase FC Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Purchase FC Packages
            </CardTitle>
            <CardDescription>
              Get Fortune Coins to participate in lotteries. 3 FC = ₹1 discount when buying tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {fcPackages.map((pkg) => (
                <Card 
                  key={pkg.amount} 
                  className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {pkg.amount} FC
                    </div>
                    <div className="text-xl font-semibold mb-4">
                      ₹{pkg.price}
                    </div>
                    <Button 
                      onClick={() => handleFcPurchase(pkg.amount)}
                      disabled={loading}
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      {loading ? "Processing..." : "Purchase"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="border-t pt-4">
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Or purchase a custom amount:
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter FC amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                />
                <Button 
                  onClick={handleCustomPurchase}
                  disabled={loading || !customAmount}
                >
                  Purchase
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral System */}
        <Card id="referral-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral Program
            </CardTitle>
            <CardDescription>
              Earn 100 FC for each friend who signs up and makes their first purchase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="referral-link" className="text-sm font-medium">
                  Your Referral Link:
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="referral-link"
                    value={`${window.location.origin}?ref=${referralCode}`}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-primary">How it works:</div>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Share your referral link with friends</li>
                      <li>• They sign up using your link</li>
                      <li>• When they make their first purchase, you earn 100 FC</li>
                      <li>• No limit on referrals!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}