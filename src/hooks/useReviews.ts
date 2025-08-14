import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    }
  });
};

export const usePublishedReviews = (itemType?: 'package' | 'destination', itemId?: string) => {
  return useQuery({
    queryKey: ['published-reviews', itemType, itemId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('is_published', true);
      
      if (itemType && itemId) {
        query = query.eq('item_type', itemType).eq('item_id', itemId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    }
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['published-reviews'] });
      toast({
        title: 'Review Submitted, it Will be Published soon',
        description: 'Thank you for sharing your experience with us!',
      });
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast({
        title: 'Error submitting review',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['published-reviews'] });
      toast({
        title: 'Review updated successfully!',
      });
    },
    onError: (error) => {
      console.error('Error updating review:', error);
      toast({
        title: 'Error updating review',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['published-reviews'] });
      toast({
        title: 'Review deleted successfully!',
      });
    },
    onError: (error) => {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error deleting review',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};