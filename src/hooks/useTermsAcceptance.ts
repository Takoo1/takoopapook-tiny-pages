import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AcceptanceType = 'ticket_purchase' | 'organizer_access' | 'user_login';

export const useTermsAcceptance = () => {
  const [loading, setLoading] = useState(false);

  const checkAcceptance = async (acceptanceType: AcceptanceType): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check database for logged-in users
        const { data, error } = await supabase
          .from('user_terms_acceptance')
          .select('id')
          .eq('user_id', user.id)
          .eq('acceptance_type', acceptanceType)
          .maybeSingle();

        if (error) {
          console.error('Error checking terms acceptance:', error);
          return false;
        }

        return !!data;
      } else {
        // Check localStorage for anonymous users
        const stored = localStorage.getItem(`terms_accepted_${acceptanceType}`);
        if (stored) {
          try {
            const acceptanceData = JSON.parse(stored);
            // Check if acceptance is recent (within 30 days for anonymous users)
            const acceptedAt = new Date(acceptanceData.acceptedAt);
            const now = new Date();
            const daysDiff = (now.getTime() - acceptedAt.getTime()) / (1000 * 3600 * 24);
            return daysDiff <= 30;
          } catch {
            return false;
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveAcceptance = async (acceptanceType: AcceptanceType): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to database for logged-in users
        const { error } = await supabase
          .from('user_terms_acceptance')
          .insert({
            user_id: user.id,
            acceptance_type: acceptanceType,
            terms_version: '1.0'
          });

        if (error) {
          console.error('Error saving terms acceptance:', error);
          return false;
        }
        return true;
      } else {
        // Save to localStorage for anonymous users
        const acceptanceData = {
          acceptanceType,
          acceptedAt: new Date().toISOString(),
          termsVersion: '1.0'
        };
        localStorage.setItem(`terms_accepted_${acceptanceType}`, JSON.stringify(acceptanceData));
        return true;
      }
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearAcceptance = (acceptanceType: AcceptanceType) => {
    // Only for anonymous users - database entries are permanent
    localStorage.removeItem(`terms_accepted_${acceptanceType}`);
  };

  return {
    checkAcceptance,
    saveAcceptance,
    clearAcceptance,
    loading
  };
};