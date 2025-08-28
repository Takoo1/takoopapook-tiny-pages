
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface GamePreviewModalProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GamePreviewModal = ({ gameId, isOpen, onClose }: GamePreviewModalProps) => {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && gameId) {
      fetchGameData();
    }
  }, [isOpen, gameId]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lottery_games')
        .select(`
          *,
          lottery_books(*),
          lottery_prizes(*),
          lottery_terms(*),
          lottery_organising_committee(*)
        `)
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGameData(data);
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Game Preview</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading game details...</span>
          </div>
        ) : gameData ? (
          <div className="space-y-6">
            {/* Game Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Game Information</h3>
                <p><strong>Title:</strong> {gameData.title}</p>
                <p><strong>Description:</strong> {gameData.description || 'N/A'}</p>
                <p><strong>Organizer:</strong> {gameData.organising_group_name || 'N/A'}</p>
                <p><strong>Game Date:</strong> {new Date(gameData.game_date).toLocaleDateString()}</p>
                <p><strong>Ticket Price:</strong> ₹{gameData.ticket_price}</p>
                <p><strong>Total Tickets:</strong> {gameData.total_tickets}</p>
              </div>
              
              {gameData.ticket_image_url && (
                <div>
                  <h3 className="font-semibold mb-2">Ticket Image</h3>
                  <img 
                    src={gameData.ticket_image_url} 
                    alt="Ticket" 
                    className="w-full max-w-xs rounded border"
                  />
                </div>
              )}
            </div>

            {/* Books */}
            {gameData.lottery_books && gameData.lottery_books.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Books ({gameData.lottery_books.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {gameData.lottery_books.map((book: any) => (
                    <div key={book.id} className="p-2 border rounded text-sm">
                      <strong>{book.book_name}</strong><br />
                      Tickets: {book.first_ticket_number} - {book.last_ticket_number}<br />
                      Online: {book.is_online_available ? 'Yes' : 'No'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prizes */}
            {gameData.lottery_prizes && gameData.lottery_prizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Prizes ({gameData.lottery_prizes.length})</h3>
                <div className="space-y-2">
                  {gameData.lottery_prizes.map((prize: any) => (
                    <div key={prize.id} className="p-2 border rounded text-sm">
                      <strong>{prize.title}</strong> - {prize.prize_type}<br />
                      {prize.amount && <span>Amount: ₹{prize.amount}<br /></span>}
                      {prize.description && <span>Description: {prize.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            {gameData.lottery_terms && gameData.lottery_terms.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                <div className="space-y-1 text-sm">
                  {gameData.lottery_terms.map((term: any, index: number) => (
                    <p key={term.id}>• {term.content}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Organizing Committee */}
            {gameData.lottery_organising_committee && gameData.lottery_organising_committee.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Organizing Committee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {gameData.lottery_organising_committee.map((member: any) => (
                    <div key={member.id} className="p-2 border rounded text-sm">
                      <strong>{member.designation}</strong><br />
                      {member.member_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Failed to load game details.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
