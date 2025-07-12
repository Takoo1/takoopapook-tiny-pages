import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlannedLocation, Location } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// Generate a session ID for the user (simple implementation)
const getUserSession = () => {
  let session = localStorage.getItem('user_session');
  if (!session) {
    session = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('user_session', session);
  }
  return session;
};

export const usePlannedLocations = () => {
  const userSession = getUserSession();
  
  return useQuery({
    queryKey: ['planned-locations', userSession],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planned_locations')
        .select(`
          *,
          locations:location_id (*)
        `)
        .eq('user_session', userSession)
        .order('planned_at', { ascending: false });
      
      if (error) throw error;
      return data as (PlannedLocation & { locations: Location })[];
    },
  });
};

export const useAddToPlanned = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userSession = getUserSession();
  
  return useMutation({
    mutationFn: async ({ locationId, notes }: { locationId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('planned_locations')
        .insert({
          location_id: locationId,
          user_session: userSession,
          notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-locations'] });
      toast({
        title: "Added to My Tour",
        description: "Location has been added to your planned destinations.",
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Already Planned",
          description: "This location is already in your tour plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add location to your tour plan.",
          variant: "destructive",
        });
      }
    },
  });
};

export const useRemoveFromPlanned = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userSession = getUserSession();
  
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('planned_locations')
        .delete()
        .eq('location_id', locationId)
        .eq('user_session', userSession);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-locations'] });
      toast({
        title: "Removed from My Tour",
        description: "Location has been removed from your planned destinations.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove location from your tour plan.",
        variant: "destructive",
      });
    },
  });
};

export const useIsLocationPlanned = (locationId: string) => {
  const userSession = getUserSession();
  
  return useQuery({
    queryKey: ['is-planned', locationId, userSession],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planned_locations')
        .select('id')
        .eq('location_id', locationId)
        .eq('user_session', userSession)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
  });
};