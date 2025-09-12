import { cn } from "@/lib/utils";

interface LotteryTicketProps {
  ticketNumber: number;
  status: 'available' | 'sold_online';
  onClick?: () => void;
  className?: string;
  forceClickable?: boolean; // Allow parent to override clickable logic
  isSelected?: boolean; // Whether this ticket is selected
}

export function LotteryTicket({ ticketNumber, status, onClick, className, forceClickable, isSelected }: LotteryTicketProps) {
  const getStatusColor = () => {
    if (isSelected) {
      return 'bg-lottery-gold text-primary-foreground'; // Yellow when selected
    }
    switch (status) {
      case 'sold_online':
        return 'bg-lottery-sold-online text-white'; // Green
      default:
        return 'bg-lottery-available text-foreground hover:bg-lottery-gold hover:text-primary-foreground'; // Grey
    }
  };

  const isClickable = forceClickable ? onClick : (status === 'available' && onClick);

  return (
    <div
      className={cn(
        "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-200",
        getStatusColor(),
        isClickable && "cursor-pointer hover:scale-110 hover:shadow-lg",
        className
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {ticketNumber}
    </div>
  );
}