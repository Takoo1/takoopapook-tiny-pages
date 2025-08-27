import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LotteryTicket } from "@/components/ui/lottery-ticket";
import { FortuneCounterModal } from "@/components/FortuneCounterModal";
import { BookManager } from "@/components/BookManager";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Settings, ArrowLeft, Trophy, LogIn, BookOpen, Trash2, Edit, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  ticket_image_url: string;
  ticket_price: number;
  total_tickets: number;
  game_code: string;
  game_password: string;
  organising_group_name?: string;
}

interface LotteryTicketData {
  id: string;
  ticket_number: number;
  status: 'available' | 'sold_offline' | 'sold_online';
  book_id?: string;
}

interface Book {
  id: string;
  book_name: string;
  first_ticket_number: number;
  last_ticket_number: number;
  is_online_available: boolean;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [tickets, setTickets] = useState<LotteryTicketData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Fortune Counter state
  const [fortuneCounters, setFortuneCounters] = useState<{[gameId: string]: number}>({});
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const [selectedFortuneGame, setSelectedFortuneGame] = useState<{id: string, title: string} | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_date: '',
    ticket_price: '',
    organising_group_name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  
  // Edit Game state
  const [editingGame, setEditingGame] = useState<LotteryGame | null>(null);

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isAdmin = await checkUserRole(session.user.id);
        setIsAuthenticated(isAdmin);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  };

  const handleSignIn = () => {
    // Redirect to home page where they can sign in
    navigate('/');
    toast({
      title: "Sign In Required",
      description: "Please sign in to access the admin dashboard",
    });
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (games.length > 0) {
      fetchFortuneCounters();
    }
  }, [games]);

  useEffect(() => {
    if (selectedGame) {
      fetchTickets(selectedGame);
    }
  }, [selectedGame]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_games')
        .select('id, title, description, game_date, ticket_image_url, ticket_price, total_tickets, game_code, game_password, organising_group_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      });
    }
  };

  const handleEditGame = (game: LotteryGame) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description || '',
      game_date: game.game_date,
      ticket_price: game.ticket_price?.toString() || '',
      organising_group_name: game.organising_group_name || '',
    });
    setShowCreateForm(true);
  };

  const fetchTickets = async (gameId: string) => {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select('id, ticket_number, status')
        .eq('lottery_game_id', gameId)
        .order('ticket_number');

      if (error) throw error;
      setTickets((data || []) as LotteryTicketData[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchFortuneCounters = async () => {
    try {
      const counters: {[gameId: string]: number} = {};
      
      for (const game of games) {
        const { data, error } = await supabase.rpc('get_fortune_counter', { game_id: game.id });
        if (error) throw error;
        counters[game.id] = data || 0;
      }
      
      setFortuneCounters(counters);
    } catch (error) {
      console.error('Error fetching fortune counters:', error);
    }
  };

  const handleFortuneCounterClick = (gameId: string, gameTitle: string) => {
    setSelectedFortuneGame({ id: gameId, title: gameTitle });
    setFortuneModalOpen(true);
  };

  const handleFortuneCounterUpdate = () => {
    fetchFortuneCounters();
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (books.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one book before creating the game",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let ticketImageUrl = '';

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('lottery-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lottery-images')
          .getPublicUrl(fileName);

        ticketImageUrl = publicUrl;
      }

      // Generate random codes
      const { data: gameCodeData } = await supabase.rpc('generate_random_code', { length: 4 });
      const { data: passwordData } = await supabase.rpc('generate_random_code', { length: 6 });

      // Calculate total tickets from books
      const totalTickets = books.reduce((total, book) => {
        return total + (book.last_ticket_number - book.first_ticket_number + 1);
      }, 0);

      // Create lottery game
      const { data: gameData, error: gameError } = await supabase
        .from('lottery_games')
        .insert({
          title: formData.title,
          description: formData.description,
          game_date: formData.game_date,
          ticket_price: parseFloat(formData.ticket_price),
          total_tickets: totalTickets,
          ticket_image_url: ticketImageUrl,
          game_code: gameCodeData,
          game_password: passwordData,
          organising_group_name: formData.organising_group_name,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create books and generate tickets
      for (const book of books) {
        // Create book record
        const { data: bookData, error: bookError } = await supabase
          .from('lottery_books')
          .insert({
            lottery_game_id: gameData.id,
            book_name: book.book_name,
            first_ticket_number: book.first_ticket_number,
            last_ticket_number: book.last_ticket_number,
            is_online_available: book.is_online_available,
          })
          .select()
          .single();

        if (bookError) throw bookError;

        // Generate tickets for this book
        const { error: ticketsError } = await supabase.rpc('generate_lottery_tickets_for_book', {
          game_id: gameData.id,
          book_id: bookData.id,
          start_num: book.first_ticket_number,
          end_num: book.last_ticket_number
        });

        if (ticketsError) throw ticketsError;
      }

      toast({
        title: "Success!",
        description: "Lottery game created successfully with books",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        game_date: '',
        ticket_price: '',
        organising_group_name: '',
      });
      setBooks([]);
      setImageFile(null);
      setShowCreateForm(false);
      fetchGames();
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create lottery game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, currentStatus: string) => {
    // Only allow changing sold_offline back to available with confirmation
    if (currentStatus === 'sold_offline') {
      const confirmed = window.confirm("Mark this ticket available?");
      if (!confirmed) return;
      
      try {
        const { error } = await supabase
          .from('lottery_tickets')
          .update({ status: 'available' })
          .eq('id', ticketId);

        if (error) throw error;

        setTickets(tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'available' }
            : ticket
        ));

        toast({
          title: "Success",
          description: "Ticket status updated to available",
        });
      } catch (error) {
        console.error('Error updating ticket status:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket status",
          variant: "destructive",
        });
      }
    }
    // Do nothing for available and sold_online tickets - admin cannot mark tickets as sold_offline
  };

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${gameTitle}"? This action cannot be undone and will delete all associated tickets and data.`);
    if (!confirmed) return;

    try {
      setLoading(true);
      
      // Delete game (cascade will handle tickets and books)
      const { error } = await supabase
        .from('lottery_games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });

      fetchGames();
      if (selectedGame === gameId) {
        setSelectedGame(null);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      description: '',
      game_date: '',
      ticket_price: '',
      organising_group_name: '',
    });
    setBooks([]);
    setImageFile(null);
    setShowCreateForm(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lottery-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-8 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
            <p className="text-muted-foreground">You need admin privileges to access this dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              <p>Please sign in with an admin account on the home page.</p>
              <p>Contact your administrator to get admin privileges.</p>
            </div>
            <Button 
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-lottery-gold to-lottery-gold-light hover:from-lottery-gold-light hover:to-lottery-gold text-primary-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Go to Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-border/50 hover:bg-card/50"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-sm">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-5 md:w-6 h-5 md:h-6 text-lottery-gold" />
              <h1 className="text-xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-lottery-gold to-lottery-gold-light hover:from-lottery-gold-light hover:to-lottery-gold text-primary-foreground text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1 md:mr-2" />
              Create New Game
            </Button>
            
            <Button 
              onClick={() => navigate('/global-fortune-counter')}
              variant="outline"
              className="border-lottery-gold text-lottery-gold hover:bg-lottery-gold hover:text-primary-foreground text-sm"
              size="sm"
            >
              <Target className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Global Fortune Counter</span>
              <span className="sm:hidden">Fortune Counter</span>
            </Button>
          </div>
        </div>

        {/* Create Game Form */}
        {showCreateForm && (
          <Card className="mb-8 bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">
                {editingGame ? 'Edit Lottery Game' : 'Create New Lottery Game'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Game Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket_price">Ticket Price ($)</Label>
                    <Input
                      id="ticket_price"
                      type="number"
                      step="0.01"
                      value={formData.ticket_price}
                      onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="game_date">Game Date & Time</Label>
                    <Input
                      id="game_date"
                      type="datetime-local"
                      value={formData.game_date}
                      onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organising_group_name">Organising Group Name</Label>
                    <Input
                      id="organising_group_name"
                      value={formData.organising_group_name}
                      onChange={(e) => setFormData({ ...formData, organising_group_name: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                
                {/* Book Management Section */}
                <BookManager 
                  books={books}
                  onBooksChange={setBooks}
                />
                
                <div>
                  <Label htmlFor="image">Ticket Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-lottery-gold to-lottery-gold-light hover:from-lottery-gold-light hover:to-lottery-gold text-primary-foreground"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Game'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}


        {/* Games List */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Lottery Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {games.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No games created yet</p>
                ) : (
                  games.map((game) => (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedGame === game.id
                          ? 'border-lottery-gold bg-lottery-gold/10'
                          : 'border-border/30 hover:border-lottery-gold/50'
                      }`}
                      onClick={() => setSelectedGame(game.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-lottery-gold" />
                          <h3 className="font-semibold text-foreground">{game.title}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGame(game);
                            }}
                            className="text-lottery-gold hover:text-lottery-gold hover:bg-lottery-gold/10 h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGame(game.id, game.title);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${game.ticket_price} per ticket</span>
                          <span>{game.total_tickets} tickets</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-lottery-gold font-medium">Code: {game.game_code}</span>
                          <span className="text-lottery-gold font-medium">Pass: {game.game_password}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFortuneCounterClick(game.id, game.title);
                            }}
                            className="w-full text-left hover:bg-lottery-gold/5 rounded p-1 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Fortune Counter:</span>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                {fortuneCounters[game.id] || 0}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Click to view payment history
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tickets Management */}
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Manage Tickets</CardTitle>
              {selectedGame && (
                <p className="text-sm text-muted-foreground">
                  Click blue tickets (sold offline) to mark them as available
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedGame ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a game to manage its tickets
                </p>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {tickets.map((ticket) => (
                    <LotteryTicket
                      key={ticket.id}
                      ticketNumber={ticket.ticket_number}
                      status={ticket.status}
                      onClick={() => handleTicketStatusChange(ticket.id, ticket.status)}
                      forceClickable={ticket.status === 'sold_offline'}
                      className={ticket.status === 'sold_offline' ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fortune Counter Modal */}
      {selectedFortuneGame && (
        <FortuneCounterModal
          isOpen={fortuneModalOpen}
          onClose={() => setFortuneModalOpen(false)}
          gameId={selectedFortuneGame.id}
          gameTitle={selectedFortuneGame.title}
          fortuneCounter={fortuneCounters[selectedFortuneGame.id] || 0}
          isAdmin={true}
          onCounterUpdate={handleFortuneCounterUpdate}
        />
      )}
    </div>
  );
}