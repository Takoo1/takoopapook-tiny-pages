import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BookingButtonProps {
  packageId: string;
  className?: string;
}

const BookingButton: React.FC<BookingButtonProps> = ({ packageId, className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookingClick = () => {
    if (!user) {
      // Redirect to auth page with return URL
      navigate('/auth', { state: { returnUrl: `/booking/${packageId}` } });
      return;
    }
    navigate(`/booking/${packageId}`);
  };

  return (
    <Button size="lg" className={`px-8 ${className}`} onClick={handleBookingClick}>
      <CreditCard className="h-4 w-4 mr-2" />
      Book Package
    </Button>
  );
};

export default BookingButton;