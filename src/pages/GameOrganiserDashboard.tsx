
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreateGameForm } from "@/components/CreateGameForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Users, Target, LogOut } from "lucide-react";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
    fetchMyGames();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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
        .eq('user_id', user.id)
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('lottery_games')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is not admin, only show their own games
      if (profile?.role !== 'admin') {
        query = query.eq('created_by_user_id', user.id);
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


  const handleGameSelect = (game: LotteryGame) => {
    sessionStorage.setItem('organizerGame', JSON.stringify(game));
    navigate('/organizer-dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-4">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">Game Organiser Dashboard</h1>
            <p className="text-muted-foreground">Manage your lottery games and access game controls</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateGameOpen(true)} className="bg-lottery-gold hover:bg-lottery-gold/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* My Games */}
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Games ({games.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {games.length > 0 ? (
              <div className="grid gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 border rounded-lg hover:bg-card/50 cursor-pointer transition-colors"
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{game.title}</h3>
                          {game.game_code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {game.game_code}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {fortuneCounters[game.id] || 0}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(game.game_date), 'MMM dd, yyyy')}
                          </div>
                          <div>₹{game.ticket_price} per ticket</div>
                          <div>{game.total_tickets} total tickets</div>
                          <div className="truncate">{game.organising_group_name}</div>
                        </div>
                        {game.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {game.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Games Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any games yet. Create your first lottery game to get started.
                </p>
                <Button onClick={() => setCreateGameOpen(true)} className="bg-lottery-gold hover:bg-lottery-gold/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Game
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
      </div>
    </div>
  );
};

export default GameOrganiserDashboard;
