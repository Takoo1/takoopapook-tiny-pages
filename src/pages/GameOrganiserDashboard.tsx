import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Settings, Trash2 } from "lucide-react";

interface GameData {
  id: string;
  title: string;
  organising_group_name?: string;
  game_code?: string;
}

const GameOrganiserDashboard = () => {
  const [games, setGames] = useState<GameData[]>([]);
  const [gameCode, setGameCode] = useState("");
  const [gamePassword, setGamePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAccess();
    loadSavedGames();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Access Denied",
          description: "Please login to access the organiser dashboard",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Check if user has organiser role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, email')
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

      setUserProfile(profile);
    } catch (error) {
      console.error('Error checking user access:', error);
      navigate('/');
    }
  };

  const loadSavedGames = () => {
    const savedGames = localStorage.getItem('organizerGames');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('lottery_games')
        .select('id, title, organising_group_name, game_code')
        .eq('game_code', gameCode.toUpperCase())
        .eq('game_password', gamePassword.toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Credentials",
          description: "Game code or password is incorrect.",
          variant: "destructive",
        });
        return;
      }

      // Check if game already exists in list
      const existingGame = games.find((g) => g.id === data.id);
      if (existingGame) {
        toast({
          title: "Game Already Added",
          description: "This game is already in your list.",
          variant: "destructive",
        });
        return;
      }

      // Add game to list
      const updatedGames = [...games, data];
      setGames(updatedGames);
      
      // Save to localStorage
      localStorage.setItem('organizerGames', JSON.stringify(updatedGames));

      toast({
        title: "Game Added",
        description: `Successfully added "${data.title}" to your games list.`,
      });

      setGameCode("");
      setGamePassword("");
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (game: GameData) => {
    // Set the selected game for the organizer dashboard
    sessionStorage.setItem('organizerGame', JSON.stringify(game));
    navigate('/organizer-dashboard');
  };

  const handleRemoveGame = (gameId: string) => {
    const updatedGames = games.filter((g) => g.id !== gameId);
    setGames(updatedGames);
    localStorage.setItem('organizerGames', JSON.stringify(updatedGames));
    
    toast({
      title: "Game Removed",
      description: "Game has been removed from your list.",
    });
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Game Organiser Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {userProfile.full_name || userProfile.email}
          </p>
        </div>

        {/* Add New Game Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Games</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Game
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
                <DialogDescription>
                  Enter the game code and password to add a new game to your dashboard.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGame} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gameCode">Game Code</Label>
                  <Input
                    id="gameCode"
                    type="text"
                    placeholder="Enter 4-digit game code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gamePassword">Password</Label>
                  <Input
                    id="gamePassword"
                    type="password"
                    placeholder="Enter 6-digit password"
                    value={gamePassword}
                    onChange={(e) => setGamePassword(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Adding..." : "Add Game"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Games List */}
        {games.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Games Added</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first game using the "Add New Game" button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      {game.organising_group_name && (
                        <CardDescription className="mt-1">
                          {game.organising_group_name}
                        </CardDescription>
                      )}
                      {game.game_code && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Code: {game.game_code}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGame(game.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleGameSelect(game)}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Game
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center pt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOrganiserDashboard;