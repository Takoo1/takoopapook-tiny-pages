import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import type { User as SupabaseUser } from '@supabase/supabase-js';
const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";
export function MobileHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);
  const navigate = useNavigate();
  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFcBalance(session.user.id);
      }
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFcBalance(session.user.id);
      } else {
        setFcBalance(0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const loadFcBalance = async (userId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('fc_balances').select('balance').eq('user_id', userId).single();
      if (!error && data) {
        setFcBalance(data.balance);
      }
    } catch (error) {
      console.error('Error loading FC balance:', error);
    }
  };
  const handleSignUpPrompt = () => {
    // Trigger the auth dialog by finding and clicking the auth button
    const authButton = document.querySelector('[data-auth-trigger]') as HTMLElement;
    authButton?.click();
  };
  const handleWalletClick = () => {
    navigate('/wallet');
  };
  const handleReferralClick = () => {
    navigate('/wallet');
    // Scroll to referral section after navigation
    setTimeout(() => {
      const referralSection = document.getElementById('referral-section');
      referralSection?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  return <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 pt-safe-top h-[58px] shadow-[0_4px_24px_-8px_hsl(var(--primary)/0.15)]">
      {/* subtle top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-center justify-between px-4 py-1.5 h-full relative">
        {/* Left side - Site Logo */}
        <div className="flex items-center gap-2.5 animate-fade-in" onClick={() => navigate('/')} role="button">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 blur-md opacity-70 animate-glow-pulse" />
            <img src="https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FB_Icon_Round%20(1)-modified.png" alt="Fortune Bridge" className="relative w-10 h-10 rounded-xl shadow-lg ring-1 ring-primary/30 transition-transform duration-300 active:scale-90 hover:rotate-3" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-gold-shimmer hidden min-[360px]:inline">Fortune Bridge</span>
        </div>

        {/* Right side - Notification and FC Balance/Sign Up */}
        <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Notification Bell */}
          <NotificationBell />

          {user ? (
        <>
              <Button variant="ghost" onClick={handleWalletClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 rounded-full border border-primary/25 shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_4px_18px_-2px_hsl(var(--primary)/0.55)] transition-all duration-300 active:scale-95">
                <img src={fcCoin} alt="FC" className="w-5 h-5 drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {fcBalance.toLocaleString()}
                </span>
              </Button>

              <Button variant="ghost" onClick={handleReferralClick} className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full border border-emerald-500/25 shadow-[0_2px_10px_-2px_hsl(160_70%_50%/0.35)] hover:shadow-[0_4px_14px_-2px_hsl(160_70%_50%/0.5)] transition-all duration-300 active:scale-95">
                <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce-subtle" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Refer
                </span>
              </Button>
            </>) : (
        <Button size="sm" onClick={handleSignUpPrompt} className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-accent hover:opacity-95 text-primary-foreground font-semibold px-4 py-2 text-xs rounded-full shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.6)] hover:shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.75)] transition-all duration-300 active:scale-95">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
              <Gift className="w-3.5 h-3.5 mr-1.5 relative" />
              <span className="relative">Get 50 FC Free</span>
            </Button>)}
        </div>
      </div>
    </header>;
}