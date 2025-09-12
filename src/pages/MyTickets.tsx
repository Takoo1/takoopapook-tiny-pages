import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Ticket, Calendar, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadTicket, generateTicketImage, type SerialConfig } from "@/lib/generateTicketImage";
import { format } from "date-fns";

interface TicketData {
  id: string;
  ticket_number: number;
  booked_at: string;
  status: string;
  booked_by_name: string;
  lottery_game: {
    id: string;
    title: string;
    game_date: string;
    ticket_price: number;
    ticket_image_url: string | null;
    ticket_serial_config: SerialConfig | null;
    status: string;
  };
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [ticketPreviews, setTicketPreviews] = useState<Map<string, string>>(new Map());
  const [generatingPreviews, setGeneratingPreviews] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchMyTickets();
  }, []);

  useEffect(() => {
    // Generate preview images for tickets when tickets are loaded
    generateTicketPreviews();
  }, [tickets]);

  const generateTicketPreviews = async () => {
    const newPreviews = new Map<string, string>();
    const previewPromises: Promise<void>[] = [];

    for (const ticket of tickets) {
      if (ticket.lottery_game.ticket_image_url && ticket.lottery_game.ticket_serial_config && !ticketPreviews.has(ticket.id)) {
        setGeneratingPreviews(prev => new Set(prev).add(ticket.id));
        
        const previewPromise = generateTicketImage(
          ticket.lottery_game.ticket_image_url,
          ticket.ticket_number.toString().padStart(ticket.lottery_game.ticket_serial_config.digitCount, '0'),
          ticket.lottery_game.ticket_serial_config
        ).then(dataUrl => {
          newPreviews.set(ticket.id, dataUrl);
        }).catch(error => {
          console.error('Error generating preview for ticket', ticket.id, error);
        }).finally(() => {
          setGeneratingPreviews(prev => {
            const newSet = new Set(prev);
            newSet.delete(ticket.id);
            return newSet;
          });
        });

        previewPromises.push(previewPromise);
      }
    }

    await Promise.all(previewPromises);
    
    if (newPreviews.size > 0) {
      setTicketPreviews(prev => new Map([...prev, ...newPreviews]));
    }
  };

  const fetchMyTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lottery_tickets')
        .select(`
          id,
          ticket_number,
          booked_at,
          status,
          booked_by_name,
          lottery_games!inner (
            id,
            title,
            game_date,
            ticket_price,
            ticket_image_url,
            ticket_serial_config,
            status
          )
        `)
        .eq('booked_by_user_id', user.id)
        .eq('status', 'sold_online')
        .order('booked_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedTickets = data?.map(ticket => ({
        ...ticket,
        lottery_game: Array.isArray(ticket.lottery_games) 
          ? ticket.lottery_games[0] 
          : ticket.lottery_games
      })) || [];

      setTickets(transformedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load your tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticket: TicketData) => {
    const { lottery_game } = ticket;
    
    if (!lottery_game.ticket_image_url || !lottery_game.ticket_serial_config) {
      toast({
        title: "Download Not Available",
        description: "This ticket doesn't have a downloadable image configured.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(prev => new Set(prev).add(ticket.id));

    try {
      await generateAndDownloadTicket(
        lottery_game.ticket_image_url,
        ticket.ticket_number,
        lottery_game.ticket_serial_config,
        lottery_game.title
      );
      
      toast({
        title: "Ticket Downloaded",
        description: `Ticket #${ticket.ticket_number} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticket.id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
      case 'online':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Online</Badge>;
      case 'booking_stopped':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Booking Stopped</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-lg md:text-2xl font-bold mb-6">My Tickets</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-lg md:text-2xl font-bold mb-6">My Tickets</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-sm md:text-lg font-semibold mb-2">No Tickets Yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              You haven't purchased any tickets yet. Browse our lottery games to get started!
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group tickets by game
  const ticketsByGame = tickets.reduce((acc, ticket) => {
    const gameId = ticket.lottery_game.id;
    if (!acc[gameId]) {
      acc[gameId] = {
        game: ticket.lottery_game,
        tickets: []
      };
    }
    acc[gameId].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { game: TicketData['lottery_game']; tickets: TicketData[] }>);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="w-6 h-6" />
        <h1 className="text-lg md:text-2xl font-bold">My Tickets</h1>
      </div>

      <div className="space-y-6">
        {Object.values(ticketsByGame).map(({ game, tickets: gameTickets }) => (
          <Card key={game.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm md:text-lg mb-2">{game.title}</CardTitle>
                  <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(game.game_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      ₹{game.ticket_price} per ticket
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(game.status)}
                  <Badge variant="outline">
                    {gameTickets.length} ticket{gameTickets.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-primary">
                          #{ticket.ticket_number.toString().padStart(5, '0')}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                      <div className="text-xs md:text-sm">Holder: {ticket.booked_by_name}</div>
                        <div className="text-xs md:text-sm">Purchased: {format(new Date(ticket.booked_at), 'PPp')}</div>
                      </div>

                      {game.ticket_image_url && game.ticket_serial_config && (
                        <div className="space-y-2">
                          {/* Ticket Preview */}
                          {ticketPreviews.has(ticket.id) ? (
                            <div className="relative group">
                              <img 
                                src={ticketPreviews.get(ticket.id)} 
                                alt={`Ticket #${ticket.ticket_number}`}
                                className="w-full h-32 object-contain bg-muted rounded border"
                              />
                              <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-90 hover:opacity-100 shadow-lg"
                                onClick={() => handleDownloadTicket(ticket)}
                                disabled={downloading.has(ticket.id)}
                                title="Download Ticket"
                              >
                                {downloading.has(ticket.id) ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          ) : generatingPreviews.has(ticket.id) ? (
                            <div className="w-full h-32 bg-muted rounded border flex items-center justify-center">
                              <div className="text-sm text-muted-foreground">Generating preview...</div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleDownloadTicket(ticket)}
                              disabled={downloading.has(ticket.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {downloading.has(ticket.id) ? 'Downloading...' : 'Download Ticket'}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}