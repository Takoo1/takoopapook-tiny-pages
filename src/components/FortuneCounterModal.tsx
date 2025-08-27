import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FortuneReset {
  id: string;
  reset_date: string;
  ticket_count: number;
  reset_by_user_id: string | null;
  requested_by_admin_id: string | null;
}

interface FortuneCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  fortuneCounter: number;
  isAdmin?: boolean;
  onCounterUpdate?: () => void;
}

export function FortuneCounterModal({ 
  isOpen, 
  onClose, 
  gameId, 
  gameTitle, 
  fortuneCounter, 
  isAdmin = false,
  onCounterUpdate 
}: FortuneCounterModalProps) {
  const [resets, setResets] = useState<FortuneReset[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchResets();
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

  const handleReset = async () => {
    if (!window.confirm(`Reset Fortune Counter for "${gameTitle}"?\n\nThis will mark ${fortuneCounter} online sold tickets as paid and reset the counter to 0.`)) {
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase
        .from('fortune_counter_resets')
        .insert({
          lottery_game_id: gameId,
          ticket_count: fortuneCounter,
          reset_by_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fortune Counter reset successfully! ${fortuneCounter} tickets marked as paid.`,
      });

      await fetchResets();
      onCounterUpdate?.();
    } catch (error) {
      console.error('Error resetting counter:', error);
      toast({
        title: "Error",
        description: "Failed to reset Fortune Counter",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
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
          </div>

          {/* Reset Button - Only for Organizers */}
          {!isAdmin && fortuneCounter > 0 && (
            <div className="text-center">
              <Button 
                onClick={handleReset}
                disabled={resetting}
                className="px-8"
              >
                {resetting ? "Resetting..." : "Reset Fortune Counter"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Click to confirm you have received payment for these tickets
              </p>
            </div>
          )}

          {/* Admin Note */}
          {isAdmin && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Admin View:</strong> Only organizers can reset the Fortune Counter. 
                The reset confirms they have received payment for the online sold tickets.
              </p>
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
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Paid
                          </span>
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