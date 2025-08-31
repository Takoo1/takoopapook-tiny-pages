
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateGameForm } from "@/components/CreateGameForm";
import { FortuneCounterModal } from "@/components/FortuneCounterModal";
import { BookingsManager } from "@/components/BookingsManager";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Users, Target, LogOut, Coins, Edit, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface LotteryGame {
  id: string;
  title: string;
  description: string;
  game_date: string;
  ticket_price: number;
  total_tickets: number;
  organising_group_name: string;
  created_by_user_id: string;
  game_code: string | null;
  status: 'pending' | 'online' | 'booking_stopped' | 'live' | 'archived';
}

const GameOrganiserDashboard = () => {
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [archivedGames, setArchivedGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<LotteryGame | null>(null);
  const [fortuneCounters, setFortuneCounters] = useState<Record<string, number>>({});
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [selectedBookingsGame, setSelectedBookingsGame] = useState<LotteryGame | null>(null);
  const [joinGameOpen, setJoinGameOpen] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [gamePassword, setGamePassword] = useState("");
  const [joiningGame, setJoiningGame] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
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

      if (error || !profile || (profile.role !== 'organiser' && profile.role !== 'admin')) {
        setHasAccess(false);
        return;
      }

      setHasAccess(true);
      fetchMyGames();
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setAccessLoading(false);
    }
  };

  const fetchMyGames = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      let query = supabase
        .from('lottery_games')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is not admin, show their own games + games they're a member of
      if (profile?.role !== 'admin') {
        query = query.or(`created_by_user_id.eq.${session.user.id},id.in.(${await getMemberGameIds(session.user.id)})`);
      }

      const { data, error } = await query;

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
        description: "Failed to fetch your games",
        variant: "destructive",
      });
    }
  };

  const getMemberGameIds = async (userId: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('lottery_game_members')
        .select('lottery_game_id')
        .eq('user_id', userId);
      
      return data?.map(m => m.lottery_game_id).join(',') || '';
    } catch (error) {
      console.error('Error fetching member games:', error);
      return '';
    }
  };

  const handleJoinGame = async () => {
    if (!gameCode.trim() || !gamePassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter both game code and password",
        variant: "destructive",
      });
      return;
    }

    setJoiningGame(true);
    try {
      const { data, error } = await supabase.rpc('join_lottery_game_by_code', {
        p_game_code: gameCode.trim(),
        p_password: gamePassword.trim()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the game!",
      });
      
      setJoinGameOpen(false);
      setGameCode("");
      setGamePassword("");
      fetchMyGames(); // Refresh the games list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join game",
        variant: "destructive",
      });
    } finally {
      setJoiningGame(false);
    }
  };

  const handleFortuneCounterClick = (game: LotteryGame) => {
    setSelectedGame(game);
    setFortuneModalOpen(true);
  };

  const handleBookingsClick = (game: LotteryGame) => {
    setSelectedBookingsGame(game);
    setBookingsModalOpen(true);
  };

  const handleEditGame = (game: LotteryGame) => {
    setEditingGame(game);
    setCreateGameOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-2 px-2">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Organiser Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your lottery games</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => setCreateGameOpen(true)} 
            size="sm"
            className="bg-lottery-gold hover:bg-lottery-gold/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Game
          </Button>
          <Button 
            onClick={() => setJoinGameOpen(true)} 
            size="sm"
            variant="outline"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add Existing Game
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>

        {/* My Games */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Games ({games.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {games.length > 0 ? (
              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 border rounded-lg transition-all hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Game Title & Fortune Counter */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate pr-2">{game.title}</h3>
                        <Badge variant="secondary" className="text-xs shrink-0 bg-lottery-gold/10 text-lottery-gold">
                          <Coins className="h-3 w-3 mr-1" />
                          {fortuneCounters[game.id] || 0}
                        </Badge>
                      </div>
                      
                      {/* Game Code */}
                      {game.game_code && (
                        <div>
                          <Badge variant="outline" className="text-xs font-mono">
                            {game.game_code}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Game Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(game.game_date), 'MMM dd')}
                        </div>
                        <div>₹{game.ticket_price}/ticket</div>
                        <div>{game.total_tickets} tickets</div>
                        <div className="truncate">{game.organising_group_name}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGame(game)}
                          className="flex-1 text-xs h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFortuneCounterClick(game)}
                          className="flex-1 text-xs h-8"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Fortune
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingsClick(game)}
                          className="flex-1 text-xs h-8"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Bookings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-2">No Games Yet</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create your first lottery game to get started.
                </p>
                <Button 
                  onClick={() => setCreateGameOpen(true)} 
                  size="sm"
                  className="bg-lottery-gold hover:bg-lottery-gold/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Game
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Games Section */}
        {archivedGames.length > 0 && (
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Completed Games ({archivedGames.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {archivedGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 border rounded-lg transition-all bg-muted/20"
                  >
                    <div className="space-y-3">
                      {/* Game Title & Fortune Counter */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate pr-2 text-muted-foreground">{game.title}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Archived
                        </Badge>
                      </div>
                      
                      {/* Game Code */}
                      {game.game_code && (
                        <div>
                          <Badge variant="outline" className="text-xs font-mono">
                            {game.game_code}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Game Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(game.game_date), 'MMM dd')}
                        </div>
                        <div>₹{game.ticket_price}/ticket</div>
                        <div>{game.total_tickets} tickets</div>
                        <div className="truncate">{game.organising_group_name}</div>
                      </div>

                      {/* View Bookings Only */}
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingsClick(game)}
                          className="w-full text-xs h-8"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View Bookings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Game Modal */}
        <CreateGameForm
          isOpen={createGameOpen}
          onClose={() => {
            setCreateGameOpen(false);
            setEditingGame(null);
          }}
          onSuccess={() => {
            fetchMyGames();
            setCreateGameOpen(false);
            setEditingGame(null);
          }}
          editingGame={editingGame}
        />

        {/* Fortune Counter Modal */}
        {selectedGame && (
          <FortuneCounterModal
            isOpen={fortuneModalOpen}
            onClose={() => {
              setFortuneModalOpen(false);
              setSelectedGame(null);
            }}
            gameId={selectedGame.id}
            gameTitle={selectedGame.title}
            fortuneCounter={fortuneCounters[selectedGame.id] || 0}
            ticketPrice={selectedGame.ticket_price}
            isAdmin={false}
            onCounterUpdate={() => {
              fetchMyGames(); // Refresh fortune counters
            }}
          />
        )}

        {/* Join Game Modal */}
        <Dialog open={joinGameOpen} onOpenChange={setJoinGameOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Existing Game</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gameCode">Game Code</Label>
                <Input
                  id="gameCode"
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gamePassword">Password</Label>
                <Input
                  id="gamePassword"
                  type="password"
                  placeholder="Enter game password"
                  value={gamePassword}
                  onChange={(e) => setGamePassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleJoinGame}
                  disabled={joiningGame}
                  className="flex-1"
                >
                  {joiningGame ? "Joining..." : "Join Game"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJoinGameOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bookings Modal */}
        <Dialog open={bookingsModalOpen} onOpenChange={setBookingsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Bookings - {selectedBookingsGame?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedBookingsGame && (
              <BookingsManager gameId={selectedBookingsGame.id} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GameOrganiserDashboard;
