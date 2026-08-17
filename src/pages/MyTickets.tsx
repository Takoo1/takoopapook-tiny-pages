import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Ticket, Calendar, Trophy, Hash, User, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { generateAndDownloadTicket, generateTicketImage, type SerialConfig } from "@/lib/generateTicketImage";
import { format } from "date-fns";

interface TicketData {
  id: string;
  ticket_number: number;
  booked_at: string;
  status: string;
  booked_by_name: string;
  lottery_game: {
    id: string;
    title: string;
    game_date: string;
    ticket_price: number;
    ticket_image_url: string | null;
    ticket_serial_config: SerialConfig | null;
    status: string;
  };
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [ticketPreviews, setTicketPreviews] = useState<Map<string, string>>(new Map());
  const [generatingPreviews, setGeneratingPreviews] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchMyTickets(); }, []);
  useEffect(() => { generateTicketPreviews(); }, [tickets]);

  const generateTicketPreviews = async () => {
    const newPreviews = new Map<string, string>();
    const previewPromises: Promise<void>[] = [];

    for (const ticket of tickets) {
      if (ticket.lottery_game.ticket_image_url && ticket.lottery_game.ticket_serial_config && !ticketPreviews.has(ticket.id)) {
        setGeneratingPreviews(prev => new Set(prev).add(ticket.id));
        const previewPromise = generateTicketImage(
          ticket.lottery_game.ticket_image_url,
          ticket.ticket_number.toString().padStart(ticket.lottery_game.ticket_serial_config.digitCount, '0'),
          ticket.lottery_game.ticket_serial_config
        ).then(dataUrl => { newPreviews.set(ticket.id, dataUrl); })
        .catch(error => { console.error('Error generating preview for ticket', ticket.id, error); })
        .finally(() => {
          setGeneratingPreviews(prev => { const s = new Set(prev); s.delete(ticket.id); return s; });
        });
        previewPromises.push(previewPromise);
      }
    }
    await Promise.all(previewPromises);
    if (newPreviews.size > 0) setTicketPreviews(prev => new Map([...prev, ...newPreviews]));
  };

  const fetchMyTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('lottery_tickets')
        .select(`
          id, ticket_number, booked_at, status, booked_by_name,
          lottery_games!inner (
            id, title, game_date, ticket_price, ticket_image_url, ticket_serial_config, status
          )
        `)
        .eq('booked_by_user_id', user.id)
        .eq('status', 'sold_online')
        .order('booked_at', { ascending: false });

      if (error) throw error;

      const transformedTickets = data?.map(ticket => ({
        ...ticket,
        lottery_game: Array.isArray(ticket.lottery_games) ? ticket.lottery_games[0] : ticket.lottery_games
      })) || [];

      setTickets(transformedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({ title: "Error", description: "Failed to load your tickets. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticket: TicketData) => {
    const { lottery_game } = ticket;
    if (!lottery_game.ticket_image_url || !lottery_game.ticket_serial_config) {
      toast({ title: "Download Not Available", description: "This ticket doesn't have a downloadable image configured.", variant: "destructive" });
      return;
    }
    setDownloading(prev => new Set(prev).add(ticket.id));
    try {
      await generateAndDownloadTicket(lottery_game.ticket_image_url, ticket.ticket_number, lottery_game.ticket_serial_config, lottery_game.title);
      toast({ title: "Ticket Downloaded", description: `Ticket #${ticket.ticket_number} has been downloaded.` });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({ title: "Download Failed", description: "Failed to download ticket. Please try again.", variant: "destructive" });
    } finally {
      setDownloading(prev => { const s = new Set(prev); s.delete(ticket.id); return s; });
    }
  };

  const statusChip = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
      live: { label: "LIVE", bg: 'hsl(142 70% 20% / 0.55)', color: 'hsl(142 80% 75%)', border: 'hsl(142 70% 45% / 0.5)' },
      online: { label: "OPEN", bg: 'hsl(var(--noir-gold)/0.14)', color: 'hsl(var(--noir-gold))', border: 'hsl(var(--noir-gold)/0.45)' },
      booking_stopped: { label: "BOOKING CLOSED", bg: 'hsl(35 80% 25% / 0.55)', color: 'hsl(35 90% 75%)', border: 'hsl(35 80% 50% / 0.5)' },
      completed: { label: "RESULT DECLARED", bg: 'hsl(var(--noir-cream)/0.08)', color: 'hsl(var(--noir-cream)/0.85)', border: 'hsl(var(--noir-cream)/0.2)' },
    };
    const s = map[status] || { label: status.replace('_', ' ').toUpperCase(), bg: 'hsl(var(--noir-charcoal))', color: 'hsl(var(--noir-cream)/0.8)', border: 'hsl(var(--noir-cream)/0.15)' };
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] whitespace-nowrap"
        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
        {s.label}
      </span>
    );
  };

  const ambient = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.18]"
        style={{ background: 'radial-gradient(circle, hsl(var(--noir-gold)/0.18), transparent 65%)' }} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative font-['Manrope']">
        {ambient}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-5">
          <div>
            <div className="home-eyebrow">Digital Wallet</div>
            <h1 className="home-section-title text-2xl md:text-3xl">My Tickets</h1>
          </div>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-[24px]" />)}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen relative font-['Manrope']">
        {ambient}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24">
          <div className="mb-6">
            <div className="home-eyebrow">Digital Wallet</div>
            <h1 className="home-section-title text-2xl md:text-3xl">My Tickets</h1>
          </div>
          <div className="home-empty mx-auto max-w-md text-center py-14 px-6 animate-fade-in-up">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--noir-mid))', border: '1px solid hsl(var(--border))' }}>
              <Ticket className="w-8 h-8" style={{ color: 'hsl(var(--noir-gold))' }} />
            </div>
            <h3 className="home-section-title text-lg mb-1">No Tickets Yet</h3>
            <p className="text-sm mb-5" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
              Browse premium draws and grab your first ticket to fortune.
            </p>
            <button onClick={() => navigate('/')} className="home-navy-btn">
              Browse Lotteries
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group tickets by game
  const ticketsByGame = tickets.reduce((acc, ticket) => {
    const gameId = ticket.lottery_game.id;
    if (!acc[gameId]) acc[gameId] = { game: ticket.lottery_game, tickets: [] };
    acc[gameId].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { game: TicketData['lottery_game']; tickets: TicketData[] }>);

  const groups = Object.values(ticketsByGame);
  const active = groups.filter(g => ['live', 'online', 'booking_stopped'].includes(g.game.status));
  const past = groups.filter(g => !['live', 'online', 'booking_stopped'].includes(g.game.status));
  const totalTickets = tickets.length;

  const renderGameGroup = ({ game, tickets: gameTickets }: { game: TicketData['lottery_game']; tickets: TicketData[] }) => (
    <section
      key={game.id}
      className="relative rounded-[24px] p-4 md:p-6 overflow-hidden animate-fade-in-up"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.28), hsl(var(--noir-deep)/0.6))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 10px 32px -18px hsl(0 0% 0% / 0.55)'
      }}
    >
      {/* Group header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="home-eyebrow mb-1">Lottery</div>
          <h3 className="text-base md:text-lg font-extrabold leading-tight truncate" style={{ color: 'hsl(var(--noir-cream))' }}>
            {game.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold))' }} />
              {format(new Date(game.game_date), 'dd MMM yyyy')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold))' }} />
              ₹{game.ticket_price}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {statusChip(game.status)}
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'hsl(var(--noir-charcoal))', color: 'hsl(var(--noir-cream)/0.8)', border: '1px solid hsl(var(--noir-gold)/0.2)' }}>
            {gameTickets.length} TICKET{gameTickets.length > 1 ? 'S' : ''}
          </span>
        </div>
      </div>

      {/* Ticket cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gameTickets.map((ticket) => {
          const digits = game.ticket_serial_config?.digitCount || 5;
          const num = ticket.ticket_number.toString().padStart(digits, '0');
          return (
            <div
              key={ticket.id}
              className="relative rounded-[18px] overflow-hidden animate-fade-in-up"
              style={{
                background: 'hsl(var(--noir-charcoal)/0.6)',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 6px 18px -12px hsl(0 0% 0% / 0.55)'
              }}
            >
              {/* Ticket number strip */}
              <div className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--noir-gold)/0.12), transparent)',
                  borderBottom: '1px dashed hsl(var(--noir-gold)/0.25)'
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(var(--noir-gold))' }} />
                  <span className="text-lg font-extrabold tracking-wider truncate" style={{ color: 'hsl(var(--noir-gold))' }}>
                    {num}
                  </span>
                </div>
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'hsl(var(--noir-gold)/0.6)' }} />
              </div>

              {/* Preview */}
              {game.ticket_image_url && game.ticket_serial_config && (
                <div className="px-4 pt-4">
                  {ticketPreviews.has(ticket.id) ? (
                    <div className="relative">
                      <img
                        src={ticketPreviews.get(ticket.id)}
                        alt={`Ticket #${ticket.ticket_number}`}
                        className="w-full h-36 object-contain rounded-[12px] animate-fade-in"
                        style={{ background: 'hsl(var(--noir-deep))', border: '1px solid hsl(var(--border))' }}
                      />
                    </div>
                  ) : generatingPreviews.has(ticket.id) ? (
                    <Skeleton className="w-full h-36 rounded-[12px]" />
                  ) : null}
                </div>
              )}

              {/* Meta */}
              <div className="px-4 py-3 space-y-1.5 text-xs" style={{ color: 'hsl(var(--noir-cream)/0.75)' }}>
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 flex-shrink-0" style={{ color: 'hsl(var(--noir-gold)/0.8)' }} />
                  <span className="truncate">{ticket.booked_by_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'hsl(var(--noir-gold)/0.8)' }} />
                  <span>Purchased {format(new Date(ticket.booked_at), 'dd MMM, hh:mm a')}</span>
                </div>
              </div>

              {/* Action */}
              {game.ticket_image_url && game.ticket_serial_config && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    disabled={downloading.has(ticket.id)}
                    className="home-gold-btn w-full text-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {downloading.has(ticket.id) ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download Ticket
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen relative font-['Manrope']">
      {ambient}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="home-eyebrow">Digital Wallet</div>
          <h1 className="home-section-title text-2xl md:text-3xl">My Tickets</h1>
        </div>

        {/* Summary */}
        <section
          className="relative rounded-[24px] p-4 md:p-5 flex items-center gap-4 overflow-hidden animate-fade-in-up"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--noir-mid)/0.55), hsl(var(--noir-deep)/0.75))',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 12px 36px -18px hsl(0 0% 0% / 0.65)'
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'hsl(var(--noir-charcoal))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 8px 20px -8px hsl(var(--navy)/0.14)'
            }}
          >
            <Ticket className="w-7 h-7" style={{ color: 'hsl(var(--noir-gold))' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="home-eyebrow mb-0.5">Total Holdings</div>
            <div className="text-2xl font-extrabold" style={{ color: 'hsl(var(--noir-gold))' }}>
              {totalTickets}
              <span className="text-sm font-semibold ml-1.5" style={{ color: 'hsl(var(--noir-cream)/0.7)' }}>
                ticket{totalTickets > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--noir-cream)/0.65)' }}>
              Across {groups.length} draw{groups.length > 1 ? 's' : ''}
            </div>
          </div>
        </section>

        {/* Active */}
        {active.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold tracking-[0.14em] uppercase" style={{ color: 'hsl(var(--noir-cream))' }}>
                Active Draws
              </h2>
              <span className="text-xs font-semibold" style={{ color: 'hsl(var(--noir-gold))' }}>
                {active.length}
              </span>
            </div>
            {active.map(renderGameGroup)}
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold tracking-[0.14em] uppercase" style={{ color: 'hsl(var(--noir-cream))' }}>
                Past Draws
              </h2>
              <span className="text-xs font-semibold" style={{ color: 'hsl(var(--noir-gold))' }}>
                {past.length}
              </span>
            </div>
            {past.map(renderGameGroup)}
          </div>
        )}
      </div>
    </div>
  );
}
