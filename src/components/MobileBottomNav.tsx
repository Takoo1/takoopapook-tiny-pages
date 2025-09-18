import { Home, Play, Trophy, Ticket, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileSlideMenu } from "./MobileSlideMenu";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/"
  },
  {
    id: "videos",
    label: "Videos", 
    icon: Play,
    path: "/videos"
  },
  {
    id: "winners",
    label: "Winners",
    icon: Trophy,
    path: "/winners"
  },
  {
    id: "tickets",
    label: "My Tickets",
    icon: Ticket,
    path: "/my-tickets"
  },
  {
    id: "menu",
    label: "Menu",
    icon: Menu,
    path: "/menu"
  }
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string) => {
    if (path === "/menu") {
      setIsMenuOpen(!isMenuOpen); // Toggle menu instead of just opening
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        {/* Safe area padding for mobile devices */}
        <div className="pb-safe">
          <div className="flex items-center justify-around px-2 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && item.path !== "/menu";
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  data-menu-trigger={item.path === "/menu" ? "true" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-12 w-18 px-1 py-0.5 rounded-lg transition-colors",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-none">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide Menu */}
      <MobileSlideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
      />
    </>
  );
}