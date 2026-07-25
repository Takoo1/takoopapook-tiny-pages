import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Shield,
  Trophy,
  Users,
  Wallet,
  Ticket,
  Mail,
  Home as HomeIcon,
  FileText,
} from "lucide-react";

const values = [
  { icon: Shield, title: "Trust & Security", desc: "Verified organisers, secure payments and transparent draws." },
  { icon: Trophy, title: "Real Winners", desc: "Publicly verifiable results and prompt prize disbursement." },
  { icon: Wallet, title: "Fortune Coins", desc: "Loyalty rewards, referral bonuses and instant top-ups." },
  { icon: Users, title: "Community", desc: "A growing community of players and licensed organisers." },
];

export default function About() {
  return (
    <div className="px-4 py-5 pb-10 max-w-2xl mx-auto space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card via-card to-card/70 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.4)] p-6 animate-fade-in">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> About Fortune Bridge
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            <span className="text-gold-shimmer">Premium lottery experience</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Fortune Bridge is a modern digital lottery platform connecting players to trusted organisers.
            We combine premium design, transparent draws and secure payments to bring the classic
            lottery experience to your Android device.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="animate-fade-in">
        <h2 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          What we stand for
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-3.5 shadow-[0_4px_16px_-10px_hsl(var(--primary)/0.3)]"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 flex items-center justify-center mb-2">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-sm font-semibold">{v.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{v.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_20px_-12px_hsl(var(--primary)/0.25)] animate-fade-in">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Ticket className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Our Mission</span>
        </div>
        <p className="text-sm text-foreground/85 leading-[1.75]">
          To make lottery participation elegant, transparent and rewarding — with a design language
          that feels at home beside the best premium Android apps.
        </p>
      </section>

      {/* CTA footer */}
      <footer className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-5 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <Mail className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Get in touch</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Have feedback or partnership inquiries? We'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" asChild className="rounded-2xl h-10">
            <Link to="/contact"><Mail className="w-4 h-4 mr-1.5" /> Contact Us</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-2xl h-10">
            <Link to="/terms"><FileText className="w-4 h-4 mr-1.5" /> Read Terms</Link>
          </Button>
          <Button asChild className="rounded-2xl h-10">
            <Link to="/"><HomeIcon className="w-4 h-4 mr-1.5" /> Explore Lotteries</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
