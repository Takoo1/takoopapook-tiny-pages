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
  status?: 'online' | 'booking_stopped' | 'live';
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
  theme = 'default',
  status
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
          card: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 shadow-blue-100/50 dark:shadow-blue-900/20',
          price: 'text-blue-600 dark:text-blue-400',
          progress: 'from-blue-500 to-blue-400',
          title: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
        };
      case 'tier-1000':
        return {
          card: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 shadow-purple-100/50 dark:shadow-purple-900/20',
          price: 'text-purple-600 dark:text-purple-400',
          progress: 'from-purple-500 to-purple-400',
          title: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
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
      className={`overflow-hidden transition-all duration-300 group cursor-pointer md:hover:scale-105 active:scale-[0.98] animate-slide-up ${themeClasses.card}`}
      onClick={() => onViewDetails(id)}
    >
      {/* Game Name Header with Details Button */}
      <div className="p-2 md:p-3 pb-0 flex items-center justify-between gap-2">
        <h3 className="text-sm md:text-base font-semibold truncate flex-1 text-lottery-gold bg-gradient-to-r from-lottery-gold to-lottery-gold-light bg-clip-text text-transparent">
          {title}
        </h3>
        <Button
          size="sm"
          variant="outline"
          className={`px-2 md:px-3 py-0 md:py-0.5 text-xs font-medium min-w-[44px] shrink-0 transition-all duration-200 rounded-xl ${
            theme === 'tier-100' ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20' :
            theme === 'tier-500' ? 'border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20' :
            theme === 'tier-1000' ? 'border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/20' :
            theme === 'tier-other' ? 'border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20' :
            'border-lottery-gold/50 text-lottery-gold hover:bg-lottery-gold/10'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
        >
          Details
        </Button>
      </div>

      {/* Ticket Image - 16:9 Aspect Ratio */}
      {ticketImageUrl && (
        <div className="aspect-video overflow-hidden bg-muted relative mx-2 md:mx-3 rounded-md">
          <img 
            src={ticketImageUrl} 
            alt={`${title} ticket`}
            className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300 rounded-md"
          />
          {/* Status Badge */}
          {status === 'booking_stopped' && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
              Booking Stopped
            </div>
          )}
          {status === 'live' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg animate-pulse">
              Live
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-2 md:p-4">
        {/* Single row with game date, price, and availability */}
        <div className="flex items-center justify-between gap-1 md:gap-2 text-xs md:text-sm">
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
          <div className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded-full font-bold text-white flex-shrink-0 text-xs md:text-sm ${
            theme === 'tier-100' ? 'bg-red-500' :
            theme === 'tier-500' ? 'bg-blue-500' :
            theme === 'tier-1000' ? 'bg-purple-500' :
            theme === 'tier-other' ? 'bg-green-500' :
            'bg-lottery-gold'
          }`}>
            ₹{ticketPrice}
          </div>
          
          {/* Available tickets */}
          <div className="text-muted-foreground text-right min-w-0">
            <span className="truncate">
              {status === 'booking_stopped' || status === 'live' 
                ? 'Tickets Not Available'
                : `${availableTickets}/${totalTickets} available`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}