import { User, LogOut, FileText, Shield, Moon, Sun, Settings, LogIn, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MobileSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any; // We'll type this properly based on auth implementation
}

const menuItems = [
  {
    id: "about",
    label: "About",
    icon: FileText,
    path: "/about"
  },
  {
    id: "my-tickets",
    label: "My Tickets",
    icon: Shield,
    path: "/my-tickets"
  },
  {
    id: "terms",
    label: "Terms And Conditions",
    icon: FileText,
    path: "/terms"
  },
  {
    id: "contact",
    label: "Contact/Report Issue",
    icon: MessageCircle,
    path: "/contact"
  },
  {
    id: "organiser",
    label: "Organiser",
    icon: Settings,
    path: "organiser" // Special path for organiser functionality
  }
];

export function MobileSlideMenu({ isOpen, onClose, user }: MobileSlideMenuProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    if (path === "organiser") {
      handleOrganiser();
    } else {
      navigate(path);
      onClose();
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
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
      onClose();
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
      onClose();
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
    onClose();
  };

  const handleOrganiser = async () => {
    // Always navigate to organiser dashboard
    // Let the dashboard component handle access control and show the restriction page
    navigate("/game-organiser-dashboard");
    onClose();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.slide-menu') && !target.closest('[data-menu-trigger]')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-300 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Slide Menu */}
      <div
        className={cn(
          "slide-menu fixed top-0 right-0 w-[80%] bg-background border-l border-border transition-transform duration-300 flex flex-col",
          "h-screen z-40", // Lower z-index than bottom nav (z-50)
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Safe area top */}
        <div className="pt-safe-top" />

        {/* Menu Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className="w-full justify-start gap-3 h-12 text-left"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              onClick={handleThemeToggle}
              className="w-full justify-start gap-3 h-12 text-left"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </Button>

            {/* Auth Section - Show logout for logged-in users, login/register for others */}
            {user ? (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 h-12 text-left"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild data-auth-trigger>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-left"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="text-sm font-medium">Login/Register</span>
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
            )}
          </div>
        </div>

        {/* Safe area bottom */}
        <div className="pb-safe-bottom" />
      </div>
    </>
  );
}