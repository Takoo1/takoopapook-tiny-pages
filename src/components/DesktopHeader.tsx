import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, LogIn, User } from "lucide-react";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import fcCoin from "@/assets/fc-coin.png";

export function DesktopHeader() {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthAction = () => {
    // Trigger the auth dialog by finding and clicking the auth button in mobile menu
    const authButton = document.querySelector('[data-auth-trigger]') as HTMLElement;
    authButton?.click();
  };

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  return (
    <header className="hidden md:block bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Left side - Site Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">FB</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Fortune Bridge</h1>
        </div>

        {/* Right side - FC Balance, Theme Toggle, Auth */}
        <div className="flex items-center gap-4">
          {user && (
            <Button
              variant="ghost"
              onClick={handleWalletClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm hover:bg-primary/15 transition-colors"
            >
              <img 
                src={fcCoin} 
                alt="FC" 
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-primary">
                {fcBalance.toLocaleString()}
              </span>
            </Button>
          )}

          <ThemeToggle />

          {user ? (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleAuthAction}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}