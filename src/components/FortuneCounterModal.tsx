import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface FortuneReset {
  id: string;
  reset_date: string;
  ticket_count: number;
  reset_by_user_id: string | null;
  requested_by_admin_id: string | null;
}

interface FortuneRequest {
  id: string;
  lottery_game_id: string;
  ticket_count: number;
  amount_due: number;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

interface FortuneCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  fortuneCounter: number;
  ticketPrice: number;
  isAdmin?: boolean;
  onCounterUpdate?: () => void;
}

export function FortuneCounterModal({ 
  isOpen, 
  onClose, 
  gameId, 
  gameTitle, 
  fortuneCounter, 
  ticketPrice,
  isAdmin = false,
  onCounterUpdate 
}: FortuneCounterModalProps) {
  const [resets, setResets] = useState<FortuneReset[]>([]);
  const [requests, setRequests] = useState<FortuneRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchResets();
      fetchRequests();
    }
  }, [isOpen, gameId]);

  const fetchResets = async () => {
    try {
      const { data, error } = await supabase
        .from('fortune_counter_resets')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('reset_date', { ascending: false });

      if (error) throw error;
      setResets(data || []);
    } catch (error) {
      console.error('Error fetching resets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reset history",
        variant: "destructive",
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('fortune_counter_requests')
        .select('*')
        .eq('lottery_game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reset requests",
        variant: "destructive",
      });
    }
  };

  const handleAdminRequest = async () => {
    const amountDue = fortuneCounter * ticketPrice;
    
    if (!window.confirm(`Request Fortune Counter Reset?\n\nThis will notify the organizer that Rs. ${amountDue} should be sent for ${fortuneCounter} tickets.`)) {
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase.rpc('admin_request_fortune_reset', {
        p_game_id: gameId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reset request sent to organizer successfully!",
      });

      await fetchRequests();
      onCounterUpdate?.();
    } catch (error) {
      console.error('Error requesting reset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to request Fortune Counter reset",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleOrganizerConfirm = async (requestId: string, amountDue: number, ticketCount: number) => {
    if (!window.confirm(`Confirm Fortune Counter Reset?\n\nPlease confirm you have received Rs. ${amountDue} for ${ticketCount} tickets. This will reset the counter to 0.`)) {
      return;
    }

    setConfirming(requestId);
    try {
      const { error } = await supabase.rpc('organizer_confirm_fortune_reset', {
        p_request_id: requestId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fortune Counter reset confirmed! ${ticketCount} tickets marked as paid.`,
      });

      await fetchResets();
      await fetchRequests();
      onCounterUpdate?.();
    } catch (error) {
      console.error('Error confirming reset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm Fortune Counter reset",
        variant: "destructive",
      });
    } finally {
      setConfirming(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fortune Counter - {gameTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Counter Display */}
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Current Fortune Counter</div>
            <div className="text-3xl font-bold text-primary">{fortuneCounter}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Online tickets sold since last reset
            </div>
            {fortuneCounter > 0 && (
              <div className="text-lg font-semibold text-green-600 mt-2">
                Amount Due: Rs. {(fortuneCounter * ticketPrice).toFixed(2)}
              </div>
            )}
          </div>

          {/* Admin Request Button */}
          {isAdmin && fortuneCounter > 0 && (
            <div className="text-center">
              <Button 
                onClick={handleAdminRequest}
                disabled={requesting}
                className="px-8"
                variant="outline"
              >
                {requesting ? "Requesting..." : "Request Reset"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Request organizer to confirm payment received
              </p>
            </div>
          )}

          {/* Pending Requests - For Organizers */}
          {!isAdmin && requests.filter(r => r.status === 'pending').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Reset Requests</h3>
              {requests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Admin requesting reset confirmation</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: Rs. {request.amount_due} for {request.ticket_count} tickets
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleOrganizerConfirm(request.id, request.amount_due, request.ticket_count)}
                      disabled={confirming === request.id}
                      size="sm"
                    >
                      {confirming === request.id ? "Confirming..." : "Confirm"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Note */}
          {isAdmin && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Admin View:</strong> Request a reset to notify the organizer. 
                They must confirm payment received before the counter resets.
              </p>
            </div>
          )}

          {/* Request History Table */}
          {requests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Request History</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.ticket_count}
                        </TableCell>
                        <TableCell className="font-medium">
                          Rs. {request.amount_due}
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.status === 'confirmed' ? 'default' : 'secondary'}>
                            {request.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Reset History Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reset History</h3>
            {resets.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reset Date</TableHead>
                      <TableHead>Tickets Count</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resets.map((reset) => (
                      <TableRow key={reset.id}>
                        <TableCell>
                          {format(new Date(reset.reset_date), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reset.ticket_count}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reset history found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}