import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LotteryTicket } from "@/components/ui/lottery-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Trophy, Ticket, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  ticket_image_url: string;
  ticket_price: number;
  total_tickets: number;
}

interface LotteryTicketData {
  id: string;
  ticket_number: number;
  status: 'available' | 'sold_offline' | 'sold_online';
  book_id?: string;
}

interface LotteryBook {
  id: string;
  book_name: string;
  first_ticket_number: number;
  last_ticket_number: number;
  is_online_available: boolean;
}

export default function LotteryDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [game, setGame] = useState<LotteryGame | null>(null);
  const [tickets, setTickets] = useState<LotteryTicketData[]>([]);
  const [books, setBooks] = useState<LotteryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{ id: string; number: number }[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from('lottery_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      // Fetch books for this game
      const { data: booksData, error: booksError } = await supabase
        .from('lottery_books')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('first_ticket_number');

      if (booksError) throw booksError;
      const onlineBooks = (booksData || []).filter(book => book.is_online_available);
      setBooks(onlineBooks as LotteryBook[]);

      // Fetch tickets with book information
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('lottery_tickets')
        .select('id, ticket_number, status, book_id')
        .eq('lottery_game_id', gameId)
        .order('ticket_number');

      if (ticketsError) throw ticketsError;
      
      // Filter tickets to only show those from online-available books
      const onlineBookIds = onlineBooks.map(book => book.id);
      
      const filteredTickets = (ticketsData || []).filter(ticket => 
        onlineBookIds.includes(ticket.book_id)
      );
      
      setTickets(filteredTickets as LotteryTicketData[]);
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
      toast({
        title: "No tickets selected",
        description: "Please select at least one available ticket before proceeding.",
        variant: "destructive",
      });
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

  const currentBook = books[currentBookIndex];
  const currentBookTickets = currentBook ? tickets.filter(ticket => ticket.book_id === currentBook.id) : [];

  const nextBook = () => {
    setCurrentBookIndex((prev) => (prev + 1) % books.length);
    setSelectedTickets([]); // Clear selections when switching books
  };

  const prevBook = () => {
    setCurrentBookIndex((prev) => (prev - 1 + books.length) % books.length);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-border/50 hover:bg-card/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Info */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-lottery-gold" />
                    <CardTitle className="text-3xl font-bold text-foreground">
                      {game.title}
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground">{game.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-lottery-gold">
                    ${game.ticket_price}
                  </div>
                  <div className="text-sm text-muted-foreground">per ticket</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {game.ticket_image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={game.ticket_image_url} 
                    alt={`${game.title} ticket`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Draw Date:</span>
                  <span className="font-semibold text-foreground">{formatDate(game.game_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy Now Button - Top */}
        <div className="mb-6 text-center">
          <Button 
            onClick={handleBuyNow}
            disabled={selectedTickets.length === 0}
            className="bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground px-8 py-3"
            size="lg"
          >
            Buy Now ({selectedTickets.length} selected)
          </Button>
        </div>

        {/* Book Navigation and Current Book Display */}
        {books.length > 0 ? (
          <div className="space-y-6">
            {/* Book Navigation */}
            {books.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={prevBook}
                  className="border-border/50 hover:bg-card/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Book
                </Button>
                <span className="text-muted-foreground">
                  Book {currentBookIndex + 1} of {books.length}
                </span>
                <Button
                  variant="outline"
                  onClick={nextBook}
                  className="border-border/50 hover:bg-card/50"
                >
                  Next Book
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Current Book */}
            {currentBook && (
              <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-lottery-gold" />
                      <CardTitle className="text-lg">{currentBook.book_name}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        (Tickets {currentBook.first_ticket_number} - {currentBook.last_ticket_number})
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      Online Available
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentBookTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tickets available in this book</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Click on available tickets to select them for purchase
                      </p>
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-3">
                        {currentBookTickets.map((ticket) => {
                          const isSelected = selectedTickets.some(t => t.id === ticket.id);
                          return (
                            <LotteryTicket
                              key={ticket.id}
                              ticketNumber={ticket.ticket_number}
                              status={ticket.status}
                              onClick={
                                ticket.status === 'available'
                                  ? () => handleTicketClick(ticket.id, ticket.ticket_number)
                                  : undefined
                              }
                              className={`${isSelected ? "ring-2 ring-lottery-gold ring-offset-2" : ""}`}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No ticket books available</h3>
              <p className="text-muted-foreground">This game doesn't have any online ticket books set up yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Buy Now Button - Bottom */}
        <div className="mt-6 text-center">
          <Button 
            onClick={handleBuyNow}
            disabled={selectedTickets.length === 0}
            className="bg-lottery-gold hover:bg-lottery-gold/90 text-primary-foreground px-8 py-3"
            size="lg"
          >
            Buy Now ({selectedTickets.length} selected)
          </Button>
        </div>
      </div>
    </div>
  );
}