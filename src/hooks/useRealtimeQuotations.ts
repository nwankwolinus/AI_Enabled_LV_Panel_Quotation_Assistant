import { useEffect } from 'use';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/src/lib/supabase/client';
import { Quotation } from '@/types/quotation.types';

export const useRealtimeQuotations = () => {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const channel = supabase
      .channel('quotations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations',
        },
        (payload) => {
          // Invalidate queries when data changes
          queryClient.invalidateQueries({ queryKey: ['quotations'] });

          if (payload.eventType === 'INSERT') {
            console.log('New quotation:', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            console.log('Updated quotation:', payload.new);
            queryClient.invalidateQueries({
              queryKey: ['quotation', (payload.new as Quotation).id],
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('Deleted quotation:', payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, supabase]);
};