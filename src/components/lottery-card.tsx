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
  theme?: 'tier-100' | 'tier-500' | 'tier-1000' | 'tier-other' | 'default';
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
  onViewDetails,
  theme = 'default'
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

  const getThemeClasses = () => {
    switch (theme) {
      case 'tier-100':
        return {
          card: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-600 shadow-red-100/50 dark:shadow-red-900/20',
          price: 'text-red-600 dark:text-red-400',
          progress: 'from-red-500 to-red-400',
          title: 'group-hover:text-red-600 dark:group-hover:text-red-400'
        };
      case 'tier-500':
        return {
          card: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 shadow-purple-100/50 dark:shadow-purple-900/20',
          price: 'text-purple-600 dark:text-purple-400',
          progress: 'from-purple-500 to-purple-400',
          title: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
        };
      case 'tier-1000':
        return {
          card: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 shadow-blue-100/50 dark:shadow-blue-900/20',
          price: 'text-blue-600 dark:text-blue-400',
          progress: 'from-blue-500 to-blue-400',
          title: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
        };
      case 'tier-other':
        return {
          card: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 shadow-green-100/50 dark:shadow-green-900/20',
          price: 'text-green-600 dark:text-green-400',
          progress: 'from-green-500 to-green-400',
          title: 'group-hover:text-green-600 dark:group-hover:text-green-400'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 shadow-[var(--shadow-lottery)]',
          price: 'text-lottery-gold',
          progress: 'from-lottery-gold to-lottery-gold-light',
          title: 'group-hover:text-lottery-gold'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 group cursor-pointer hover:scale-105 ${themeClasses.card}`}
      onClick={() => onViewDetails(id)}
    >
      {/* Special Badge for themed cards */}
      {theme !== 'default' && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
            theme === 'tier-100' ? 'bg-red-500' :
            theme === 'tier-500' ? 'bg-purple-500' :
            theme === 'tier-1000' ? 'bg-blue-500' :
            'bg-green-500'
          }`}>
            {theme === 'tier-100' ? 'STARTER' :
             theme === 'tier-500' ? 'PREMIUM' :
             theme === 'tier-1000' ? 'ELITE' :
             'SPECIAL'}
          </div>
        </div>
      )}

      {/* Ticket Image - 16:9 Aspect Ratio */}
      {ticketImageUrl && (
        <div className="aspect-video overflow-hidden bg-muted relative">
          <img 
            src={ticketImageUrl} 
            alt={`${title} ticket`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-3 md:p-4">
        {/* Single row with game date, price, and availability */}
        <div className="flex items-center justify-between gap-2 text-xs md:text-sm">
          {/* Game Date */}
          <div className="flex items-center gap-1 text-muted-foreground min-w-0">
            <Calendar className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
            <span className="truncate">
              {new Date(gameDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          {/* Price with background */}
          <div className={`px-2 md:px-3 py-1 rounded-full font-bold text-white flex-shrink-0 ${
            theme === 'tier-100' ? 'bg-red-500' :
            theme === 'tier-500' ? 'bg-purple-500' :
            theme === 'tier-1000' ? 'bg-blue-500' :
            theme === 'tier-other' ? 'bg-green-500' :
            'bg-lottery-gold'
          }`}>
            ₹{ticketPrice}
          </div>
          
          {/* Available tickets */}
          <div className="text-muted-foreground text-right min-w-0">
            <span className="truncate">
              {availableTickets}/{totalTickets} available
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}