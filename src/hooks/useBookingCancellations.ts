
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookingCancellation {
  id: string;
  booking_id: string;
  reason: string;
  details: string | null;
  status: 'processing' | 'cancelled' | string;
  user_session: string | null;
  created_at: string;
  updated_at: string;
}

// Generate a session ID for the user (simple implementation)
const getUserSession = () => {
  let session = localStorage.getItem('user_session');
  if (!session) {
    session = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('user_session', session);
  }
  return session;
};

export const useBookingCancellations = () => {
  return useQuery({
    queryKey: ['booking_cancellations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_cancellations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching booking cancellations:', error);
        throw error;
      }

      return data as BookingCancellation[];
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useCreateCancellationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { booking_id: string; reason: string; details: string | null; status?: string }) => {
      const payloadWithSession = { ...payload, user_session: getUserSession() };
      const { data, error } = await supabase
        .from('booking_cancellations')
        .insert([payloadWithSession])
        .select()
        .single();

      if (error) {
        console.error('Error creating cancellation request:', error);
        throw error;
      }

      return data as BookingCancellation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateCancellationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cancellationId, status }: { cancellationId: string; status: 'processing' | 'cancelled' | string }) => {
      const { data, error } = await supabase
        .from('booking_cancellations')
        .update({ status })
        .eq('id', cancellationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating cancellation status:', error);
        throw error;
      }

      return data as BookingCancellation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking_cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
    },
  });
};
