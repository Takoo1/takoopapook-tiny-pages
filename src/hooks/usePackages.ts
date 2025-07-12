import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Package {
  id: string;
  package_code: string;
  title: string;
  location: string;
  duration: string;
  group_size: string;
  price: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  features: string[];
  locations_included: string[];
  reviews: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePackages = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Package[];
    },
  });
};

export const useAllPackages = () => {
  return useQuery({
    queryKey: ['all-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Package[];
    },
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['all-packages'] });
      toast({
        title: "Success",
        description: "Package created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
      console.error('Error creating package:', error);
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...packageData }: Partial<Package> & { id: string }) => {
      const { data, error } = await supabase
        .from('packages')
        .update(packageData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['all-packages'] });
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
      console.error('Error updating package:', error);
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['all-packages'] });
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
      console.error('Error deleting package:', error);
    },
  });
};

// Helper function to generate unique package code
export const generatePackageCode = (existingCodes: string[]): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let num = 10; num <= 99; num++) {
    for (let i = 0; i < letters.length; i++) {
      const code = `${num}${letters[i]}`;
      if (!existingCodes.includes(code)) {
        return code;
      }
    }
  }
  
  // Fallback if all combinations are exhausted
  return `${Math.floor(Math.random() * 90) + 10}${letters[Math.floor(Math.random() * letters.length)]}`;
};