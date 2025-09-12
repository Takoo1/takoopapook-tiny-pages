import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Upload, Trash2, Plus, X, Users, Calendar } from "lucide-react";

interface Winner {
  id: string;
  name: string;
  prize_position: number;
  details: string | null;
  image_url: string;
  is_active: boolean;
  created_at: string;
  lottery_game_id: string | null;
  custom_game_id: string | null;
  prize_type: string;
  lottery_games?: {
    title: string;
    game_date: string;
  };
  custom_winner_games?: {
    game_name: string;
    game_date: string;
  };
}

interface WinnerFormData {
  prize_type: 'main_prize' | 'incentive_prize';
  prize_position: number;
  name: string;
  details: string;
  image: File | null;
}

export function WinnersManager() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Game form data
  const [gameName, setGameName] = useState("");
  const [gameDate, setGameDate] = useState("");
  
  // Winners form data
  const [winnersData, setWinnersData] = useState<WinnerFormData[]>([
    { prize_type: 'main_prize', prize_position: 1, name: '', details: '', image: null }
  ]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          lottery_games!winners_lottery_game_id_fkey (
            title,
            game_date
          ),
          custom_winner_games!fk_winners_custom_game_id (
            game_name,
            game_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast({
        title: "Error",
        description: "Failed to fetch winners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWinnerRow = () => {
    const nextPosition = winnersData.filter(w => w.prize_type === 'main_prize').length + 1;
    setWinnersData([...winnersData, {
      prize_type: 'main_prize',
      prize_position: nextPosition,
      name: '',
      details: '',
      image: null
    }]);
  };

  const removeWinnerRow = (index: number) => {
    const newData = winnersData.filter((_, i) => i !== index);
    // Reorder main prize positions
    const reorderedData = newData.map((winner, i) => {
      if (winner.prize_type === 'main_prize') {
        const mainPrizeIndex = newData.slice(0, i + 1).filter(w => w.prize_type === 'main_prize').length;
        return { ...winner, prize_position: mainPrizeIndex };
      }
      return winner;
    });
    setWinnersData(reorderedData);
  };

  const updateWinnerData = (index: number, field: keyof WinnerFormData, value: any) => {
    const newData = [...winnersData];
    newData[index] = { ...newData[index], [field]: value };
    
    // Auto-adjust positions when prize type changes
    if (field === 'prize_type') {
      if (value === 'main_prize') {
        const mainPrizeCount = newData.filter(w => w.prize_type === 'main_prize').length;
        newData[index].prize_position = mainPrizeCount;
      } else {
        newData[index].prize_position = 1;
      }
    }
    
    setWinnersData(newData);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        updateWinnerData(index, 'image', file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitAllWinners = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a game name",
        variant: "destructive",
      });
      return;
    }

    const incompleteWinners = winnersData.filter(w => !w.name.trim() || !w.image);
    if (incompleteWinners.length > 0) {
      toast({
        title: "Missing information",
        description: "Please provide name and image for all winners",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create custom game first
      const { data: customGame, error: gameError } = await supabase
        .from('custom_winner_games')
        .insert({
          game_name: gameName.trim(),
          game_date: gameDate || null
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Upload images and create winners
      const winnersToInsert = [];
      
      for (const [index, winnerData] of winnersData.entries()) {
        // Upload image
        const fileExt = winnerData.image!.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('winners')
          .upload(fileName, winnerData.image!);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('winners')
          .getPublicUrl(fileName);

        winnersToInsert.push({
          custom_game_id: customGame.id,
          name: winnerData.name.trim(),
          prize_type: winnerData.prize_type,
          prize_position: winnerData.prize_position,
          details: winnerData.details.trim() || null,
          image_url: publicUrl,
        });
      }

      // Insert all winners
      const { error: insertError } = await supabase
        .from('winners')
        .insert(winnersToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Game "${gameName}" with ${winnersData.length} winners added successfully`,
      });

      // Reset form
      setGameName("");
      setGameDate("");
      setWinnersData([
        { prize_type: 'main_prize', prize_position: 1, name: '', details: '', image: null }
      ]);
      
      // Clear file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => input.value = '');

      fetchWinners();
    } catch (error) {
      console.error('Error adding winners:', error);
      toast({
        title: "Error",
        description: "Failed to add winners",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleWinnerVisibility = async (winnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('winners')
        .update({ is_active: !currentStatus })
        .eq('id', winnerId);

      if (error) throw error;

      setWinners(prev => prev.map(winner => 
        winner.id === winnerId 
          ? { ...winner, is_active: !currentStatus }
          : winner
      ));

      toast({
        title: "Success",
        description: `Winner ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update winner status",
        variant: "destructive",
      });
    }
  };

  const deleteWinner = async (winnerId: string) => {
    try {
      const winner = winners.find(w => w.id === winnerId);
      if (!winner) return;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('winners')
        .delete()
        .eq('id', winnerId);

      if (deleteError) throw deleteError;

      // Delete image from storage
      const fileName = winner.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('winners')
          .remove([fileName]);
      }

      fetchWinners();
      toast({
        title: "Success",
        description: "Winner deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete winner",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-32 rounded-lg"></div>
        <div className="animate-pulse bg-muted h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Winners Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <Trophy className="h-5 w-5" />
            Add Winners for New Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitAllWinners} className="space-y-6">
            {/* Game Information */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-sm md:text-lg font-semibold">Game Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gameName" className="text-xs md:text-sm">Game Name *</Label>
                  <Input
                    id="gameName"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="Enter game name"
                    required
                    className="text-xs md:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="gameDate" className="text-xs md:text-sm">Game Date (Optional)</Label>
                  <Input
                    id="gameDate"
                    type="date"
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                    className="text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Winners List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-lg font-semibold">Winners</h3>
                <Button
                  type="button"
                  onClick={addWinnerRow}
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Winner
                </Button>
              </div>
              
              {winnersData.map((winner, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">Winner {index + 1}</span>
                    {winnersData.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeWinnerRow(index)}
                        variant="outline"
                        size="sm"
                        className="text-xs md:text-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs md:text-sm">Prize Type *</Label>
                      <Select 
                        value={winner.prize_type} 
                        onValueChange={(value: 'main_prize' | 'incentive_prize') => 
                          updateWinnerData(index, 'prize_type', value)
                        }
                      >
                        <SelectTrigger className="bg-background text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="main_prize">Main Prize</SelectItem>
                          <SelectItem value="incentive_prize">Incentive Prize</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {winner.prize_type === 'main_prize' && (
                      <div>
                        <Label className="text-xs md:text-sm">Position *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={winner.prize_position}
                          onChange={(e) => updateWinnerData(index, 'prize_position', parseInt(e.target.value) || 1)}
                          className="text-xs md:text-sm"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-xs md:text-sm">Name *</Label>
                      <Input
                        value={winner.name}
                        onChange={(e) => updateWinnerData(index, 'name', e.target.value)}
                        placeholder="Winner name"
                        required
                        className="text-xs md:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs md:text-sm">Details</Label>
                      <Textarea
                        value={winner.details}
                        onChange={(e) => updateWinnerData(index, 'details', e.target.value)}
                        placeholder="Prize details..."
                        rows={2}
                        className="text-xs md:text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs md:text-sm">Image *</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        required
                        className="text-xs md:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              type="submit" 
              disabled={uploading} 
              className="w-full bg-lottery-gold hover:bg-lottery-gold/90 text-xs md:text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Adding Winners..." : `Add ${winnersData.length} Winners`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Winners List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <Users className="h-5 w-5" />
            Manage Winners ({winners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-xs md:text-sm">No winners added yet. Add the first winners above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group winners by game */}
              {Object.entries(
                winners.reduce((acc, winner) => {
                  const gameKey = winner.custom_game_id || winner.lottery_game_id || 'no-game';
                  const gameTitle = winner.custom_winner_games?.game_name || 
                                   winner.lottery_games?.title || 'Legacy Winners';
                  const gameDate = winner.custom_winner_games?.game_date || 
                                  winner.lottery_games?.game_date || null;
                  
                  if (!acc[gameKey]) {
                    acc[gameKey] = { title: gameTitle, date: gameDate, winners: [] };
                  }
                  acc[gameKey].winners.push(winner);
                  return acc;
                }, {} as Record<string, { title: string; date: string | null; winners: Winner[] }>)
              ).map(([gameKey, group]) => (
                <div key={gameKey} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5" />
                    <div>
                      <h3 className="text-sm md:text-lg font-semibold">{group.title}</h3>
                      {group.date && (
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(group.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs md:text-sm">Type</TableHead>
                          <TableHead className="text-xs md:text-sm">Position</TableHead>
                          <TableHead className="text-xs md:text-sm">Image</TableHead>
                          <TableHead className="text-xs md:text-sm">Name</TableHead>
                          <TableHead className="text-xs md:text-sm">Details</TableHead>
                          <TableHead className="text-xs md:text-sm">Status</TableHead>
                          <TableHead className="text-xs md:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.winners.map((winner) => (
                          <TableRow key={winner.id}>
                            <TableCell className="text-xs md:text-sm">
                              <Badge variant={winner.prize_type === 'main_prize' ? 'default' : 'secondary'}>
                                {winner.prize_type === 'main_prize' ? 'Main' : 'Incentive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">{winner.prize_position}</TableCell>
                            <TableCell>
                              <img
                                src={winner.image_url}
                                alt={winner.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            </TableCell>
                            <TableCell className="text-xs md:text-sm font-medium">{winner.name}</TableCell>
                            <TableCell className="text-xs md:text-sm">
                              {winner.details ? (
                                <span className="text-muted-foreground">{winner.details}</span>
                              ) : (
                                <span className="text-muted-foreground italic">No details</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={winner.is_active}
                                  onCheckedChange={() => toggleWinnerVisibility(winner.id, winner.is_active)}
                                />
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  {winner.is_active ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-xs md:text-sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Winner</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {winner.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteWinner(winner.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}