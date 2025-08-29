import { useState, useEffect } from "react";
import { Bell, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function MobileHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Site Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">FB</span>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fortune Bridge
          </h1>
        </div>

        {/* Right side - Notification, FC Balance, or Sign Up prompt */}
        <div className="flex items-center gap-3">
          {/* Notification Icon (Coming Soon) */}
          <Button 
            variant="ghost" 
            size="sm"
            className="relative p-2"
            disabled
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 text-xs px-1 bg-muted text-muted-foreground"
            >
              Soon
            </Badge>
          </Button>

          {user ? (
            /* Logged in - Show FC Balance */
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <img 
                src="/src/assets/fc-coin.png" 
                alt="FC" 
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-primary">
                {fcBalance.toLocaleString()}
              </span>
            </div>
          ) : (
            /* Logged out - Show Sign Up prompt */
            <Button 
              size="sm"
              onClick={handleSignUpPrompt}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium px-3 py-1.5 text-xs rounded-full shadow-sm"
            >
              <Gift className="w-3 h-3 mr-1" />
              Sign Up → 50FC
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}