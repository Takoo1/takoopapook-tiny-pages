import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const OrganizerLogin = () => {
  const [gameCode, setGameCode] = useState("");
  const [gamePassword, setGamePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [showGamesList, setShowGamesList] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated and has organiser role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please login first to access organizer dashboard",
          variant: "destructive",
        });
        return;
      }

      // Check if user has organiser role
      const { data: userProfile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userProfile || userProfile.role !== 'organiser') {
        toast({
          title: "Error",
          description: "Access denied. Only organizers can access this dashboard",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('lottery_games')
        .select('id, title, organising_group_name')
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

      // Store game info in sessionStorage for organizer dashboard (support multiple games)
      const existingGames = JSON.parse(sessionStorage.getItem('organizerGames') || '[]');
      const gameExists = existingGames.find((g: any) => g.id === data.id);
      
      if (!gameExists) {
        existingGames.push(data);
        sessionStorage.setItem('organizerGames', JSON.stringify(existingGames));
      }
      
      sessionStorage.setItem('organizerGame', JSON.stringify(data));
      navigate('/organizer-dashboard');
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

  const fetchAvailableGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Check if user has organiser role
      const { data: userProfile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userProfile || userProfile.role !== 'organiser') return;

      // Get stored games from sessionStorage
      const storedGames = JSON.parse(sessionStorage.getItem('organizerGames') || '[]');
      setAvailableGames(storedGames);
    } catch (error) {
      console.error('Error fetching available games:', error);
    }
  };

  const handleGameSelect = (gameId: string, gameTitle: string) => {
    const gameData = { id: gameId, title: gameTitle };
    sessionStorage.setItem('organizerGame', JSON.stringify(gameData));
    navigate('/organizer-dashboard');
  };

  useEffect(() => {
    fetchAvailableGames();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Organizer Login</CardTitle>
          <CardDescription>
            Enter your game code and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Add New Game"}
            </Button>
          </form>

          {/* Available Games Section */}
          {availableGames.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowGamesList(!showGamesList)}
                className="w-full"
              >
                {showGamesList ? "Hide" : "Show"} My Games ({availableGames.length})
              </Button>
              
              {showGamesList && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Available Games:</h3>
                  {availableGames.map((game) => (
                    <div
                      key={game.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleGameSelect(game.id, game.title)}
                    >
                      <div className="font-semibold">{game.title}</div>
                      <div className="text-sm text-muted-foreground">{game.organising_group_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-sm"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizerLogin;