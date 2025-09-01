import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Upload, Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react";

interface Winner {
  id: string;
  name: string;
  prize_position: number;
  details: string | null;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export function WinnersManager() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    prize_position: 1,
    details: '',
    image: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('prize_position', { ascending: true });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, image: file }));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      toast({
        title: "Missing information",
        description: "Please provide name and image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload image to storage
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('winners')
        .upload(fileName, formData.image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('winners')
        .getPublicUrl(fileName);

      // Insert winner record
      const { error: insertError } = await supabase
        .from('winners')
        .insert({
          name: formData.name,
          prize_position: formData.prize_position,
          details: formData.details || null,
          image_url: publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Winner added successfully",
      });

      // Reset form
      setFormData({
        name: '',
        prize_position: 1,
        details: '',
        image: null
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchWinners();
    } catch (error) {
      console.error('Error adding winner:', error);
      toast({
        title: "Error",
        description: "Failed to add winner",
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

  const moveWinner = async (winnerId: string, direction: 'up' | 'down') => {
    const winner = winners.find(w => w.id === winnerId);
    if (!winner) return;

    const targetPosition = direction === 'up' ? winner.prize_position - 1 : winner.prize_position + 1;
    const swapWinner = winners.find(w => w.prize_position === targetPosition);

    if (!swapWinner) return;

    try {
      // Swap positions
      await Promise.all([
        supabase
          .from('winners')
          .update({ prize_position: targetPosition })
          .eq('id', winnerId),
        supabase
          .from('winners')
          .update({ prize_position: winner.prize_position })
          .eq('id', swapWinner.id)
      ]);

      fetchWinners();
      toast({
        title: "Success",
        description: "Winner order updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update winner order",
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
      {/* Add Winner Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Add New Winner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddWinner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Winner Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter winner name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Prize Position *</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={formData.prize_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize_position: parseInt(e.target.value) || 1 }))}
                  placeholder="1 for 1st prize, 2 for 2nd..."
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="details">Details (Optional)</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Additional details about the winner"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image">Profile Image *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload a square image for best results (recommended: 400x400px)
              </p>
            </div>
            
            <Button type="submit" disabled={uploading} className="bg-lottery-gold hover:bg-lottery-gold/90">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Adding Winner..." : "Add Winner"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Winners List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Winners ({winners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No winners added yet. Add the first winner above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell>
                        <Badge variant={winner.prize_position <= 3 ? "default" : "secondary"}>
                          {winner.prize_position === 1 ? "1st" : 
                           winner.prize_position === 2 ? "2nd" :
                           winner.prize_position === 3 ? "3rd" : 
                           `${winner.prize_position}th`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <img
                          src={winner.image_url}
                          alt={winner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{winner.name}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {winner.details || "No details"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={winner.is_active}
                            onCheckedChange={() => toggleWinnerVisibility(winner.id, winner.is_active)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {winner.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveWinner(winner.id, 'up')}
                            disabled={winner.prize_position === 1}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveWinner(winner.id, 'down')}
                            disabled={winner.prize_position === Math.max(...winners.map(w => w.prize_position))}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                                <AlertDialogAction
                                  onClick={() => deleteWinner(winner.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    </div>
  );
}