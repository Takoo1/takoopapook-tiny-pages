
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, Calendar } from "lucide-react";

// Generate a random 5-character game code (mix of letters and digits)
const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface Book {
  id: string;
  name: string;
  firstTicket: number;
  lastTicket: number;
  isOnline: boolean;
}

interface Prize {
  id: string;
  title: string;
  amount: string;
  description: string;
}

interface CommitteeMember {
  id: string;
  designation: string;
  name: string;
}

interface Term {
  id: string;
  content: string;
}

interface CreateGameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGameForm({ isOpen, onClose, onSuccess }: CreateGameFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameDate: '',
    ticketPrice: '',
    organisingGroupName: '',
    headline: '',
    liveDrawUrl: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [ticketImage, setTicketImage] = useState<File | null>(null);
  const [organiserLogo, setOrganiserLogo] = useState<File | null>(null);
  const [books, setBooks] = useState<Book[]>([
    { id: '1', name: 'Book A', firstTicket: 1, lastTicket: 100, isOnline: true }
  ]);
  const [mainPrizes, setMainPrizes] = useState<Prize[]>([
    { id: '1', title: '1st Prize', amount: '', description: '' },
    { id: '2', title: '2nd Prize', amount: '', description: '' }
  ]);
  const [incentivePrizes, setIncentivePrizes] = useState<Prize[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([
    { id: '1', designation: 'President', name: '' }
  ]);
  const [terms, setTerms] = useState<Term[]>([
    { id: '1', content: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file: File, type: 'ticket' | 'logo') => {
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image less than 2MB",
        variant: "destructive",
      });
      return;
    }

    if (type === 'ticket') {
      setTicketImage(file);
    } else {
      setOrganiserLogo(file);
    }
  };

  const addBook = () => {
    const lastBook = books[books.length - 1];
    const newFirstTicket = lastBook ? lastBook.lastTicket + 1 : 1;
    setBooks([...books, {
      id: Date.now().toString(),
      name: `Book ${String.fromCharCode(65 + books.length)}`,
      firstTicket: newFirstTicket,
      lastTicket: newFirstTicket + 99,
      isOnline: true
    }]);
  };

  const removeBook = (id: string) => {
    if (books.length > 1) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  const updateBook = (id: string, field: keyof Book, value: any) => {
    setBooks(books.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  const addPrize = (type: 'main' | 'incentive') => {
    const newPrize = { id: Date.now().toString(), title: '', amount: '', description: '' };
    if (type === 'main') {
      setMainPrizes([...mainPrizes, newPrize]);
    } else {
      setIncentivePrizes([...incentivePrizes, newPrize]);
    }
  };

  const removePrize = (id: string, type: 'main' | 'incentive') => {
    if (type === 'main') {
      setMainPrizes(mainPrizes.filter(prize => prize.id !== id));
    } else {
      setIncentivePrizes(incentivePrizes.filter(prize => prize.id !== id));
    }
  };

  const updatePrize = (id: string, field: keyof Prize, value: string, type: 'main' | 'incentive') => {
    const updateFn = (prizes: Prize[]) => 
      prizes.map(prize => prize.id === id ? { ...prize, [field]: value } : prize);
    
    if (type === 'main') {
      setMainPrizes(updateFn);
    } else {
      setIncentivePrizes(updateFn);
    }
  };

  const addCommitteeMember = () => {
    setCommittee([...committee, { id: Date.now().toString(), designation: '', name: '' }]);
  };

  const removeCommitteeMember = (id: string) => {
    if (committee.length > 1) {
      setCommittee(committee.filter(member => member.id !== id));
    }
  };

  const updateCommitteeMember = (id: string, field: keyof CommitteeMember, value: string) => {
    setCommittee(committee.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const addTerm = () => {
    setTerms([...terms, { id: Date.now().toString(), content: '' }]);
  };

  const removeTerm = (id: string) => {
    if (terms.length > 1) {
      setTerms(terms.filter(term => term.id !== id));
    }
  };

  const updateTerm = (id: string, content: string) => {
    setTerms(terms.map(term => 
      term.id === id ? { ...term, content } : term
    ));
  };

  const uploadImage = async (file: File, gameId: string, type: 'ticket' | 'logo') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `games/${gameId}/${type}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('lottery-images')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('lottery-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketImage) {
      toast({
        title: "Missing required image",
        description: "Please upload a ticket image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Calculate total tickets
      const totalTickets = books.reduce((sum, book) => 
        sum + (book.lastTicket - book.firstTicket + 1), 0
      );
      const startingTicketNumber = Math.min(...books.map(b => b.firstTicket));
      const lastTicketNumber = Math.max(...books.map(b => b.lastTicket));

      // Create the game
      const { data: game, error: gameError } = await supabase
        .from('lottery_games')
        .insert({
          title: formData.title,
          description: formData.description,
          game_date: formData.gameDate,
          ticket_price: parseFloat(formData.ticketPrice),
          total_tickets: totalTickets,
          starting_ticket_number: startingTicketNumber,
          last_ticket_number: lastTicketNumber,
          organising_group_name: formData.organisingGroupName,
          headline: formData.headline,
          live_draw_url: formData.liveDrawUrl || null,
          contact_phone: formData.contactPhone || null,
          contact_email: formData.contactEmail || null,
          created_by_user_id: user.data.user.id,
          game_code: generateGameCode()
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Upload images and update game
      const ticketImageUrl = await uploadImage(ticketImage, game.id, 'ticket');
      let organiserLogoUrl = null;
      if (organiserLogo) {
        organiserLogoUrl = await uploadImage(organiserLogo, game.id, 'logo');
      }

      await supabase
        .from('lottery_games')
        .update({
          ticket_image_url: ticketImageUrl,
          organiser_logo_url: organiserLogoUrl
        })
        .eq('id', game.id);

      // Create books and generate tickets
      for (const book of books) {
        const { data: bookData, error: bookError } = await supabase
          .from('lottery_books')
          .insert({
            lottery_game_id: game.id,
            book_name: book.name,
            first_ticket_number: book.firstTicket,
            last_ticket_number: book.lastTicket,
            is_online_available: book.isOnline
          })
          .select()
          .single();

        if (bookError) throw bookError;

        // Generate tickets for this book
        const { error: ticketsError } = await supabase.rpc(
          'generate_lottery_tickets_for_book',
          {
            game_id: game.id,
            book_id: bookData.id,
            start_num: book.firstTicket,
            end_num: book.lastTicket
          }
        );

        if (ticketsError) throw ticketsError;
      }

      // Create prizes
      const allPrizes = [
        ...mainPrizes.map((prize, index) => ({
          lottery_game_id: game.id,
          prize_type: 'main' as const,
          title: prize.title,
          amount: prize.amount ? parseFloat(prize.amount) : null,
          description: prize.description || null,
          display_order: index + 1
        })),
        ...incentivePrizes.map((prize, index) => ({
          lottery_game_id: game.id,
          prize_type: 'incentive' as const,
          title: prize.title,
          amount: prize.amount ? parseFloat(prize.amount) : null,
          description: prize.description || null,
          display_order: index + 1
        }))
      ];

      if (allPrizes.length > 0) {
        const { error: prizesError } = await supabase
          .from('lottery_prizes')
          .insert(allPrizes);
        if (prizesError) throw prizesError;
      }

      // Create committee members
      const committeeData = committee
        .filter(member => member.designation && member.name)
        .map((member, index) => ({
          lottery_game_id: game.id,
          designation: member.designation,
          member_name: member.name,
          display_order: index + 1
        }));

      if (committeeData.length > 0) {
        const { error: committeeError } = await supabase
          .from('lottery_organising_committee')
          .insert(committeeData);
        if (committeeError) throw committeeError;
      }

      // Create terms
      const termsData = terms
        .filter(term => term.content.trim())
        .map((term, index) => ({
          lottery_game_id: game.id,
          content: term.content,
          display_order: index + 1
        }));

      if (termsData.length > 0) {
        const { error: termsError } = await supabase
          .from('lottery_terms')
          .insert(termsData);
        if (termsError) throw termsError;
      }

      toast({
        title: "Success!",
        description: "Lottery game created successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create lottery game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = books.reduce((sum, book) => 
    sum + (book.lastTicket - book.firstTicket + 1), 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lottery Game</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Game Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organisingGroupName">Organising Group Name *</Label>
                  <Input
                    id="organisingGroupName"
                    value={formData.organisingGroupName}
                    onChange={(e) => setFormData({...formData, organisingGroupName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headline">Headline/Motto</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({...formData, headline: e.target.value})}
                  placeholder="Enter game headline or motto"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gameDate">Game Date *</Label>
                  <Input
                    id="gameDate"
                    type="datetime-local"
                    value={formData.gameDate}
                    onChange={(e) => setFormData({...formData, gameDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPrice">Ticket Price (₹) *</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ticket Image * (max 2MB)</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'ticket');
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lottery-gold file:text-primary-foreground hover:file:bg-lottery-gold/90"
                    />
                    {ticketImage && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {ticketImage.name} ({(ticketImage.size / 1024 / 1024).toFixed(2)}MB)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a high-quality image showing your lottery ticket design
                  </p>
                </div>
                
                <div>
                  <Label>Organiser Logo (optional, max 2MB)</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'logo');
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lottery-gold file:text-primary-foreground hover:file:bg-lottery-gold/90"
                    />
                    {organiserLogo && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {organiserLogo.name} ({(organiserLogo.size / 1024 / 1024).toFixed(2)}MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books and Tickets */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Books & Ticket Range</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Total Tickets: {totalTickets}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {books.map((book, index) => (
                <div key={book.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label>Book Name</Label>
                      <Input
                        value={book.name}
                        onChange={(e) => updateBook(book.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>First Ticket</Label>
                      <Input
                        type="number"
                        value={book.firstTicket}
                        onChange={(e) => updateBook(book.id, 'firstTicket', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Last Ticket</Label>
                      <Input
                        type="number"
                        value={book.lastTicket}
                        onChange={(e) => updateBook(book.id, 'lastTicket', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={book.isOnline}
                        onCheckedChange={(checked) => updateBook(book.id, 'isOnline', checked)}
                      />
                      <Label className="text-sm">
                        {book.isOnline ? 'Online' : 'Offline'}
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBook}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {books.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBook(book.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Tickets: {book.lastTicket - book.firstTicket + 1} | 
                    Mode: {book.isOnline ? 'Available online' : 'Offline only'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Prizes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Main Prizes</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPrize('main')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prize
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainPrizes.map((prize, index) => (
                <div key={prize.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Prize Title</Label>
                      <Input
                        value={prize.title}
                        onChange={(e) => updatePrize(prize.id, 'title', e.target.value, 'main')}
                        placeholder="e.g. 1st Prize"
                      />
                    </div>
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        value={prize.amount}
                        onChange={(e) => updatePrize(prize.id, 'amount', e.target.value, 'main')}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={prize.description}
                        onChange={(e) => updatePrize(prize.id, 'description', e.target.value, 'main')}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrize(prize.id, 'main')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Incentive Prizes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Incentive Prizes</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPrize('incentive')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Incentive Prize
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {incentivePrizes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No incentive prizes added yet</p>
              ) : (
                incentivePrizes.map((prize, index) => (
                  <div key={prize.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Prize Title</Label>
                        <Input
                          value={prize.title}
                          onChange={(e) => updatePrize(prize.id, 'title', e.target.value, 'incentive')}
                          placeholder="e.g. Early Bird Prize"
                        />
                      </div>
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={prize.amount}
                          onChange={(e) => updatePrize(prize.id, 'amount', e.target.value, 'incentive')}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={prize.description}
                          onChange={(e) => updatePrize(prize.id, 'description', e.target.value, 'incentive')}
                          placeholder="Optional description"
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePrize(prize.id, 'incentive')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Organising Committee */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Organising Committee</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCommitteeMember}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {committee.map((member, index) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label>Designation</Label>
                      <Input
                        value={member.designation}
                        onChange={(e) => updateCommitteeMember(member.id, 'designation', e.target.value)}
                        placeholder="e.g. President, Secretary"
                      />
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateCommitteeMember(member.id, 'name', e.target.value)}
                        placeholder="Enter member name"
                      />
                    </div>
                    <div>
                      {committee.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCommitteeMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTerm}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Term
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {terms.map((term, index) => (
                <div key={term.id} className="p-4 border rounded-lg">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Label>Term {index + 1}</Label>
                      <Textarea
                        value={term.content}
                        onChange={(e) => updateTerm(term.id, e.target.value)}
                        placeholder="Enter term or condition"
                        rows={2}
                      />
                    </div>
                    <div className="pt-6">
                      {terms.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTerm(term.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="Enter contact phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="liveDrawUrl">Live Draw Link (optional)</Label>
                <Input
                  id="liveDrawUrl"
                  type="url"
                  value={formData.liveDrawUrl}
                  onChange={(e) => setFormData({...formData, liveDrawUrl: e.target.value})}
                  placeholder="Enter live draw streaming URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
