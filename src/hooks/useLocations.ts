
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, MapSettings } from '@/types/database';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Location[];
    },
  });
};

export const useMapSettings = () => {
  return useQuery({
    queryKey: ['map-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as MapSettings;
    },
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};
