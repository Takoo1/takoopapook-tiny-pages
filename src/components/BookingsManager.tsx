import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Ticket, Calendar, User, Phone, Mail, MapPin } from "lucide-react";

interface BookingData {
  id: string;
  ticket_number: number;
  booked_by_name: string;
  booked_by_phone: string;
  booked_by_email: string;
  booked_by_address: string;
  booked_at: string;
  game_title: string;
  organising_group_name: string;
  ticket_price: number;
  game_date: string;
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bookings.filter(booking => 
        booking.ticket_number.toString().includes(searchTerm) ||
        booking.booked_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booked_by_phone?.includes(searchTerm) ||
        booking.booked_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.game_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.organising_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch all sold tickets with game information
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select(`
          id,
          ticket_number,
          booked_by_name,
          booked_by_phone,
          booked_by_email,
          booked_by_address,
          booked_at,
          lottery_games!inner(
            title,
            organising_group_name,
            ticket_price,
            game_date
          )
        `)
        .eq('status', 'sold_online')
        .not('booked_at', 'is', null)
        .order('booked_at', { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the structure
      const transformedBookings: BookingData[] = (data || []).map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        booked_by_name: ticket.booked_by_name || 'N/A',
        booked_by_phone: ticket.booked_by_phone || 'N/A',
        booked_by_email: ticket.booked_by_email || 'N/A',
        booked_by_address: ticket.booked_by_address || 'N/A',
        booked_at: ticket.booked_at,
        game_title: (ticket.lottery_games as any)?.title || 'Unknown Game',
        organising_group_name: (ticket.lottery_games as any)?.organising_group_name || 'Unknown Organiser',
        ticket_price: (ticket.lottery_games as any)?.ticket_price || 0,
        game_date: (ticket.lottery_games as any)?.game_date || new Date().toISOString()
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Bookings Management ({bookings.length} total)
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by ticket number, name, phone, email, or game..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No matching bookings found" : "No bookings yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Bookings will appear here once customers purchase tickets"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Ticket #</TableHead>
                  <TableHead className="min-w-[200px]">Game Details</TableHead>
                  <TableHead className="min-w-[150px]">Organiser</TableHead>
                  <TableHead className="min-w-[180px]">Buyer Info</TableHead>
                  <TableHead className="min-w-[150px]">Contact</TableHead>
                  <TableHead className="min-w-[200px]">Address</TableHead>
                  <TableHead className="min-w-[120px]">Price</TableHead>
                  <TableHead className="min-w-[150px]">Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        #{booking.ticket_number}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{booking.game_title}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.game_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-medium truncate max-w-[150px]">
                        {booking.organising_group_name}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{booking.booked_by_name}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" />
                          <span>{booking.booked_by_phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{booking.booked_by_email}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-start gap-1 text-xs">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{booking.booked_by_address}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        ₹{booking.ticket_price}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(booking.booked_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(booking.booked_at), 'HH:mm:ss')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}