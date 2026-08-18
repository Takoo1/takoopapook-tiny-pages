import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryTicket } from "@/components/ui/lottery-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Calendar, Trophy, Ticket, Clock, BookOpen,
  ChevronLeft, ChevronRight, Gift, FileText, Users, Building,
  Radio, Hourglass, Ban, CheckCircle2, ShieldCheck, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateWithTimezone } from "@/lib/dateUtils";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  stop_booking_time: string;
  ticket_image_url: string;
  ticket_price: number;
  total_tickets: number;
  headline: string;
  organiser_logo_url: string;
  organising_group_name: string;
  status: 'pending' | 'online' | 'booking_stopped' | 'live' | 'archived';
  organizer_timezone?: string;
}

interface LotteryTicketData {
  id: string;
  ticket_number: number;
  status: 'available' | 'sold_online';
  book_id?: string;
}

interface LotteryBook {
  id: string;
  book_name: string;
  first_ticket_number: number;
  last_ticket_number: number;
  is_online_available: boolean;
  series_id?: string | null;
}

interface LotterySeries {
  id: string;
  series_name: string;
  display_order: number;
}


interface LotteryPrize {
  id: string;
  title: string;
  description: string;
  amount: number;
  prize_type: string;
  display_order: number;
}

interface LotteryTerm {
  id: string;
  content: string;
  display_order: number;
}

interface CommitteeMember {
  id: string;
  member_name: string;
  designation: string;
  display_order: number;
}

const STATUS_CHIP: Record<string, { label: string; icon: any; className: string }> = {
  online: { label: 'BOOKING OPEN', icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30' },
  live: { label: 'LIVE', icon: Radio, className: 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30' },
  booking_stopped: { label: 'BOOKING CLOSED', icon: Ban, className: 'bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30' },
  archived: { label: 'RESULT DECLARED', icon: Trophy, className: 'bg-lottery-gold/15 text-lottery-gold ring-1 ring-lottery-gold/30' },
  pending: { label: 'COMING SOON', icon: Clock, className: 'bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30' },
};

export default function LotteryDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [game, setGame] = useState<LotteryGame | null>(null);
  const [tickets, setTickets] = useState<LotteryTicketData[]>([]);
  const [books, setBooks] = useState<LotteryBook[]>([]);
  const [allBooks, setAllBooks] = useState<LotteryBook[]>([]);
  const [prizes, setPrizes] = useState<LotteryPrize[]>([]);
  const [terms, setTerms] = useState<LotteryTerm[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{ id: string; number: number }[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [seriesList, setSeriesList] = useState<LotterySeries[]>([]);
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null);

  const [onlineBookCount, setOnlineBookCount] = useState(0);
  const [offlineBookCount, setOfflineBookCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [imgLoaded, setImgLoaded] = useState(false);

  const ticketsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameId) fetchGameDetails();
    window.scrollTo(0, 0);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const statusInterval = setInterval(() => {
      if (game?.id) fetchGameDetails();
    }, 30000);
    return () => clearInterval(statusInterval);
  }, [game?.id, gameId]);

  useEffect(() => {
    if (game?.status === 'booking_stopped' && game.game_date) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const gameTime = new Date(game.game_date).getTime();
        const difference = gameTime - now;
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          if (days > 0) setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          else if (hours > 0) setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
          else setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining('Game is live');
        }
      };
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [game?.status, game?.game_date]);

  const fetchGameDetails = async () => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('lottery_games').select('*').eq('id', gameId).single();
      if (gameError) throw gameError;
      setGame(gameData);

      const { data: booksData, error: booksError } = await supabase
        .from('lottery_books').select('*').eq('lottery_game_id', gameId).order('first_ticket_number');
      if (booksError) throw booksError;
      const allBooksData = booksData || [];
      const onlineBooks = allBooksData.filter(b => b.is_online_available);
      const offlineBooks = allBooksData.filter(b => !b.is_online_available);
      setAllBooks(allBooksData as LotteryBook[]);
      setBooks(onlineBooks as LotteryBook[]);
      setOnlineBookCount(onlineBooks.length);
      setOfflineBookCount(offlineBooks.length);

      const { data: seriesData } = await supabase
        .from('lottery_series').select('*').eq('lottery_game_id', gameId).order('display_order');
      const allSeries = (seriesData || []) as LotterySeries[];
      setSeriesList(allSeries);
      setCurrentSeriesId(prev => prev ?? (allSeries[0]?.id ?? null));


      const { data: ticketsData, error: ticketsError } = await supabase
        .from('lottery_tickets').select('id, ticket_number, status, book_id')
        .eq('lottery_game_id', gameId).order('ticket_number');
      if (ticketsError) throw ticketsError;
      setTickets(ticketsData as LotteryTicketData[] || []);

      const { data: prizesData } = await supabase
        .from('lottery_prizes').select('*').eq('lottery_game_id', gameId).order('display_order');
      setPrizes(prizesData || []);

      const { data: termsData } = await supabase
        .from('lottery_terms').select('*').eq('lottery_game_id', gameId).order('display_order');
      setTerms(termsData || []);

      const { data: committeeData } = await supabase
        .from('lottery_organising_committee').select('*').eq('lottery_game_id', gameId).order('display_order');
      setCommittee(committeeData || []);
    } catch (error) {
      console.error('Error fetching game details:', error);
      toast({ title: "Error", description: "Failed to load game details. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string, ticketNumber: number) => {
    const isSelected = selectedTickets.some(t => t.id === ticketId);
    if (isSelected) setSelectedTickets(selectedTickets.filter(t => t.id !== ticketId));
    else setSelectedTickets([...selectedTickets, { id: ticketId, number: ticketNumber }]);
  };

  const handleBuyNow = () => {
    if (selectedTickets.length === 0) {
      ticketsRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!isMobile) {
        toast({ title: "Select tickets", description: "Please select at least one available ticket before proceeding.", variant: "destructive" });
      }
      return;
    }
    navigate(`/lottery/${gameId}/buy`, { state: { selectedTickets } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-4">
          <Skeleton className="w-full aspect-[16/9] rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Game Not Found</h2>
          <p className="text-muted-foreground mb-6">The lottery game you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const visibleBooks = seriesList.length > 0 && currentSeriesId
    ? allBooks.filter(b => b.series_id === currentSeriesId)
    : allBooks;
  const safeBookIndex = visibleBooks.length ? Math.min(currentBookIndex, visibleBooks.length - 1) : 0;
  const currentBook = visibleBooks[safeBookIndex];
  const currentBookTickets = currentBook && currentBook.is_online_available
    ? tickets.filter(t => t.book_id === currentBook.id) : [];

  const nextBook = () => { setCurrentBookIndex(p => visibleBooks.length ? (p + 1) % visibleBooks.length : 0); setSelectedTickets([]); };
  const prevBook = () => { setCurrentBookIndex(p => visibleBooks.length ? (p - 1 + visibleBooks.length) % visibleBooks.length : 0); setSelectedTickets([]); };
  const selectSeries = (id: string) => { setCurrentSeriesId(id); setCurrentBookIndex(0); setSelectedTickets([]); };


  const formatDate = (dateString: string) => formatDateWithTimezone(dateString, game?.organizer_timezone, false);
  const topPrize = prizes.filter(p => p.prize_type === 'main').sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
  const statusMeta = STATUS_CHIP[game.status] ?? STATUS_CHIP.online;
  const StatusIcon = statusMeta.icon;

  const renderStatusContent = () => {
    if (!game) return null;
    switch (game.status) {
      case 'booking_stopped':
        return (
          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden">
            <CardContent className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/15 flex items-center justify-center mb-4">
                <Hourglass className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Booking Closed</h3>
              <p className="text-muted-foreground text-sm mb-4">Approx. time remaining for the draw</p>
              <div className="text-3xl font-bold tracking-tight text-gold-shimmer tabular-nums">{timeRemaining}</div>
            </CardContent>
          </Card>
        );
      case 'live':
        return (
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent overflow-hidden">
            <CardContent className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4 animate-pulse">
                <Radio className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Draw is Live</h3>
              <p className="text-muted-foreground text-sm">Winners are being announced now</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Desktop Header */}
      {!isMobile && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 md:pb-32 space-y-5">
        {/* HERO — ticket image */}
        <Card className="overflow-hidden rounded-[24px] border border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_20px_50px_-20px_rgba(0,0,0,0.25)] p-0">
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              {game.ticket_image_url ? (
                <>
                  {!imgLoaded && <Skeleton className="absolute inset-0" />}
                  <img
                    src={game.ticket_image_url}
                    alt={`${game.title} lottery ticket`}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
                  <Ticket className="w-14 h-14 text-muted-foreground/40" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
              {/* Status chip */}
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md bg-background/85 ${statusMeta.className}`}>
                  <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
                  {statusMeta.label}
                </span>
              </div>
              {/* Price badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-[hsl(var(--lottery-gold))] text-[hsl(var(--navy))]">
                  <Ticket className="w-3 h-3" strokeWidth={2.5} />
                  ₹{game.ticket_price}
                </span>
              </div>
            </AspectRatio>
          </div>
        </Card>

        {/* IDENTITY CARD — title, headline, organiser */}
        <Card className="rounded-[20px] p-5 border border-border/60">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0">
              {game.organiser_logo_url ? (
                <img src={game.organiser_logo_url} alt="Organiser logo"
                  className="w-12 h-12 rounded-xl object-cover bg-muted border border-border/60" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted border border-border/60 flex items-center justify-center">
                  <Building className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                {game.organising_group_name || 'Organiser'}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight line-clamp-2">
                {game.title}
              </h1>
              {game.headline && (
                <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">{game.headline}</p>
              )}
            </div>
          </div>

          {/* Prize spotlight */}
          {topPrize && (
            <div className="mt-4 rounded-2xl p-4 bg-gradient-to-br from-lottery-gold/15 to-transparent border border-lottery-gold/25 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lottery-gold/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-lottery-gold" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Top Prize</div>
                <div className="text-2xl font-extrabold text-gold-shimmer leading-tight">
                  ₹{topPrize.amount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Meta grid */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                <Calendar className="w-3 h-3" /> Draw Date
              </div>
              <div className="text-sm font-semibold text-foreground truncate">{formatDate(game.game_date)}</div>
            </div>
            {game.stop_booking_time && (
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" /> Booking Closes
                </div>
                <div className="text-sm font-semibold text-foreground truncate">{formatDate(game.stop_booking_time)}</div>
              </div>
            )}
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                <Ticket className="w-3 h-3" /> Ticket Price
              </div>
              <div className="text-sm font-semibold text-foreground">₹{game.ticket_price}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                <BookOpen className="w-3 h-3" /> Books
              </div>
              <div className="text-sm font-semibold text-foreground truncate">
                {onlineBookCount} online · {offlineBookCount} offline
              </div>
            </div>
          </div>
        </Card>

        {/* Status content (booking stopped / live) */}
        {renderStatusContent()}

        {/* PRIZES */}
        {prizes.length > 0 && (
          <div className="space-y-3">
            {prizes.filter(p => p.prize_type === 'main').length > 0 && (
              <Card className="rounded-[20px] overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-lottery-gold/15 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-lottery-gold" />
                    </div>
                    Main Prizes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {prizes.filter(p => p.prize_type === 'main').map((prize) => (
                      <div key={prize.id} className="flex justify-between items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">{prize.title}</div>
                          {prize.description && (
                            <div className="text-xs text-muted-foreground truncate">{prize.description}</div>
                          )}
                        </div>
                        <div className="text-lottery-gold font-bold text-sm tabular-nums flex-shrink-0">
                          ₹{prize.amount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {prizes.filter(p => p.prize_type === 'incentive').length > 0 && (
              <Card className="rounded-[20px] overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                    Incentive Prizes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {prizes.filter(p => p.prize_type === 'incentive').map((prize) => (
                      <div key={prize.id} className="flex justify-between items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{prize.title}</div>
                          {prize.description && (
                            <div className="text-xs text-muted-foreground truncate">{prize.description}</div>
                          )}
                        </div>
                        <div className="text-lottery-gold font-bold text-sm tabular-nums flex-shrink-0">
                          ₹{prize.amount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Terms button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 rounded-2xl h-12">
              <ShieldCheck className="w-4 h-4 text-lottery-gold" />
              Terms, Rules & Organiser Info
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Terms & Conditions</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {terms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                    <div className="space-y-2">
                      {terms.map((term, index) => (
                        <p key={term.id} className="text-sm text-muted-foreground leading-relaxed">
                          {index + 1}. {term.content}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {committee.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Organising Committee
                    </h4>
                    <div className="space-y-2">
                      {committee.map((member) => (
                        <div key={member.id} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{member.member_name}</span>
                          <span className="text-xs text-muted-foreground">{member.designation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* TICKETS SECTION */}
        {game.status === 'online' && (
          <div ref={ticketsRef} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                <Ticket className="w-5 h-5 text-lottery-gold" />
                Select Your Tickets
              </h2>
              {!isMobile && (
                <Button onClick={handleBuyNow} className="rounded-2xl">
                  {selectedTickets.length > 0 ? `Buy ${selectedTickets.length} Ticket${selectedTickets.length > 1 ? 's' : ''}` : 'Select Tickets to Buy'}
                </Button>
              )}
            </div>

            {allBooks.length > 0 ? (
              <Card className="rounded-[20px] overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-4 h-4 text-lottery-gold flex-shrink-0" />
                      <span className="truncate">{currentBook?.book_name || "No Book Selected"}</span>
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={prevBook} disabled={allBooks.length <= 1}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground px-2 tabular-nums">
                        {currentBookIndex + 1}/{allBooks.length}
                      </span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={nextBook} disabled={allBooks.length <= 1}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {currentBook && (
                    <p className="text-xs text-muted-foreground">
                      Tickets: {currentBook.first_ticket_number}–{currentBook.last_ticket_number}
                      {!currentBook.is_online_available && " • Offline Book"}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {currentBook ? (
                    currentBook.is_online_available ? (
                      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                        {currentBookTickets.map((ticket) => {
                          const isSelected = selectedTickets.some(t => t.id === ticket.id);
                          return (
                            <LotteryTicket
                              key={ticket.id}
                              ticketNumber={ticket.ticket_number}
                              status={ticket.status}
                              isSelected={isSelected}
                              onClick={ticket.status === 'available'
                                ? () => handleTicketClick(ticket.id, ticket.ticket_number)
                                : undefined}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
                          <Clock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">Not available online</h3>
                        <p className="text-muted-foreground text-sm">This book can only be purchased offline.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">No books available</h3>
                      <p className="text-muted-foreground text-sm">This game doesn't have any books yet.</p>
                    </div>
                  )}
                </CardContent>
                {allBooks.length > 1 && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border/60 bg-muted/20">
                    <Button variant="outline" size="sm" onClick={prevBook} className="rounded-xl">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      Book {currentBookIndex + 1} of {allBooks.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextBook} className="rounded-xl">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="rounded-[20px]">
                <CardContent className="text-center py-10">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No tickets available</h3>
                  <p className="text-muted-foreground text-sm">This game doesn't have any tickets available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Sticky Buy Bar — Mobile Only */}
      {isMobile && game.status === 'online' && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-2 pt-1.5">
          <div className="rounded-xl bg-background/90 backdrop-blur-xl border border-border/60 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.25)] px-3 py-2 flex items-center gap-2.5">
            <div className="min-w-0 flex-1 leading-none">
              <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                {selectedTickets.length > 0 ? `${selectedTickets.length} selected` : 'No tickets'}
              </div>
              <div className="text-sm font-bold text-gold-shimmer leading-tight tabular-nums mt-0.5">
                ₹{selectedTickets.length * game.ticket_price}
              </div>
            </div>
            <Button
              onClick={handleBuyNow}
              className="flex-1 h-9 px-3 text-sm rounded-xl bg-[image:var(--gradient-gold)] hover:brightness-[1.03] text-[hsl(var(--navy))] font-bold shadow-[0_4px_14px_-10px_hsl(var(--lottery-gold)/0.6)]"
            >
              {selectedTickets.length > 0 ? 'Buy Now' : 'Select Tickets'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
