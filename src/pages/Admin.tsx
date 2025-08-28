
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FortuneCounterModal } from "@/components/FortuneCounterModal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, Target, BookOpen } from "lucide-react";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  ticket_price: number;
  total_tickets: number;
  starting_ticket_number: number;
  last_ticket_number: number;
  organising_group_name: string;
}

interface LotteryBook {
  id: string;
  book_name: string;
  first_ticket_number: number;
  last_ticket_number: number;
  is_online_available: boolean;
  total_tickets: number;
  available: number;
  sold_online: number;
}

export default function Admin() {
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [books, setBooks] = useState<LotteryBook[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [fortuneCounters, setFortuneCounters] = useState<Record<string, number>>({});
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const [selectedFortuneGame, setSelectedFortuneGame] = useState<{ id: string; title: string; counter: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (selectedGameId) {
      fetchBooks(selectedGameId);
      const game = games.find(g => g.id === selectedGameId);
      setSelectedGame(game || null);
    } else {
      setBooks([]);
      setSelectedGame(null);
    }
  }, [selectedGameId, games]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lottery_games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);

      // Fetch fortune counters for all games
      const counters: Record<string, number> = {};
      for (const game of data || []) {
        try {
          const { data: counter, error: counterError } = await supabase.rpc('get_fortune_counter', { game_id: game.id });
          if (!counterError) {
            counters[game.id] = counter || 0;
          }
        } catch (error) {
          console.error(`Error fetching fortune counter for game ${game.id}:`, error);
          counters[game.id] = 0;
        }
      }
      setFortuneCounters(counters);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lottery games",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async (gameId: string) => {
    try {
      const { data: booksData, error: booksError } = await supabase
        .from('lottery_books')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('first_ticket_number');

      if (booksError) throw booksError;

      // For each book, get ticket statistics
      const booksWithStats = await Promise.all(
        (booksData || []).map(async (book) => {
          const { data: tickets, error: ticketsError } = await supabase
            .from('lottery_tickets')
            .select('status')
            .eq('book_id', book.id);

          if (ticketsError) {
            console.error('Error fetching tickets for book:', book.id, ticketsError);
            return {
              ...book,
              total_tickets: book.last_ticket_number - book.first_ticket_number + 1,
              available: 0,
              sold_online: 0,
            };
          }

          const stats = (tickets || []).reduce((acc, ticket) => {
            if (ticket.status === 'available') {
              acc.available++;
            } else if (ticket.status === 'sold_online') {
              acc.sold_online++;
            }
            return acc;
          }, { available: 0, sold_online: 0 });

          return {
            ...book,
            total_tickets: book.last_ticket_number - book.first_ticket_number + 1,
            ...stats,
          };
        })
      );

      setBooks(booksWithStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch books",
        variant: "destructive",
      });
    }
  };

  const handleToggleBookAvailability = async (bookId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('lottery_books')
        .update({ is_online_available: !currentValue })
        .eq('id', bookId);

      if (error) throw error;

      // Update local state
      setBooks(prev => prev.map(book => 
        book.id === bookId 
          ? { ...book, is_online_available: !currentValue }
          : book
      ));

      toast({
        title: "Success",
        description: `Book ${!currentValue ? 'enabled' : 'disabled'} for online sales`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book availability",
        variant: "destructive",
      });
    }
  };

  const handleFortuneCounterClick = (game: LotteryGame) => {
    setSelectedFortuneGame({
      id: game.id,
      title: game.title,
      counter: fortuneCounters[game.id] || 0
    });
    setFortuneModalOpen(true);
  };

  const handleFortuneCounterUpdate = () => {
    fetchGames(); // Refresh to get updated counters
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-4">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage lottery games, tickets, and settings</p>
        </div>

        {/* Lottery Games Section */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Lottery Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {games.map((game) => (
                <div
                  key={game.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedGameId === game.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card/50 border-border hover:bg-card/80'
                  }`}
                  onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{game.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-lottery-gold/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFortuneCounterClick(game);
                          }}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {fortuneCounters[game.id] || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{format(new Date(game.game_date), 'MMM dd, yyyy')}</span>
                        <span>₹{game.ticket_price}</span>
                        <span>{game.total_tickets} tickets</span>
                        <span className="truncate">{game.organising_group_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manage Tickets Section - Book Wise */}
        {selectedGame && (
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manage Tickets - {selectedGame.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {books.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Name</TableHead>
                        <TableHead>Ticket Range</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Sold Online</TableHead>
                        <TableHead>Online Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.book_name}</TableCell>
                          <TableCell>
                            {book.first_ticket_number} - {book.last_ticket_number}
                          </TableCell>
                          <TableCell>{book.total_tickets}</TableCell>
                          <TableCell className="text-green-600">{book.available}</TableCell>
                          <TableCell className="text-green-800">{book.sold_online}</TableCell>
                          <TableCell>
                            <Switch
                              checked={book.is_online_available}
                              onCheckedChange={() => handleToggleBookAvailability(book.id, book.is_online_available)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No books found for this game
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Fortune Counter Modal */}
        {selectedFortuneGame && (
          <FortuneCounterModal
            isOpen={fortuneModalOpen}
            onClose={() => setFortuneModalOpen(false)}
            gameId={selectedFortuneGame.id}
            gameTitle={selectedFortuneGame.title}
            fortuneCounter={selectedFortuneGame.counter}
            isAdmin={true}
            onCounterUpdate={handleFortuneCounterUpdate}
          />
        )}
      </div>
    </div>
  );
}
