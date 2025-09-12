import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

interface Book {
  id: string;
  book_name: string;
  first_ticket_number: number;
  last_ticket_number: number;
  is_online_available: boolean;
}

interface BookManagerProps {
  books: Book[];
  onBooksChange: (books: Book[]) => void;
}

export function BookManager({ books, onBooksChange }: BookManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    book_name: '',
    first_ticket_number: '',
    last_ticket_number: '',
    is_online_available: true
  });

  const addBook = () => {
    if (!newBook.book_name || !newBook.first_ticket_number || !newBook.last_ticket_number) {
      return;
    }

    const first = parseInt(newBook.first_ticket_number);
    const last = parseInt(newBook.last_ticket_number);

    if (first > last) {
      alert("First ticket number must be less than or equal to last ticket number");
      return;
    }

    // Check for overlapping ranges
    const hasOverlap = books.some(book => {
      const bookFirst = book.first_ticket_number;
      const bookLast = book.last_ticket_number;
      return (first <= bookLast && last >= bookFirst);
    });

    if (hasOverlap) {
      alert("Ticket number ranges cannot overlap with existing books");
      return;
    }

    const book: Book = {
      id: `temp-${Date.now()}`,
      book_name: newBook.book_name,
      first_ticket_number: first,
      last_ticket_number: last,
      is_online_available: newBook.is_online_available
    };

    onBooksChange([...books, book]);
    setNewBook({
      book_name: '',
      first_ticket_number: '',
      last_ticket_number: '',
      is_online_available: true
    });
    setShowAddForm(false);
  };

  const removeBook = (bookId: string) => {
    onBooksChange(books.filter(book => book.id !== bookId));
  };

  const updateBookAvailability = (bookId: string, isOnlineAvailable: boolean) => {
    onBooksChange(books.map(book => 
      book.id === bookId 
        ? { ...book, is_online_available: isOnlineAvailable }
        : book
    ));
  };

  const getTotalTickets = () => {
    return books.reduce((total, book) => {
      return total + (book.last_ticket_number - book.first_ticket_number + 1);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Book Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add books of tickets. Each book will have a range of ticket numbers.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Book Button */}
          {!showAddForm && (
            <div className="text-center">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-lottery-gold to-lottery-gold-light hover:from-lottery-gold-light hover:to-lottery-gold text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </div>
          )}

          {/* Add New Book Form */}
          {showAddForm && (
            <div className="grid md:grid-cols-2 gap-4 p-4 border border-border/30 rounded-lg bg-background/30">
            <div>
              <Label htmlFor="book_name">Book Name</Label>
              <Input
                id="book_name"
                placeholder="e.g., Book A, VIP Section"
                value={newBook.book_name}
                onChange={(e) => setNewBook({ ...newBook, book_name: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="first_ticket">First Ticket #</Label>
                <Input
                  id="first_ticket"
                  type="number"
                  placeholder="1"
                  value={newBook.first_ticket_number}
                  onChange={(e) => setNewBook({ ...newBook, first_ticket_number: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label htmlFor="last_ticket">Last Ticket #</Label>
                <Input
                  id="last_ticket"
                  type="number"
                  placeholder="100"
                  value={newBook.last_ticket_number}
                  onChange={(e) => setNewBook({ ...newBook, last_ticket_number: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_online"
                checked={newBook.is_online_available}
                onCheckedChange={(checked) => setNewBook({ ...newBook, is_online_available: checked })}
              />
              <Label htmlFor="is_online">Available Online</Label>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={addBook} className="flex-1 bg-gradient-to-r from-lottery-gold to-lottery-gold-light hover:from-lottery-gold-light hover:to-lottery-gold text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
              <Button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewBook({
                    book_name: '',
                    first_ticket_number: '',
                    last_ticket_number: '',
                    is_online_available: true
                  });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
          )}

          {/* Books List */}
          <div className="space-y-2">
            {books.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No books added yet</p>
            ) : (
              books.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg bg-background/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-foreground">{book.book_name}</span>
                      <span className="text-sm text-muted-foreground">
                        Tickets {book.first_ticket_number} - {book.last_ticket_number}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {book.last_ticket_number - book.first_ticket_number + 1} tickets
                      </span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={book.is_online_available}
                          onCheckedChange={(checked) => updateBookAvailability(book.id, checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {book.is_online_available ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBook(book.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {books.length > 0 && (
            <div className="mt-4 p-3 bg-lottery-gold/10 border border-lottery-gold/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total Tickets:</span>
                <span className="text-lg font-bold text-lottery-gold">{getTotalTickets()}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Online Books:</span>
                <span className="text-sm text-foreground">{books.filter(b => b.is_online_available).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Offline Books:</span>
                <span className="text-sm text-foreground">{books.filter(b => !b.is_online_available).length}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}