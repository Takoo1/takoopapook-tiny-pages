import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';

interface ProfileRow {
  id: string;
  role: AppRole;
  display_name?: string | null;
  avatar_url?: string | null;
}

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery<{ role: AppRole } | null>({
    queryKey: ['profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (error) {
        // If no row yet, return null; the trigger should create it soon
        if (error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows')) {
          return null;
        }
        console.error('Error fetching user role:', error);
        throw error;
      }

      return { role: (data as ProfileRow).role };
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
