import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, User } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import fcCoin from "@/assets/fc-coin.png";

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
          setTimeout(async () => {
            await createUserProfile(session.user);
            await loadFcData(session.user.id);
          }, 0);
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
          id: user.id,
          display_name: fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
        });

      if (error && !error.message.includes('duplicate')) {
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
      const { data } = await supabase.from('profiles').select('referral_code').eq('id', uid).maybeSingle();
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
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-border/40 bg-card/50">
          <img src={fcCoin} alt="Fortune Coin" className="w-4 h-4" />
          <span className="text-sm font-medium">{fcBalance ?? '—'} FC</span>
        </div>
        {referralCode && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyReferralLink}
            disabled={copying}
            className="gap-2"
          >
            {copying ? 'Copying…' : 'Copy Referral'}
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
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