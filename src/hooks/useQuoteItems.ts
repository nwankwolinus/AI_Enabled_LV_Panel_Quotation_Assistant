// ============================================
// QUOTE ITEMS HOOKS
// File: src/hooks/useQuoteItems.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { QuoteItemRow, QuoteItemInsert, QuoteItemUpdate } from '@/types/database.types';
import { useUIStore } from '@/store/useUIStore';

const supabase = getSupabaseClient();

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all items for a specific quote
 */
export function useQuoteItems(quoteId: string) {
  return useQuery({
    queryKey: ['quote-items', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('item_number', { ascending: true });

      if (error) throw error;

      // STEP 1: Collect all components IDs
      const allComponentIds = new Set<string>();
      
      data.forEach(item => {
        const incomers = Array.isArray(item.incomers) ? item.incomers : [];
        const outgoings = Array.isArray(item.outgoings) ? item.outgoings : [];
        const accessories = Array.isArray(item.accessories) ? item.accessories : [];

        [...incomers, ...outgoings, ...accessories].forEach((c: any) => {
          if (c.component_id) {
            allComponentIds.add(c.component_id);
          }
        });
      });

      const componentIds = Array.from(allComponentIds);

      // STEP 2: Fetch all components
      let componentMap: Record<string, any> = {};

      if (componentIds.length > 0) {
        const { data: components, error: compError } = await supabase
          .from('components')
          .select('*')
          .in('id', componentIds);

        if (compError) throw compError;

        componentMap = Object.fromEntries(
          components.map(c => [c.id, c])
        );
      }

      // STEP 3: Inject component
      const enrichedItems = data.map(item => {
        const enrich = (arr: any[]) =>
          (arr || []).map(c => ({
             ...c,
             details: componentMap[c.component_id] || null,
          }))
      
          return {
            ...item,
            incomers: enrich(Array.isArray(item.incomers) ? item.incomers : []),
            outgoings: enrich(Array.isArray(item.outgoings) ? item.outgoings : []),
            accessories: enrich(Array.isArray(item.accessories) ? item.accessories : []),
          }
      })
          
      return enrichedItems as QuoteItemRow[];
    },
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single quote item
 */
export function useQuoteItem(itemId: string) {
  return useQuery({
    queryKey: ['quote-items', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data as QuoteItemRow;
    },
    enabled: !!itemId,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new quote item
 */
export function useCreateQuoteItem() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: QuoteItemInsert) => {
      const { data: item, error } = await supabase
        .from('quote_items')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return item as QuoteItemRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', data.quote_id] });
      showToast('Panel added successfully', 'success');
    },
    onError: (error) => {
      console.error('Error creating quote item:', error);
      showToast('Failed to add panel', 'error');
    },
  });
}

/**
 * Update an existing quote item
 */
export function useUpdateQuoteItem() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuoteItemUpdate }) => {
      const { data: item, error } = await supabase
        .from('quote_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return item as QuoteItemRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', data.id] });
      queryClient.invalidateQueries({ queryKey: ['quote-items', data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', data.quote_id] });
      showToast('Panel updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating quote item:', error);
      showToast('Failed to update panel', 'error');
    },
  });
}

/**
 * Delete a quote item
 */
export function useDeleteQuoteItem() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, quoteId }: { id: string; quoteId: string }) => {
      const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, quoteId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', data.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quotes', data.quoteId] });
      showToast('Panel deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Error deleting quote item:', error);
      showToast('Failed to delete panel', 'error');
    },
  });
}

/**
 * Bulk update quote items (for reordering)
 */
export function useBulkUpdateQuoteItems() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (items: QuoteItemUpdate[]) => {
      const updates = items.map(item =>
        supabase
          .from('quote_items')
          .update({ item_number: item.item_number })
          .eq('id', item.id!)
      );

      const results = await Promise.all(updates);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw errors[0].error;
      }

      return items;
    },
    onSuccess: (items) => {
      if (items.length > 0) {
        const quoteId = items[0].quote_id;
        queryClient.invalidateQueries({ queryKey: ['quote-items', quoteId] });
        queryClient.invalidateQueries({ queryKey: ['quotes', quoteId] });
      }
      showToast('Items reordered successfully', 'success');
    },
    onError: (error) => {
      console.error('Error reordering items:', error);
      showToast('Failed to reorder items', 'error');
    },
  });
}

/**
 * Duplicate a quote item
 */
export function useDuplicateQuoteItem() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (itemId: string) => {
      // Fetch the original item
      const { data: original, error: fetchError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      // Get the highest item number for this quote
      const { data: items, error: countError } = await supabase
        .from('quote_items')
        .select('item_number')
        .eq('quote_id', original.quote_id)
        .order('item_number', { ascending: false })
        .limit(1);

      if (countError) throw countError;

      const maxItemNumber = items && items.length > 0 ? items[0].item_number : 0;

      // Create duplicate
      const duplicate: QuoteItemInsert = {
        ...original,
        id: undefined,
        item_number: maxItemNumber + 1,
        panel_name: `${original.panel_name} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data: newItem, error: createError } = await supabase
        .from('quote_items')
        .insert([duplicate])
        .select()
        .single();

      if (createError) throw createError;
      return newItem as QuoteItemRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['quotes', data.quote_id] });
      showToast('Panel duplicated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error duplicating quote item:', error);
      showToast('Failed to duplicate panel', 'error');
    },
  });
}