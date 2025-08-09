import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface LotteryCardProps {
  id: string;
  title: string;
  description?: string;
  gameDate: string;
  ticketImageUrl?: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  organizingGroup: string;
  onViewDetails: (id: string) => void;
}

export function LotteryCard({ 
  id, 
  title, 
  description, 
  gameDate, 
  ticketImageUrl, 
  ticketPrice, 
  totalTickets, 
  availableTickets, 
  organizingGroup,
  onViewDetails 
}: LotteryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-lottery)] group cursor-pointer"
      onClick={() => onViewDetails(id)}
    >
      {/* Ticket Image - 16:9 Aspect Ratio */}
      {ticketImageUrl && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img 
            src={ticketImageUrl} 
            alt={`${title} ticket`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground group-hover:text-lottery-gold transition-colors">
            {title}
          </h3>
          <div className="text-lg font-bold text-lottery-gold">
            ₹{ticketPrice}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(gameDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-lottery-gold to-lottery-gold-light h-2 rounded-full transition-all duration-300"
            style={{ width: `${(availableTickets / totalTickets) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}