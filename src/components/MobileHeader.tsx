import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import fcCoin from "@/assets/fc-coin.png";

export function MobileHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFcBalance(session.user.id);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
      referralSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border pt-safe-top">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left side - Site Logo */}
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-base">FB</span>
          </div>
        </div>

        {/* Right side - Notification and FC Balance/Sign Up */}
        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <Button 
            variant="ghost" 
            size="sm"
            className="relative p-2 h-9 w-9 flex items-center justify-center"
            disabled
          >
            <Bell className="h-5 w-5 text-blue-900 dark:text-blue-400" />
          </Button>

          {user ? (
            /* Logged in - Show FC Balance and Referral Button */
            <>
              <Button
                variant="ghost"
                onClick={handleWalletClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm hover:bg-primary/15 transition-colors"
              >
                <img 
                  src={fcCoin} 
                  alt="FC" 
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-primary">
                  {fcBalance.toLocaleString()}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleReferralClick}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 shadow-sm hover:bg-green-500/15 transition-colors"
              >
                <Gift className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Refer
                </span>
              </Button>
            </>
          ) : (
            /* Logged out - Show Sign Up prompt */
            <Button 
              size="sm"
              onClick={handleSignUpPrompt}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium px-4 py-2 text-xs rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Gift className="w-3 h-3 mr-1.5" />
              Get 50FC on Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}