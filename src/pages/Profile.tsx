import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Wallet as WalletIcon,
  Ticket,
  Trophy,
  Bell,
  Gift,
  FileText,
  Shield,
  MessageCircle,
  Info,
  ChevronRight,
  Copy,
  Check,
  LogOut,
  Sparkles,
  BadgeCheck,
  Mail,
  Phone,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const fcCoin =
  "https://bramvnherjbaiakwfvwb.supabase.co/storage/v1/object/public/lottery-images/FC%20coin.png";

interface ProfileData {
  full_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  referral_code?: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fcBalance, setFcBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const [{ data: p }, { data: b }] = await Promise.all([
          supabase.from("profiles").select("full_name,display_name,avatar_url,phone,referral_code").eq("user_id", u.id).maybeSingle(),
          supabase.from("fc_balances").select("balance").eq("user_id", u.id).maybeSingle(),
        ]);
        setProfile(p as ProfileData);
        if (b?.balance != null) setFcBalance(b.balance);
      }
      setLoading(false);
    };
    init();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "You've been signed out." });
    navigate("/");
  };

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: "Referral link copied!" });
  };

  const displayName =
    profile?.display_name || profile?.full_name || user?.email?.split("@")[0] || "Guest User";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="h-40 rounded-3xl bg-card animate-pulse" />
        <div className="h-32 rounded-3xl bg-card animate-pulse" />
        <div className="h-64 rounded-3xl bg-card animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-16 text-center space-y-5">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center ring-1 ring-primary/30">
          <UserIcon className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Sign in to continue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your wallet, tickets and referral rewards.
          </p>
        </div>
        <Button onClick={() => navigate("/")} className="rounded-2xl h-12 px-6">
          Go to Home
        </Button>
      </div>
    );
  }

  const groups: { title: string; items: { icon: any; label: string; subtitle?: string; onClick: () => void; accent?: string }[] }[] = [
    {
      title: "Account",
      items: [
        { icon: WalletIcon, label: "Wallet & Fortune Coins", subtitle: `${fcBalance.toLocaleString()} FC`, onClick: () => navigate("/wallet"), accent: "text-primary" },
        { icon: Ticket, label: "My Tickets", subtitle: "Active & past draws", onClick: () => navigate("/my-tickets") },
        { icon: Trophy, label: "Winners & Results", subtitle: "Latest results", onClick: () => navigate("/winners") },
      ],
    },
    {
      title: "Rewards",
      items: [
        { icon: Gift, label: "Referrals", subtitle: profile?.referral_code || "Invite friends", onClick: () => navigate("/wallet"), accent: "text-primary" },
        { icon: Bell, label: "Notifications", subtitle: "Announcements & updates", onClick: () => navigate("/menu") },
      ],
    },
    {
      title: "Support & Legal",
      items: [
        { icon: MessageCircle, label: "Contact / Report Issue", onClick: () => navigate("/contact") },
        { icon: Info, label: "About Fortune Bridge", onClick: () => navigate("/about") },
        { icon: FileText, label: "Terms & Conditions", onClick: () => navigate("/terms") },
        { icon: Shield, label: "Privacy Policy", onClick: () => navigate("/privacy") },
      ],
    },
  ];

  return (
    <div className="px-4 py-5 pb-8 space-y-5">
      {/* Header Card */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/70 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.4)] animate-fade-in">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 to-accent/40 blur-md opacity-70" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/40 bg-muted flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gold-shimmer">{initials}</span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold truncate">{displayName}</h1>
                <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 p-3 text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <img src={fcCoin} alt="FC" className="w-6 h-6 drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Balance</span>
              </div>
              <div className="mt-1 text-lg font-bold text-gold-shimmer">{fcBalance.toLocaleString()} FC</div>
            </button>

            <button
              onClick={copyReferral}
              disabled={!profile?.referral_code}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Referral</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-sm font-bold truncate">{profile?.referral_code || "—"}</span>
                {profile?.referral_code && (copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />)}
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Menu Groups */}
      {groups.map((group, gi) => (
        <section key={group.title} className="animate-fade-in" style={{ animationDelay: `${(gi + 1) * 60}ms` }}>
          <h2 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {group.title}
          </h2>
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-[0_4px_20px_-12px_hsl(var(--primary)/0.25)]">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/60 ${
                    i < group.items.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className={`w-4.5 h-4.5 ${item.accent || "text-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{item.subtitle}</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Logout */}
      <Button
        variant="outline"
        onClick={signOut}
        className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      <div className="pt-2 pb-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          Fortune Bridge · Premium Account
        </div>
      </div>
    </div>
  );
}
