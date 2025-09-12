
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FortuneCounterModal } from "@/components/FortuneCounterModal";
import { CreateGameForm } from "@/components/CreateGameForm";
import { GamePreviewModal } from "@/components/GamePreviewModal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Trash2, Eye, Target, Calendar, Users, Gamepad2, ImageIcon, Trophy, Bell, MessageCircle } from "lucide-react";
import { MediaManager } from "@/components/MediaManager";
import { BookingsManager } from "@/components/BookingsManager";
import { WinnersManager } from "@/components/WinnersManager";
import { NotificationsManager } from "@/components/NotificationsManager";
import { FeedbackManager } from "@/components/FeedbackManager";

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
  game_code: string | null;
  status: 'pending' | 'online' | 'booking_stopped' | 'live' | 'archived';
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
  const [archivedGames, setArchivedGames] = useState<LotteryGame[]>([]);
  const [books, setBooks] = useState<LotteryBook[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [fortuneCounters, setFortuneCounters] = useState<Record<string, number>>({});
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const [selectedFortuneGame, setSelectedFortuneGame] = useState<{ id: string; title: string; counter: number; ticket_price: number } | null>(null);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [previewGameId, setPreviewGameId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
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

  const checkAccess = async () => {
    try {
      setAccessLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setHasAccess(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        setHasAccess(false);
        return;
      }

      setHasAccess(true);
      fetchGames();
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setAccessLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lottery_games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Separate active and archived games
      const activeGames = (data || []).filter(game => game.status !== 'archived');
      const archived = (data || []).filter(game => game.status === 'archived');
      
      setGames(activeGames);
      setArchivedGames(archived);

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

  const handleStatusChange = async (gameId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('lottery_games')
        .update({ status: newStatus })
        .eq('id', gameId);

      if (error) throw error;

      // Refresh games to handle archived/active separation
      fetchGames();

      toast({
        title: "Success",
        description: `Game status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update game status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase.rpc('purge_lottery_game', { p_game_id: gameId });

      if (error) throw error;

      // Remove from local state
      setGames(prev => prev.filter(game => game.id !== gameId));
      
      toast({
        title: "Success",
        description: "Game permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete game",
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
      counter: fortuneCounters[game.id] || 0,
      ticket_price: game.ticket_price
    });
    setFortuneModalOpen(true);
  };

  const handleFortuneCounterUpdate = () => {
    fetchGames(); // Refresh to get updated counters
  };

  const handleViewGame = (gameId: string) => {
    setPreviewGameId(gameId);
    setPreviewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
      case 'online':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Online</Badge>;
      case 'booking_stopped':
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">Booking Stopped</Badge>;
      case 'live':
        return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">Live</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, You are not allowed to enter This Page
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-lottery-gold hover:bg-lottery-gold/90">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage lottery games, bookings, and system settings</p>
        </div>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="winners" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Winners
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="fortune" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Fortune Counter
            </TabsTrigger>
          </TabsList>

          {/* Game Manager Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Lottery Games</h2>
              <Button onClick={() => setCreateGameOpen(true)} className="bg-lottery-gold hover:bg-lottery-gold/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Game
              </Button>
            </div>

            {/* Compact Games List */}
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  All Games ({games.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game Title</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Tickets</TableHead>
                        <TableHead>Organiser</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fortune</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {games.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>
                            <div className="font-medium">{game.title}</div>
                            {game.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {game.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {game.game_code && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {game.game_code}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(game.game_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>₹{game.ticket_price}</TableCell>
                          <TableCell>{game.total_tickets}</TableCell>
                          <TableCell>
                            <div className="truncate max-w-[150px]">
                              {game.organising_group_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(game.status)}
                              <Select value={game.status} onValueChange={(value) => handleStatusChange(game.id, value)}>
                                <SelectTrigger className="w-24 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-lottery-gold/20"
                              onClick={() => handleFortuneCounterClick(game)}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              {fortuneCounters[game.id] || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewGame(game.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Game Permanently</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the game "{game.title}" and all associated data including tickets, books, prizes, terms, and committee information.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteGame(game.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
                              >
                                Books
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Manage Tickets Section - Book Wise */}
            {selectedGame && (
              <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Manage Books - {selectedGame.title}
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
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaManager />
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners" className="space-y-6">
            <WinnersManager />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsManager />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <FeedbackManager />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingsManager />
          </TabsContent>

          <TabsContent value="fortune">
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fortune Counter Management ({games.filter(game => (fortuneCounters[game.id] || 0) > 0).length} games with counters)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {games.filter(game => (fortuneCounters[game.id] || 0) > 0).length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Game Title</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Organiser</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Fortune Counter</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games
                          .filter(game => (fortuneCounters[game.id] || 0) > 0)
                          .map((game) => (
                          <TableRow key={game.id}>
                            <TableCell>
                              <div className="font-medium">{game.title}</div>
                              {game.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {game.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {game.game_code && (
                                <Badge variant="outline" className="text-xs font-mono">
                                  {game.game_code}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(game.game_date), 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>₹{game.ticket_price}</TableCell>
                            <TableCell>
                              <div className="truncate max-w-[150px]">
                                {game.organising_group_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(game.status)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFortuneCounterClick(game)}
                                className="bg-lottery-gold/10 hover:bg-lottery-gold/20 border-lottery-gold/30 text-lottery-gold font-semibold"
                              >
                                <Target className="h-3 w-3 mr-1" />
                                {fortuneCounters[game.id] || 0}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewGame(game.id)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Fortune Counters</h3>
                    <p className="text-muted-foreground">
                      No games currently have active fortune counters. Counters increase when tickets are sold online.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Completed Games Section */}
        {archivedGames.length > 0 && (
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Completed Games ({archivedGames.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game Title</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Organiser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedGames.map((game) => (
                      <TableRow key={game.id} className="opacity-60">
                        <TableCell>
                          <div className="font-medium text-muted-foreground">{game.title}</div>
                          {game.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {game.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {game.game_code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {game.game_code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(game.game_date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>₹{game.ticket_price}</TableCell>
                        <TableCell>{game.total_tickets}</TableCell>
                        <TableCell>
                          <div className="truncate max-w-[150px]">
                            {game.organising_group_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(game.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewGame(game.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Game Modal */}
        <CreateGameForm
          isOpen={createGameOpen}
          onClose={() => setCreateGameOpen(false)}
          onSuccess={fetchGames}
        />

        {/* Fortune Counter Modal */}
        {selectedFortuneGame && (
          <FortuneCounterModal
            isOpen={fortuneModalOpen}
            onClose={() => setFortuneModalOpen(false)}
            gameId={selectedFortuneGame.id}
            gameTitle={selectedFortuneGame.title}
            fortuneCounter={selectedFortuneGame.counter}
            ticketPrice={selectedFortuneGame.ticket_price}
            isAdmin={true}
            onCounterUpdate={handleFortuneCounterUpdate}
          />
        )}

        {/* Game Preview Modal */}
        {previewGameId && (
          <GamePreviewModal
            gameId={previewGameId}
            isOpen={previewModalOpen}
            onClose={() => {
              setPreviewModalOpen(false);
              setPreviewGameId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
