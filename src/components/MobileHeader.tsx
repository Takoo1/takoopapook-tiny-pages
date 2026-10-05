import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { ModeSwitch } from "@/components/ModeSwitch";
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
  return <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border pt-safe-top h-[100px]">
      <div className="flex items-center justify-between gap-1 px-4 h-[51px] relative">
        {/* Left side - Site Logo */}
        <div className="flex items-center gap-1.5 animate-fade-in shrink-0 cursor-pointer" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') navigate('/'); }}>
          <img src="/__l5e/assets-v1/e013b595-501d-44f1-8ddb-13183d360966/fortuna-logo.png" alt="Fortune Bridge" className="w-9 h-9 rounded-xl transition-transform duration-200 active:scale-95 shrink-0" />
          <img src="/__l5e/assets-v1/21420f7f-e55f-4739-8be4-45b24b061c9a/fortunalink-name.png" alt="FortunaLink" className="h-5 object-contain max-w-[78px] min-[390px]:max-w-[100px] shrink-0" />
        </div>

        {/* Right side - Notification and FC Balance/Sign Up */}
        <div className="flex items-center gap-1 animate-fade-in min-w-0" style={{ animationDelay: '0.1s' }}>
          {/* Notification Bell */}
          <NotificationBell />

          {user ? (
        <>
              <Button variant="ghost" onClick={handleWalletClick} className="relative overflow-hidden chip-gold-3d flex items-center gap-1.5 h-9 px-3 rounded-full transition-all duration-200 active:scale-95 hover:bg-transparent">
                <img src={fcCoin} alt="FC" className="w-4 h-4 relative z-10" />
                <span className="text-sm font-bold relative z-10">
                  {fcBalance.toLocaleString()}
                </span>
              </Button>

              <Button variant="ghost" onClick={handleReferralClick} className="relative overflow-hidden chip-blue-3d flex items-center gap-1 h-9 px-2.5 rounded-full transition-all duration-200 active:scale-95 hover:bg-transparent">
                <Gift className="w-3.5 h-3.5 relative z-10" />
                 <span className="text-xs font-semibold relative z-10 hidden min-[380px]:inline">
                  Refer
                </span>
              </Button>
            </>) : (

        <Button size="sm" onClick={handleSignUpPrompt} className="relative overflow-hidden btn-gold-3d font-bold h-9 px-3.5 text-xs rounded-full transition-all duration-200 active:scale-95 shrink-0">
              <Gift className="w-3.5 h-3.5 mr-1.5" />
               <span className="hidden min-[390px]:inline">Get 50 FC Free</span><span className="min-[390px]:hidden">Get 50 FC</span>
            </Button>)}
        </div>
      </div>
      <div className="flex h-[48px] items-center px-4"><ModeSwitch mode="coupons" /></div>
    </header>;
}