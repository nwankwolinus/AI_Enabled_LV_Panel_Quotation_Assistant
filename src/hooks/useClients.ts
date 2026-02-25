// ============================================
// CLIENTS HOOKS
// File: src/hooks/useClients.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/useUIStore';

const supabase = getSupabaseClient();

export interface Client {
  id: string;
  name: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDTO {
  name: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

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
      return client;
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

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateClientDTO> }) => {
      const { data: client, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return client;
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