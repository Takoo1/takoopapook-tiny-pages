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

const STATUS_META: Record<StatusKey, { label: string; icon: any; dotClass: string; textClass: string }> = {
  live: { label: 'Live', icon: Radio, dotClass: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse', textClass: 'text-white' },
  closing_soon: { label: 'Closing Soon', icon: Hourglass, dotClass: 'bg-amber-400', textClass: 'text-amber-200' },
  coming_soon: { label: 'Coming Soon', icon: Clock, dotClass: 'bg-sky-400', textClass: 'text-sky-200' },
  sold_out: { label: 'Sold Out', icon: XCircle, dotClass: 'bg-muted-foreground', textClass: 'text-muted-foreground' },
  booking_closed: { label: 'Booking Closed', icon: Ban, dotClass: 'bg-orange-400', textClass: 'text-orange-200' },
  winner_declared: { label: 'Winner Declared', icon: Trophy, dotClass: 'bg-emerald-400', textClass: 'text-emerald-200' },
};

export function LotteryCard({
  id,
  title,
  gameDate,
  ticketImageUrl,
  ticketPrice,
  totalTickets,
  availableTickets,
  onViewDetails,
  status,
}: LotteryCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const statusKey = resolveStatus(status, availableTickets, totalTickets, gameDate);
  const statusMeta = STATUS_META[statusKey];

  const drawDate = new Date(gameDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const unavailable = statusKey === 'sold_out' || statusKey === 'booking_closed' || statusKey === 'winner_declared';

  return (
    <Card
      onClick={() => onViewDetails(id)}
      className="group relative overflow-hidden cursor-pointer rounded-[20px] border border-border/50 bg-card flex flex-col transition-all duration-300 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_18px_-10px_rgba(0,0,0,0.35)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_16px_32px_-14px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] animate-fade-in"
    >
      {/* Hero image — edge-to-edge, top-rounded */}
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-[20px] bg-muted">
        {ticketImageUrl ? (
          <>
            {!imgLoaded && <Skeleton className="absolute inset-0" />}
            <img
              src={ticketImageUrl}
              alt={`${title} ticket`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} md:group-hover:scale-[1.02]`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Ticket className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Single glass overlay bar: status (left) + price (right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5">
          <div className="flex items-center justify-between gap-2 rounded-full pl-3 pr-1 py-1 bg-black/25 backdrop-blur-sm ring-1 ring-white/10">
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${statusMeta.textClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
              {statusMeta.label}
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-lottery-gold text-black">
              ₹{ticketPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 pt-3">
        <h3 className="text-[17px] font-bold leading-snug tracking-tight text-foreground line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
            <span className="truncate">{drawDate}</span>
          </div>
          <span className="truncate">
            {unavailable ? 'Not Available' : `${availableTickets}/${totalTickets} left`}
          </span>
        </div>

        <Button
          size="sm"
          className="self-center mt-2 h-8 px-4 rounded-full font-semibold text-xs shadow-none group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
        </Button>
      </div>
    </Card>
  );
}
