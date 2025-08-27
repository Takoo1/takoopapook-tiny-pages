import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, User, Copy, Plus } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import fcCoin from "@/assets/fc-coin.png";
import { Separator } from "@/components/ui/separator";

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const [fcBalance, setFcBalance] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [fcModalOpen, setFcModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [purchasingFc, setPurchasingFc] = useState(false);


  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => loadFcData(session.user!.id), 0);
      }
    });


    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Create profile when user signs up
        if (event === 'SIGNED_IN' && session?.user) {
          // Remove setTimeout to ensure profile creation happens immediately
          createUserProfile(session.user).then(() => {
            loadFcData(session.user.id);
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: SupabaseUser) => {
    try {
      // Store referral code from localStorage in user metadata if it exists
      const refCode = localStorage.getItem('ref_code');
      if (refCode) {
        await supabase.auth.updateUser({
          data: { ref_code: refCode }
        });
        localStorage.removeItem('ref_code'); // Clean up
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          display_name: fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const loadFcData = async (uid: string) => {
    try { await supabase.rpc('ensure_fc_setup'); } catch {}
    try {
      const { data } = await supabase.from('fc_balances').select('balance').eq('user_id', uid).maybeSingle();
      setFcBalance(data?.balance ?? 0);
    } catch {}
    try {
      const { data } = await supabase.from('profiles').select('referral_code').eq('user_id', uid).maybeSingle();
      setReferralCode(data?.referral_code ?? null);
    } catch {}
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    try {
      setCopying(true);
      const url = `${window.location.origin}/?ref=${referralCode}`;
      await navigator.clipboard.writeText(url);
      toast({ title: 'Referral link copied', description: 'Share it and earn 100 FC when your referral buys their first ticket.' });
    } catch (error: any) {
      toast({ title: 'Copy failed', description: error.message, variant: 'destructive' });
    } finally {
      setCopying(false);
    }
  };

  const handleFcPurchase = async (rupees: number) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to purchase FC.", variant: "destructive" });
      return;
    }
    
    setPurchasingFc(true);
    try {
      // Mock FC purchase - in real implementation this would integrate with payment gateway
      const fcToAdd = Math.floor(rupees * 2.5); // 1 INR = 2.5 FC
      
      // Add FC transaction
      const { error } = await supabase.rpc('award_purchase_bonus', { 
        ticket_prices: [rupees] // Using ticket_prices array format, but this is for FC top-up
      });
      
      if (error) throw error;
      
      // Refresh FC balance
      await loadFcData(user.id);
      
      toast({ 
        title: "FC Added Successfully!", 
        description: `Added ${fcToAdd} FC for ₹${rupees}. New balance: ${(fcBalance || 0) + fcToAdd} FC` 
      });
      
      setFcModalOpen(false);
      setCustomAmount("");
    } catch (error: any) {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    } finally {
      setPurchasingFc(false);
    }
  };

  const handleCustomFcPurchase = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount < 10) {
      toast({ title: "Invalid amount", description: "Please enter amount ≥ ₹10", variant: "destructive" });
      return;
    }
    handleFcPurchase(amount);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }

      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-lottery-gold border-t-transparent" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-1 md:gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        
        {/* FC Balance - Clickable */}
        <Dialog open={fcModalOpen} onOpenChange={setFcModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card/70 transition-colors">
              <img src={fcCoin} alt="Fortune Coin" className="w-5 md:w-6 h-5 md:h-6" />
              <span className="text-xs md:text-sm font-medium">{fcBalance ?? '—'} FC</span>
              <Plus className="w-3 h-3 opacity-60 hidden md:block" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <img src={fcCoin} alt="Fortune Coin" className="w-6 h-6" />
                Fortune Coin Wallet
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Balance */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-lottery-gold">{fcBalance ?? 0} FC</p>
              </div>

              {/* Purchase FC Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Purchase Fortune Coins</h3>
                <p className="text-sm text-muted-foreground">Rate: ₹1 = 2.5 FC</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleFcPurchase(10)}
                    disabled={purchasingFc}
                    className="flex flex-col py-6"
                  >
                    <span className="font-semibold">₹10</span>
                    <span className="text-xs text-muted-foreground">25 FC</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFcPurchase(100)}
                    disabled={purchasingFc}
                    className="flex flex-col py-6"
                  >
                    <span className="font-semibold">₹100</span>
                    <span className="text-xs text-muted-foreground">250 FC</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFcPurchase(200)}
                    disabled={purchasingFc}
                    className="flex flex-col py-6"
                  >
                    <span className="font-semibold">₹200</span>
                    <span className="text-xs text-muted-foreground">500 FC</span>
                  </Button>
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="Custom ₹"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      type="number"
                      min="10"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleCustomFcPurchase}
                      disabled={purchasingFc || !customAmount}
                      size="sm"
                    >
                      {customAmount ? `₹${customAmount} → ${Math.floor(parseInt(customAmount || "0") * 2.5)} FC` : "Custom"}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Referral Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Refer Friends & Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Share your referral link and earn 100 FC when your friend buys their first ticket!
                </p>
                
                {referralCode && (
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/?ref=${referralCode}`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralLink}
                      disabled={copying}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {referralCode && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyReferralLink}
            disabled={copying}
            className="gap-1 md:gap-2 hidden lg:flex text-xs md:text-sm px-2 md:px-3"
          >
            {copying ? 'Copying…' : 'Share & Earn'}
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="gap-1 md:gap-2 px-2 md:px-3"
        >
          <LogOut className="w-3 md:w-4 h-3 md:h-4" />
          <span className="hidden sm:inline text-xs md:text-sm">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2 px-2 md:px-3" data-auth-trigger>
          <LogIn className="w-3 md:w-4 h-3 md:h-4" />
          <span className="hidden sm:inline text-xs md:text-sm">Sign Up & Get 50 FC</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? "Create Account" : "Sign In"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSignIn} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={authLoading}
            >
              {authLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignInWithGoogle}
            >
              Continue with Google
            </Button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}