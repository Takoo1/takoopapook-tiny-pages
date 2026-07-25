import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, Radio, Clock, Hourglass, XCircle, Ban, Trophy, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LotteryCardProps {
  id: string;
  title: string;
  description?: string;
  gameDate: string;
  ticketImageUrl?: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  organizingGroup: string;
  onViewDetails: (id: string) => void;
  theme?: 'tier-100' | 'tier-500' | 'tier-1000' | 'tier-other' | 'default';
  status?: 'online' | 'booking_stopped' | 'live';
  prizeAmount?: number | string;
}

type StatusKey = 'live' | 'closing_soon' | 'coming_soon' | 'sold_out' | 'booking_closed' | 'winner_declared';

function resolveStatus(status: LotteryCardProps['status'], availableTickets: number, totalTickets: number, gameDate: string): StatusKey {
  if (status === 'live') return 'live';
  if (status === 'booking_stopped') return 'booking_closed';
  if (availableTickets === 0 && totalTickets > 0) return 'sold_out';
  const now = Date.now();
  const draw = new Date(gameDate).getTime();
  const diffH = (draw - now) / 36e5;
  if (!isNaN(diffH)) {
    if (diffH < 0) return 'winner_declared';
    if (diffH <= 24) return 'closing_soon';
    if (diffH > 24 * 7) return 'coming_soon';
  }
  return 'live';
}

const STATUS_META: Record<StatusKey, { label: string; icon: any; className: string }> = {
  live: { label: 'Live', icon: Radio, className: 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30' },
  closing_soon: { label: 'Closing Soon', icon: Hourglass, className: 'bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30' },
  coming_soon: { label: 'Coming Soon', icon: Clock, className: 'bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30' },
  sold_out: { label: 'Sold Out', icon: XCircle, className: 'bg-muted text-muted-foreground ring-1 ring-border' },
  booking_closed: { label: 'Booking Closed', icon: Ban, className: 'bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30' },
  winner_declared: { label: 'Winner Declared', icon: Trophy, className: 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30' },
};

function tierAccent(theme: LotteryCardProps['theme']) {
  switch (theme) {
    case 'tier-100': return { chip: 'bg-red-500 text-white', ring: 'ring-red-500/20', dot: 'bg-red-500' };
    case 'tier-500': return { chip: 'bg-blue-500 text-white', ring: 'ring-blue-500/20', dot: 'bg-blue-500' };
    case 'tier-1000': return { chip: 'bg-purple-500 text-white', ring: 'ring-purple-500/20', dot: 'bg-purple-500' };
    case 'tier-other': return { chip: 'bg-emerald-500 text-white', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' };
    default: return { chip: 'bg-lottery-gold text-black', ring: 'ring-lottery-gold/20', dot: 'bg-lottery-gold' };
  }
}

export function LotteryCard({
  id,
  title,
  gameDate,
  ticketImageUrl,
  ticketPrice,
  totalTickets,
  availableTickets,
  onViewDetails,
  theme = 'default',
  status,
  prizeAmount,
}: LotteryCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const statusKey = resolveStatus(status, availableTickets, totalTickets, gameDate);
  const StatusIcon = STATUS_META[statusKey].icon;
  const accent = tierAccent(theme);

  const drawDate = new Date(gameDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const unavailable = statusKey === 'sold_out' || statusKey === 'booking_closed' || statusKey === 'winner_declared';

  return (
    <Card
      onClick={() => onViewDetails(id)}
      className={`group relative overflow-hidden cursor-pointer rounded-[20px] border border-border/60 bg-card p-5 flex flex-col gap-4 transition-all duration-300 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_20px_40px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] animate-fade-in`}
    >
      {/* Ticket image — edge-to-edge with rounded corners */}
      {ticketImageUrl ? (
        <div className="relative -mx-1 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          {!imgLoaded && <Skeleton className="absolute inset-0 rounded-2xl" />}
          <img
            src={ticketImageUrl}
            alt={`${title} ticket`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} md:group-hover:scale-[1.03]`}
          />
          {/* subtle top gradient for badge legibility */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />
          {/* Status pill (top-left) */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-background/80 ${STATUS_META[statusKey].className}`}>
              <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
              {STATUS_META[statusKey].label}
            </span>
          </div>
          {/* Price chip (top-right) */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-md ${accent.chip}`}>
              <Ticket className="w-3 h-3" strokeWidth={2.5} />
              ₹{ticketPrice}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative -mx-1 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <Ticket className="w-10 h-10 text-muted-foreground/40" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-2">
          {title}
        </h3>

        {/* Prize (if provided) */}
        {prizeAmount != null && (
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Prize</span>
            <span className="text-xl font-extrabold text-gold-shimmer leading-none">
              {typeof prizeAmount === 'number' ? `₹${prizeAmount.toLocaleString('en-IN')}` : prizeAmount}
            </span>
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
            <span className="truncate font-medium">{drawDate}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
            <span className="truncate text-xs font-medium text-muted-foreground">
              {unavailable
                ? 'Not Available'
                : `${availableTickets}/${totalTickets} left`}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          className="w-full h-11 rounded-2xl font-semibold text-sm mt-1 group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
        </Button>
      </div>
    </Card>
  );
}
