import { User, LogOut, FileText, Shield, Moon, Sun, Settings, LogIn } from "lucide-react";
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
    id: "profile",
    label: "Profile",
    icon: User,
    path: "/profile"
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
            )}
          </div>
        </div>

        {/* Safe area bottom */}
        <div className="pb-safe-bottom" />
      </div>
    </>
  );
}