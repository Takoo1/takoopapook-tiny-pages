import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { LogOut, Gift, MessageCircle, Menu, Home, Video, Trophy, Ticket, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as SupabaseUser } from '@supabase/supabase-js';
const fcCoin = "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";

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
    <header className="hidden md:block bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Left side - Site Logo and Name */}
        <div className="flex items-center gap-3">
          <img 
            src="https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FB_Site_icon.png" 
            alt="Fortune Bridge" 
            className="w-10 h-10 rounded-xl shadow-lg"
          />
          <img 
            src="https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/Site_name.png" 
            alt="Fortune Bridge" 
            className="h-8 object-contain"
          />
        </div>

        {/* Right side - FC Balance, Auth, Menu */}
        <div className="flex items-center gap-4">
          {user && (
            <>
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
              
              <Button
                variant="ghost"
                onClick={handleReferralClick}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 shadow-sm hover:bg-green-500/15 transition-colors"
              >
                <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Refer and Earn FC
                </span>
              </Button>
            </>
          )}

          {!user && <AuthButton />}

          {user && (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}

          {/* Desktop Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-background/95 backdrop-blur-sm border border-border shadow-lg"
            >
              <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/videos')} className="cursor-pointer">
                <Video className="mr-2 h-4 w-4" />
                <span>Videos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/winners')} className="cursor-pointer">
                <Trophy className="mr-2 h-4 w-4" />
                <span>Winners</span>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem onClick={() => navigate('/my-tickets')} className="cursor-pointer">
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>My Tickets</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer p-0">
                <div className="flex items-center w-full px-2 py-1.5">
                  <ThemeToggle />
                  <span className="ml-2">Theme</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Contact Us</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/terms')} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Terms and Conditions</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}