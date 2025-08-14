
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  package_id: string;
  package_title: string;
  package_location: string;
  package_duration: string;
  package_price: string;
  package_image_url: string;
  tourists: Array<{
    id: string;
    name: string;
    idType: string;
    idNumber: string;
  }>;
  total_price: number;
  booking_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_session?: string | null;
}

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      return data as Booking[];
    },
  });
};

// New: fetch bookings for a specific user
export const useMyBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['bookings', 'me', userId],
    queryFn: async () => {
      if (!userId) return [] as Booking[];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_session', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my bookings:', error);
        throw error;
      }

      return data as Booking[];
    },
    enabled: !!userId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'booking_date'>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        throw error;
      }

      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['booking_cancellations'] });
    },
  });
};

export const useCompletedBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'completed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed bookings:', error);
        throw error;
      }

      return data as Booking[];
    },
  });
};
