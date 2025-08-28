import { cn } from "@/lib/utils";

interface LotteryTicketProps {
  ticketNumber: number;
  status: 'available' | 'sold_online';
  onClick?: () => void;
  className?: string;
  forceClickable?: boolean; // Allow parent to override clickable logic
}

export function LotteryTicket({ ticketNumber, status, onClick, className, forceClickable }: LotteryTicketProps) {
  const getStatusColor = () => {
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
        "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
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