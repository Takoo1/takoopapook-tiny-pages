
import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateCancellationRequest } from '@/hooks/useBookingCancellations';
import { toast } from 'sonner';

const reasons = [
  'Change of plans',
  'Found a better price',
  'Health reasons',
  'Visa/Documentation issues',
  'Weather concerns',
  'Other',
];

// Validate UUID (v4 or generic UUID format)
const isValidUUID = (id: string | undefined | null) => {
  if (!id) return false;
  const trimmed = String(id).trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
};

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const CancelBooking = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const createCancellation = useCreateCancellationRequest();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

// bookingId priority: URL ?bookingId=... -> localStorage.currentBooking.bookingId
const currentBooking = (() => {
  try {
    const raw = localStorage.getItem('currentBooking');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
const rawBookingId = (query.get('bookingId') ?? '').toString().trim() || String(currentBooking?.bookingId ?? '').trim();
const bookingId = isValidUUID(rawBookingId) ? rawBookingId : undefined;
const isValidBooking = !!bookingId;

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!isValidBooking) {
  toast.error('No valid booking found to cancel.');
  return;
}
if (!selectedReason) {
  toast.error('Please select a reason for cancellation.');
  return;
}

    try {
      await createCancellation.mutateAsync({
        booking_id: bookingId,
        reason: selectedReason,
        details: details || null,
        status: 'processing',
      });

      setSubmitted(true);
      toast.success('Processing for Cancellation');
      // Optionally navigate back after a delay
      // setTimeout(() => navigate('/my-tour'), 1500);
    } catch (error) {
      console.error('Failed to submit cancellation:', error);
      toast.error('Failed to submit cancellation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-20">
        {!submitted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Traveller, what stopped you?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>Select a reason</Label>
                  <RadioGroup
                    value={selectedReason}
                    onValueChange={setSelectedReason}
                    className="space-y-2"
                  >
                    {reasons.map((r) => (
                      <div key={r} className="flex items-center space-x-2">
                        <RadioGroupItem value={r} id={r} />
                        <Label htmlFor={r}>{r}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Tell us more (optional)</Label>
                  <Textarea
                    id="details"
                    placeholder="Share any details that can help us improve..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

<div className="flex gap-3">
  <Button type="submit" className="w-full" disabled={!selectedReason}>Submit</Button>
  <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/my-tour')}>
    Go Back
  </Button>
</div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Processing for Cancellation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We’ve received your request. Our team will process it shortly. You can check the status on your My Tour page.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/my-tour')} className="w-full">Back to My Tour</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CancelBooking;
