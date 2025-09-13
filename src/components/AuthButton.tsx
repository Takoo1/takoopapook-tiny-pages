import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useTermsContext } from "@/contexts/TermsContext";
import { LogIn, LogOut, User, Copy, Plus } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";
import { Separator } from "@/components/ui/separator";

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { checkAcceptance } = useTermsAcceptance();
  const { showTermsPopup } = useTermsContext();
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

          // Check terms acceptance for newly signed-in users
          setTimeout(async () => {
            const hasAcceptedTerms = await checkAcceptance('user_login');
            if (!hasAcceptedTerms) {
              showTermsPopup(
                'user_login',
                [1, 3, 10], // Show sections 1, 3, and 10
                () => {}, // No additional action needed after acceptance
                "Welcome! Please Review Our Terms"
              );
            }
          }, 1000); // Small delay to let UI settle
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAcceptance, showTermsPopup]);

  const createUserProfile = async (user: SupabaseUser) => {
    try {
      const refCode = localStorage.getItem('ref_code');
      
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
        return;
      }

      // Handle referral linking using the new RPC
      if (refCode) {
        try {
          const { error: linkError } = await supabase.rpc('link_referral', { 
            ref_code: refCode 
          });
          
          if (linkError) {
            console.error('Error linking referral:', linkError);
          } else {
            console.log('Successfully linked referral with code:', refCode);
          }
        } catch (linkErr) {
          console.error('Error in referral linking:', linkErr);
        } finally {
          // Clear the referral code from localStorage
          localStorage.removeItem('ref_code');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
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
      
      // Use the new purchase_fc RPC function
      const { data, error } = await supabase.rpc('purchase_fc', { 
        amount_fc: fcToAdd,
        payment_details: { 
          amount_inr: rupees, 
          payment_method: 'mock_payment',
          timestamp: new Date().toISOString()
        }
      });
      
      if (error) throw error;
      
      // Update FC balance from the returned data
      const newBalance = data && data.length > 0 ? data[0].new_balance : fcToAdd;
      setFcBalance(newBalance);
      
      toast({ 
        title: "FC Added Successfully!", 
        description: `Added ${fcToAdd} FC for ₹${rupees}. New balance: ${newBalance} FC` 
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
        <div className="space-y-4">
          <Button 
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
            onClick={handleSignInWithGoogle}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                inputMode="none"
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
              autoComplete="off"
              inputMode="none"
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
              autoComplete="off"
              inputMode="none"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={authLoading}
          >
            {authLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
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