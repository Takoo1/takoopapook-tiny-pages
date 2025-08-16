import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Users, FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { useBookingCancellations } from '@/hooks/useBookingCancellations';
import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const isNativeApp = Capacitor.isNativePlatform();
  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const { data: cancellations = [] } = useBookingCancellations();

  const cancellation = useMemo(() => {
    return cancellations.find(c => c.booking_id === bookingId);
  }, [cancellations, bookingId]);

  if (isLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <Button onClick={() => navigate('/my-tour')}>Back to My Tour</Button>
        </div>
      </div>
    );
  }

  const normalizedStatus = (booking.status || '').toLowerCase().replace(/\s+/g, '_');
  const isCompleted = normalizedStatus === 'completed';
  const isCancelled = normalizedStatus === 'cancelled' || cancellation?.status === 'cancelled';
  const isCancellationProcessing = normalizedStatus === 'processing_cancellation' || normalizedStatus === 'processing';

  const tourists = Array.isArray(booking.tourists) ? booking.tourists : [];
  const groupSizeNumber = parseInt(booking.package_duration.replace(/[^\d]/g, '')) || 2;
  const extraTourists = Math.max(0, tourists.length - groupSizeNumber);

  return (
    <div className={`container mx-auto px-4 py-6 ${isNativeApp ? 'px-6' : ''} space-y-6`}>
      {/* Mobile Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/my-tour')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className={`${isNativeApp ? 'text-xl' : 'text-2xl'} font-bold`}>
            {isCancelled
              ? 'Trip Cancelled'
              : isCancellationProcessing
                ? 'Cancellation Processing'
                : isCompleted
                  ? 'Trip Completed'
                  : 'Booking Details'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Booking ID: {booking.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Status Alert */}
      <Card className={`border-l-4 ${
        isCancelled ? 'border-l-red-500 bg-red-50' : 
        isCompleted ? 'border-l-green-500 bg-green-50' : 
        'border-l-blue-500 bg-blue-50'
      }`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-5 w-5 ${
              isCancelled ? 'text-red-500' : 
              isCompleted ? 'text-green-500' : 
              'text-blue-500'
            }`} />
            <span className="font-medium">
              {isCancelled
                ? 'Your trip has been cancelled'
                : isCompleted
                  ? 'Trip completed successfully'
                  : 'Booking confirmed'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Package Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Package Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={booking.package_image_url}
              alt={booking.package_title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{booking.package_title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {booking.package_location}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {booking.package_duration}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourist Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Tourist Information ({tourists.length} people)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tourists.map((tourist: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Tourist {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {tourist.name}
                  </div>
                  <div>
                    <span className="font-medium">ID Type:</span> {tourist.idType}
                  </div>
                  <div>
                    <span className="font-medium">ID Number:</span> {tourist.idNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Package Price:</span>
              <span>{booking.package_price}</span>
            </div>
            {extraTourists > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Extra Charges ({extraTourists} × ₹2,000):</span>
                <span>₹{(extraTourists * 2000).toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>₹{Number(booking.total_price).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Booking Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
            <p>Payment Status: <span className="text-green-600 font-medium">Confirmed</span></p>
            <p>Status: <Badge variant={isCancelled ? 'destructive' : isCompleted ? 'default' : 'secondary'}>
              {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : 'Confirmed'}
            </Badge></p>
          </div>
        </CardContent>
      </Card>

      {/* Refund Policy (for cancelled bookings) */}
      {isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Full refund if cancelled 48 hours before departure</p>
            <p>• 50% refund if cancelled within 24-48 hours of departure</p>
            <p>• No refund if cancelled within 24 hours of departure</p>
            <p className="text-green-600 font-medium">Refunds are processed within 5-7 business days</p>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Booking Terms:</h4>
            <ul className="space-y-1 ml-4">
              <li>• All bookings are subject to availability and confirmation</li>
              <li>• Valid government-issued ID required for all participants</li>
              <li>• Package prices include all mentioned services</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Payment Terms:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Payment confirmation required within 24 hours</li>
              <li>• Additional charges for extra participants</li>
              <li>• All prices are inclusive of applicable taxes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetail;