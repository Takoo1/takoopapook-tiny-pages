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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-t border-border/30 shadow-[0_-2px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_20px_-4px_rgba(0,0,0,0.25)]">
        {/* Safe area padding for mobile devices */}
        <div className="pb-safe">
          <div className="flex items-center justify-around px-1 py-1.5">
            {navItems.map((item, index) => {
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
                    "relative flex flex-col items-center justify-center gap-0.5 h-14 w-16 px-1 py-1 rounded-2xl transition-all duration-300 active:scale-90",
                    "animate-fade-in-up",
                    isActive 
                      ? "text-primary bg-primary/12 shadow-sm shadow-primary/15 ring-1 ring-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon className={cn("h-5 w-5 transition-all duration-300", isActive && "scale-110 drop-shadow-sm")} />
                  <span className={cn("text-[10px] font-medium leading-none tracking-tight transition-all duration-200", isActive && "font-bold text-[10.5px]")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0 w-6 h-[3px] rounded-full bg-gradient-to-r from-primary to-primary/60 animate-scale-in" />
                  )}
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