
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
import { Plus, Calendar, Users, Target, LogOut, Coins } from "lucide-react";
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
}

const GameOrganiserDashboard = () => {
  const [games, setGames] = useState<LotteryGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [fortuneCounters, setFortuneCounters] = useState<Record<string, number>>({});
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [selectedBookingsGame, setSelectedBookingsGame] = useState<LotteryGame | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
    fetchMyGames();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the organiser dashboard",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile || (profile.role !== 'organiser' && profile.role !== 'admin')) {
        toast({
          title: "Access Denied",
          description: "Only users with organiser or admin role can access this dashboard",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Access check failed:', error);
      navigate('/');
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

      // If user is not admin, only show their own games
      if (profile?.role !== 'admin') {
        query = query.eq('created_by_user_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGames(data || []);

      // Fetch fortune counters
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


  const handleFortuneCounterClick = (game: LotteryGame) => {
    setSelectedGame(game);
    setFortuneModalOpen(true);
  };

  const handleBookingsClick = (game: LotteryGame) => {
    setSelectedBookingsGame(game);
    setBookingsModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFortuneCounterClick(game)}
                          className="flex-1 text-xs h-8"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Fortune Counter
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


        {/* Create Game Modal */}
        <CreateGameForm
          isOpen={createGameOpen}
          onClose={() => setCreateGameOpen(false)}
          onSuccess={() => {
            fetchMyGames();
            setCreateGameOpen(false);
          }}
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
