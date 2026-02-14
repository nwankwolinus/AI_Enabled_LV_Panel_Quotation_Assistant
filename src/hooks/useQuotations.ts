import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RepositoryFactory } from '@/src/repositories';
import { Quotation } from '@/types/quotation.types';
import { useUIStore } from '@/src/store/useUIStore';

export const useQuotations = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: () => RepositoryFactory.quotations.findAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useQuotation = (id: string) => {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => RepositoryFactory.quotations.findWithRelations(id),
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (quotation: Partial<Quotation>) =>
      RepositoryFactory.quotations.create(quotation),
    
    onMutate: async (newQuotation) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quotations'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['quotations']);

      // Optimistically update
      queryClient.setQueryData(['quotations'], (old: any) => [
        ...(old || []),
        { ...newQuotation, id: 'temp-id' },
      ]);

      return { previous };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['quotations'], context.previous);
      }
      showToast('Failed to create quotation', 'error');
    },

    onSuccess: (data) => {
      showToast('Quotation created successfully', 'success');
    },

    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quotation> }) =>
      RepositoryFactory.quotations.update(id, data),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      showToast('Quotation updated successfully', 'success');
    },

    onError: () => {
      showToast('Failed to update quotation', 'error');
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => RepositoryFactory.quotations.delete(id),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation deleted successfully', 'success');
    },

    onError: () => {
      showToast('Failed to delete quotation', 'error');
    },
  });
};

export const useSearchQuotations = (query: string) => {
  return useQuery({
    queryKey: ['quotations', 'search', query],
    queryFn: () => RepositoryFactory.quotations.search(query),
    enabled: query.length > 0,
  });
};