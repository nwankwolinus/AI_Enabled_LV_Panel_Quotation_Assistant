// ============================================
// CLIENTS HOOKS
// File: src/hooks/useClients.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Client, CreateClientDTO, UpdateClientDTO, ClientFilters } from '@/types/client.types';
import { useUIStore } from '@/store/useUIStore';

const supabase = getSupabaseClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeFilterValue(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? (value[0] || '') : value;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all clients with optional filters
 */
export function useClients(filters?: ClientFilters) {
  const searchTerm = filters?.search_query ? normalizeFilterValue(filters.search_query) : '';
  
  return useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
          `contact_person.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone.ilike.%${searchTerm}%,` +
          `address.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Client[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: CreateClientDTO) => {
      const { data: client, error } = await supabase
        .from('clients')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return client as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client created successfully', 'success');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      showToast('Failed to create client', 'error');
    },
  });
}

/**
 * Update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientDTO }) => {
      const { data: client, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return client as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      showToast('Failed to update client', 'error');
    },
  });
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      showToast('Failed to delete client', 'error');
    },
  });
}