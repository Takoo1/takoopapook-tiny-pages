import { User, LogOut, FileText, Shield, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  }
];

export function MobileSlideMenu({ isOpen, onClose, user }: MobileSlideMenuProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleAuth = () => {
    if (user) {
      // Handle logout
      // This will be implemented based on the auth system
      console.log("Logout functionality to be implemented");
    } else {
      navigate("/auth");
    }
    onClose();
  };

  const handleOrganiser = async () => {
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login first to access organiser dashboard",
          variant: "destructive",
        });
        navigate("/auth");
        onClose();
        return;
      }

      // Check if user has organiser role
      const { data: userProfile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userProfile || userProfile.role !== 'organiser') {
        toast({
          title: "Access Denied",
          description: "Only users with organiser role can access this dashboard. Contact admin to get organiser access.",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // User has access, navigate to organiser dashboard
      navigate("/game-organiser-dashboard");
      onClose();
    } catch (error) {
      console.error('Error checking organiser access:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      onClose();
    }
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
          "slide-menu fixed top-0 right-0 w-[60%] bg-background border-l border-border transition-transform duration-300 z-45 flex flex-col",
          "h-[calc(100vh-5rem)]", // Full height minus bottom nav (80px = 5rem)
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

            {/* Auth Button */}
            <Button
              variant="ghost"
              onClick={handleAuth}
              className="w-full justify-start gap-3 h-12 text-left"
            >
              {user ? (
                <>
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Login/Register</span>
                </>
              )}
            </Button>
          </div>

          {/* Organiser Button at Bottom */}
          <div className="mt-auto">
            <Button
              onClick={handleOrganiser}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Organiser
            </Button>
          </div>
        </div>

        {/* Safe area bottom */}
        <div className="pb-safe-bottom" />
      </div>
    </>
  );
}