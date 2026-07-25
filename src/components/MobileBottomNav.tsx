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
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-8px_hsl(var(--foreground)/0.12)]"
      >
        <div className="pb-safe">
          <div className="flex items-stretch justify-between px-2 pt-1.5 pb-1 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && item.path !== "/menu";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  data-menu-trigger={item.path === "/menu" ? "true" : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 min-h-[56px] rounded-2xl transition-all duration-200 active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center h-8 w-14 rounded-full transition-all duration-300",
                      isActive
                        ? "bg-primary/12"
                        : "bg-transparent group-hover:bg-muted/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[22px] w-[22px] transition-all duration-300",
                        isActive ? "stroke-[2.4]" : "stroke-2"
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[11px] leading-none tracking-tight transition-all duration-200",
                      isActive ? "font-semibold" : "font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Slide Menu */}
      <MobileSlideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
      />
    </>
  );
}