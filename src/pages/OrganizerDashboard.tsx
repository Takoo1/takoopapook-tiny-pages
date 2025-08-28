import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotteryTicket } from "@/components/ui/lottery-ticket";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

interface GameData {
  id: string;
  title: string;
  organising_group_name: string;
  description?: string;
  game_date: string;
  ticket_price: number;
  starting_ticket_number: number;
  last_ticket_number: number;
  total_tickets: number;
}

interface TicketData {
  id: string;
  ticket_number: number;
  status: 'available' | 'sold_online';
}

const OrganizerDashboard = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalTickets: 0,
    onlineSold: 0,
    available: 0
  });
  const navigate = useNavigate();
  const ticketsPerPage = 100;

  useEffect(() => {
    const storedGame = sessionStorage.getItem('organizerGame');
    if (!storedGame) {
      navigate('/game-organiser-dashboard');
      return;
    }

    const game = JSON.parse(storedGame);
    fetchGameDetails(game.id);
  }, [navigate]);

  useEffect(() => {
    if (!gameData) return;

    // Set up real-time subscription for ticket updates
    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lottery_tickets',
          filter: `lottery_game_id=eq.${gameData.id}`
        },
        () => {
          fetchTickets(gameData.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameData]);

  const fetchGameDetails = async (gameId: string) => {
    try {
      const { data: game, error: gameError } = await supabase
        .from('lottery_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      setGameData(game);
      await fetchTickets(gameId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch game details",
        variant: "destructive",
      });
      navigate('/game-organiser-dashboard');
    }
  };

  const fetchTickets = async (gameId: string) => {
    try {
      const { data: ticketsData, error } = await supabase
        .from('lottery_tickets')
        .select('id, ticket_number, status')
        .eq('lottery_game_id', gameId)
        .order('ticket_number');

      if (error) throw error;

      setTickets((ticketsData || []) as TicketData[]);
      
      // Calculate stats
      const stats = ticketsData?.reduce((acc, ticket) => {
        acc.totalTickets++;
        if (ticket.status === 'sold_online') acc.onlineSold++;
        else acc.available++;
        return acc;
      }, { totalTickets: 0, onlineSold: 0, available: 0 }) || 
      { totalTickets: 0, onlineSold: 0, available: 0 };

      setStats(stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    }
  };

  // Tickets are no longer clickable - all offline management is done outside this system

  const handleLogout = () => {
    sessionStorage.removeItem('organizerGame');
    navigate('/game-organiser-dashboard');
  };

  if (!gameData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const currentTickets = tickets.slice(startIndex, startIndex + ticketsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{gameData.title}</h1>
            <p className="text-muted-foreground">{gameData.organising_group_name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Game Details */}
        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Description:</strong> {gameData.description || 'No description'}</p>
              <p><strong>Game Date:</strong> {new Date(gameData.game_date).toLocaleDateString()}</p>
              <p><strong>Ticket Price:</strong> ₹{gameData.ticket_price}</p>
            </div>
            <div>
              <p><strong>Ticket Range:</strong> {gameData.starting_ticket_number} - {gameData.last_ticket_number}</p>
              <p><strong>Total Tickets:</strong> {gameData.total_tickets}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalTickets}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.onlineSold}</div>
              <div className="text-sm text-muted-foreground">Online Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.available}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Grid */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lottery Tickets</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Page {currentPage} of {totalPages}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {currentTickets.map((ticket) => (
                <LotteryTicket
                  key={ticket.id}
                  ticketNumber={ticket.ticket_number}
                  status={ticket.status}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
