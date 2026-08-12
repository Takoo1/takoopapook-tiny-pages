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
  return <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 pt-safe-top h-[58px]">
      <div className="flex items-center justify-between px-4 py-1.5 h-full relative">
        {/* Left side - Site Logo */}
        <div className="flex items-center gap-2.5 animate-fade-in" onClick={() => navigate('/')} role="button">
          <img src="/__l5e/assets-v1/e013b595-501d-44f1-8ddb-13183d360966/fortuna-logo.png" alt="Fortune Bridge" className="w-9 h-9 rounded-xl transition-transform duration-200 active:scale-95" />
          <span className="text-base font-semibold tracking-tight text-foreground hidden min-[360px]:inline">Fortune Bridge</span>
        </div>

        {/* Right side - Notification and FC Balance/Sign Up */}
        <div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Notification Bell */}
          <NotificationBell />

          {user ? (
        <>
              <Button variant="ghost" onClick={handleWalletClick} className="flex items-center gap-1.5 h-9 px-3 bg-primary/10 hover:bg-primary/15 rounded-full border border-primary/25 transition-all duration-200 active:scale-95">
                <img src={fcCoin} alt="FC" className="w-4 h-4" />
                <span className="text-sm font-bold text-primary">
                  {fcBalance.toLocaleString()}
                </span>
              </Button>

              <Button variant="ghost" onClick={handleReferralClick} className="flex items-center gap-1 h-9 px-2.5 bg-muted/60 hover:bg-muted rounded-full border border-border/60 transition-all duration-200 active:scale-95">
                <Gift className="w-3.5 h-3.5 text-foreground/80" />
                <span className="text-xs font-semibold text-foreground/90">
                  Refer
                </span>
              </Button>
            </>) : (
        <Button size="sm" onClick={handleSignUpPrompt} className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 px-4 text-xs rounded-full transition-all duration-200 active:scale-95">
              <Gift className="w-3.5 h-3.5 mr-1.5" />
              <span>Get 50 FC Free</span>
            </Button>)}
        </div>
      </div>
    </header>;
}