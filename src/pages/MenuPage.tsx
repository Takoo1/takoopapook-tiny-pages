import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Wallet,
  Ticket,
  Trophy,
  Play,
  Bell,
  Gift,
  Settings,
  MessageCircle,
  FileText,
  Shield,
  Info,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Home as HomeIcon,
  RotateCcw,
  Truck,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Item {
  icon: any;
  label: string;
  subtitle?: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}

export default function MenuPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  const promptSignIn = () => {
    const btn = document.querySelector("[data-auth-trigger]") as HTMLElement | null;
    if (btn) btn.click();
    else navigate("/");
  };

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Account",
      items: [
        { icon: UserIcon, label: "Profile", subtitle: user ? "Manage your account" : "Sign in to continue", onClick: () => navigate("/profile") },
        { icon: Wallet, label: "Wallet & Fortune Coins", subtitle: "Balance, top-up & history", onClick: () => navigate("/wallet") },
        { icon: Gift, label: "Referrals", subtitle: "Invite friends, earn FC", onClick: () => navigate("/wallet") },
      ],
    },
    {
      title: "Lottery",
      items: [
        { icon: HomeIcon, label: "Home", subtitle: "Browse featured draws", onClick: () => navigate("/") },
        { icon: Ticket, label: "My Tickets", subtitle: "Active & past bookings", onClick: () => navigate("/my-tickets") },
        { icon: Trophy, label: "Winners & Results", onClick: () => navigate("/winners") },
        { icon: Play, label: "Videos", subtitle: "Draw highlights", onClick: () => navigate("/videos") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: MessageCircle, label: "Contact / Report Issue", onClick: () => navigate("/contact") },
        { icon: Bell, label: "Announcements", subtitle: "Latest notifications", onClick: () => navigate("/") },
        { icon: Settings, label: "Organiser Dashboard", subtitle: "For approved organisers", onClick: () => navigate("/game-organiser-dashboard") },
      ],
    },
    {
      title: "Legal",
      items: [
        { icon: Info, label: "About Fortune Bridge", onClick: () => navigate("/about") },
        { icon: FileText, label: "Terms & Conditions", onClick: () => navigate("/terms") },
        { icon: Shield, label: "Privacy Policy", onClick: () => navigate("/privacy") },
        { icon: RotateCcw, label: "Cancellation & Refund", onClick: () => navigate("/refund") },
        { icon: Truck, label: "Shipping Policy", onClick: () => navigate("/shipping") },
      ],
    },
    {
      title: "Application",
      items: [
        {
          icon: theme === "light" ? Moon : Sun,
          label: theme === "light" ? "Dark Mode" : "Light Mode",
          subtitle: "Switch theme",
          onClick: () => setTheme(theme === "light" ? "dark" : "light"),
          trailing: <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{theme}</span>,
        },
      ],
    },
  ];

  return (
    <div className="px-4 py-5 pb-8 space-y-5">
      {/* Header */}
      <section className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">More</h1>
        <p className="text-sm text-muted-foreground mt-1">Settings, support and application preferences</p>
      </section>

      {sections.map((section, gi) => (
        <section key={section.title} className="animate-fade-in" style={{ animationDelay: `${(gi + 1) * 50}ms` }}>
          <h2 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {section.title}
          </h2>
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-[0_4px_20px_-12px_hsl(var(--primary)/0.25)]">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/60 ${
                    i < section.items.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    {item.subtitle && <div className="text-xs text-muted-foreground truncate mt-0.5">{item.subtitle}</div>}
                  </div>
                  {item.trailing ?? <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Auth */}
      <div className="animate-fade-in">
        {user ? (
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        ) : (
          <Button onClick={promptSignIn} className="w-full h-12 rounded-2xl">
            <LogIn className="w-4 h-4 mr-2" /> Login / Register
          </Button>
        )}
      </div>

      <div className="pt-1 pb-4 text-center text-[11px] text-muted-foreground">
        Fortune Bridge · v1.0
      </div>
    </div>
  );
}
