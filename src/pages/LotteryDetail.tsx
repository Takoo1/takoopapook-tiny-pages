import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryTicket } from "@/components/ui/lottery-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft, Calendar, Trophy, Ticket, Clock, BookOpen, ChevronLeft, ChevronRight, Gift, FileText, Users, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [onlineBookCount, setOnlineBookCount] = useState(0);
  const [offlineBookCount, setOfflineBookCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const ticketsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [gameId]);

  // Status polling for real-time updates
  useEffect(() => {
    if (!gameId) return;
    
    const statusInterval = setInterval(() => {
      if (game?.id) {
        fetchGameDetails();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(statusInterval);
  }, [game?.id, gameId]);
  
  // Countdown timer for booking stopped status
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

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeRemaining(`${minutes}m ${seconds}s`);
          }
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
      console.log('Fetching game details for gameId:', gameId);
      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from('lottery_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Game fetch error:', gameError);
        throw gameError;
      }
      console.log('Game data loaded:', gameData);
      setGame(gameData);

      // Fetch books for this game
      const { data: booksData, error: booksError } = await supabase
        .from('lottery_books')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('first_ticket_number');

      if (booksError) throw booksError;
      const allBooksData = booksData || [];
      const onlineBooks = allBooksData.filter(book => book.is_online_available);
      const offlineBooks = allBooksData.filter(book => !book.is_online_available);
      
      setAllBooks(allBooksData as LotteryBook[]);
      setBooks(onlineBooks as LotteryBook[]);
      setOnlineBookCount(onlineBooks.length);
      setOfflineBookCount(offlineBooks.length);

      // Fetch tickets with book information
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('lottery_tickets')
        .select('id, ticket_number, status, book_id')
        .eq('lottery_game_id', gameId)
        .order('ticket_number');

      if (ticketsError) throw ticketsError;
      
      // Store all tickets (we'll filter by current book later)
      setTickets(ticketsData as LotteryTicketData[] || []);

      // Fetch prizes
      const { data: prizesData, error: prizesError } = await supabase
        .from('lottery_prizes')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('display_order');

      if (prizesError) throw prizesError;
      setPrizes(prizesData || []);

      // Fetch terms
      const { data: termsData, error: termsError } = await supabase
        .from('lottery_terms')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('display_order');

      if (termsError) throw termsError;
      setTerms(termsData || []);

      // Fetch committee members
      const { data: committeeData, error: committeeError } = await supabase
        .from('lottery_organising_committee')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('display_order');

      if (committeeError) throw committeeError;
      setCommittee(committeeData || []);

    } catch (error) {
      console.error('Error fetching game details:', error);
      toast({
        title: "Error",
        description: "Failed to load game details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string, ticketNumber: number) => {
    const isSelected = selectedTickets.some(t => t.id === ticketId);
    if (isSelected) {
      setSelectedTickets(selectedTickets.filter(t => t.id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, { id: ticketId, number: ticketNumber }]);
    }
  };

  const handleBuyNow = () => {
    if (selectedTickets.length === 0) {
      // Scroll to tickets section if no tickets selected
      ticketsRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Only show warning in desktop mode
      if (!isMobile) {
        toast({
          title: "Select tickets",
          description: "Please select at least one available ticket before proceeding.",
          variant: "destructive",
        });
      }
      return;
    }
    
    navigate(`/lottery/${gameId}/buy`, {
      state: { selectedTickets }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Game Not Found</h2>
          <p className="text-muted-foreground mb-6">The lottery game you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const currentBook = allBooks[currentBookIndex];
  const currentBookTickets = currentBook && currentBook.is_online_available 
    ? tickets.filter(ticket => ticket.book_id === currentBook.id) 
    : [];

  const nextBook = () => {
    setCurrentBookIndex((prev) => (prev + 1) % allBooks.length);
    setSelectedTickets([]); // Clear selections when switching books
  };

  const prevBook = () => {
    setCurrentBookIndex((prev) => (prev - 1 + allBooks.length) % allBooks.length);
    setSelectedTickets([]); // Clear selections when switching books
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Function to render status-specific content
  const renderStatusContent = () => {
    if (!game) return null;

    switch (game.status) {
      case 'booking_stopped':
        return (
          <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Booking Stopped for this game
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                Approx. Time Remaining For the Game
              </p>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {timeRemaining}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'live':
        return (
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="text-center py-8">
              <div className="animate-pulse">
                <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white animate-pulse"
                size="lg"
              >
                Game is Live
              </Button>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {!isMobile && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Detail Section */}
        <div className="py-4 space-y-4">
          {/* Lottery Ticket Image */}
          {game.ticket_image_url && (
            <Card className="overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <img 
                  src={game.ticket_image_url} 
                  alt={`${game.title} lottery ticket`}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </Card>
          )}

          {/* Organiser Info & Game Title Row */}
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0">
              {game.organiser_logo_url ? (
                <img 
                  src={game.organiser_logo_url} 
                  alt="Organiser logo"
                  className="w-12 h-12 rounded-lg object-cover bg-muted border"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center">
                  <Building className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm md:text-lg font-bold text-foreground leading-tight mb-1">
                {game.title}
              </h1>
              {game.headline && (
                <p className="text-[10px] md:text-xs text-muted-foreground leading-snug">
                  {game.headline}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg md:text-2xl font-bold text-lottery-gold">
                ₹{game.ticket_price}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">per ticket</div>
            </div>
          </div>

          {/* Game Date & Books Count Row */}
          <div className="space-y-3 py-3 border-y border-border">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Draw Date:</span>
                <span className="font-medium text-foreground">{formatDate(game.game_date)}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Books:</span>
                <span className="font-medium text-foreground">
                  {onlineBookCount} online, {offlineBookCount} offline
                </span>
              </div>
            </div>
            {game.stop_booking_time && (
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Booking Stops:</span>
                <span className="font-medium text-foreground">{formatDate(game.stop_booking_time)}</span>
              </div>
            )}
          </div>

          {/* Prizes List */}
          {prizes.length > 0 && (
            <div className="space-y-4">
              {/* Main Prizes */}
              {prizes.filter(prize => prize.prize_type === 'main').length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                      <Gift className="w-3 h-3 md:w-4 md:h-4 text-lottery-gold" />
                      Main Prizes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {prizes.filter(prize => prize.prize_type === 'main').map((prize) => (
                        <div key={prize.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium text-xs md:text-sm">{prize.title}</div>
                            {prize.description && (
                              <div className="text-[10px] md:text-xs text-muted-foreground">{prize.description}</div>
                            )}
                          </div>
                          <div className="text-lottery-gold font-bold text-xs md:text-sm">
                            ₹{prize.amount?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Incentive Prizes */}
              {prizes.filter(prize => prize.prize_type === 'incentive').length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                      <Gift className="w-3 h-3 md:w-4 md:h-4 text-lottery-gold" />
                      Incentive Prizes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {prizes.filter(prize => prize.prize_type === 'incentive').map((prize) => (
                        <div key={prize.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                          <div>
                            <div className="font-medium text-sm">{prize.title}</div>
                            {prize.description && (
                              <div className="text-xs text-muted-foreground">{prize.description}</div>
                            )}
                          </div>
                          <div className="text-lottery-gold font-bold">
                            ₹{prize.amount?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Terms & Conditions Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
              >
                <FileText className="w-4 h-4" />
                Terms & Conditions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Terms & Conditions</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  {/* Terms */}
                  {terms.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                      <div className="space-y-2">
                        {terms.map((term, index) => (
                          <p key={term.id} className="text-sm text-muted-foreground">
                            {index + 1}. {term.content}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Organising Committee */}
                  {committee.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Organising Committee
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
        </div>

        {/* Status-specific Content */}
        {renderStatusContent()}

        {/* Tickets Section - Only show for online status */}
        {game.status === 'online' && (
          <div ref={ticketsRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-lottery-gold" />
                Select Tickets
              </h2>
              {/* Desktop Buy Button */}
              {!isMobile && (
                <Button 
                  onClick={handleBuyNow}
                  className="bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground"
                >
                  {selectedTickets.length > 0 ? `Buy ${selectedTickets.length} Tickets` : 'Select Tickets to Buy'}
                </Button>
              )}
            </div>
          
          {allBooks.length > 0 ? (
            <div className="space-y-4">
              {/* Book Navigation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-lottery-gold" />
                      {currentBook?.book_name || "No Book Selected"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevBook}
                        disabled={allBooks.length <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        Book {currentBookIndex + 1} of {allBooks.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextBook}
                        disabled={allBooks.length <= 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {currentBook && (
                    <p className="text-xs text-muted-foreground">
                      Tickets: {currentBook.first_ticket_number}-{currentBook.last_ticket_number}
                      {!currentBook.is_online_available && " • Offline Book"}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {currentBook ? (
                    currentBook.is_online_available ? (
                      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1">
                        {currentBookTickets.map((ticket) => {
                          const isSelected = selectedTickets.some(t => t.id === ticket.id);
                          return (
                            <LotteryTicket
                              key={ticket.id}
                              ticketNumber={ticket.ticket_number}
                              status={ticket.status}
                              isSelected={isSelected}
                              onClick={
                                ticket.status === 'available'
                                  ? () => handleTicketClick(ticket.id, ticket.ticket_number)
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Sorry, This book is not available online</h3>
                        <p className="text-muted-foreground text-sm">This book can only be purchased offline.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No books available</h3>
                      <p className="text-muted-foreground text-sm">This game doesn't have any books yet.</p>
                    </div>
                  )}
                </CardContent>
                {/* Bottom Book Navigation */}
                {allBooks.length > 1 && (
                  <div className="flex items-center justify-center gap-4 py-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevBook}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Book {currentBookIndex + 1} of {allBooks.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextBook}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No tickets available</h3>
                <p className="text-muted-foreground text-sm">This game doesn't have any tickets available yet.</p>
              </CardContent>
            </Card>
          )}
          </div>
        )}
      </div>

      {/* Sticky Buy Now Button - Mobile Only - Only show for online status */}
      {isMobile && game.status === 'online' && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <Button 
            onClick={handleBuyNow}
            className="w-full bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground py-3 font-semibold"
            size="lg"
          >
            {selectedTickets.length > 0 ? `Buy ${selectedTickets.length} Tickets` : 'Select Tickets to Buy'}
          </Button>
        </div>
      )}
    </div>
  );
}