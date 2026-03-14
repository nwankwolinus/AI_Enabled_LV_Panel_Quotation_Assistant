// ============================================
// QUOTATIONS HOOKS - COMPLETE FIXED VERSION
// File: src/hooks/useQuotations.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/useUIStore';
import { UpdateQuoteDTO } from '@/types/quotation.types';

const supabase = getSupabaseClient();

export interface Quotation {
  id: string;
  quote_number: string;
  client_id: string | null;
  client_name: string;
  client_address: string | null;
  attention: string | null;
  project_name: string;
  status: string;
  revision_number: number | null;
  total: number | null;
  vat: number | null;
  grand_total: number | null;
  payment_terms: string | null;
  execution_period: string | null;
  validity_period: string | null;
  notes: string | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  sent_at: string | null;
  approved_at: string | null;
}

// ✅ FIXED: Added quote_number field
export interface CreateQuotationDTO {
  quote_number?: string;  // ✅ ADDED - Auto-generated or provided
  client_id?: string;
  client_name: string;
  client_address?: string;
  attention?: string;
  project_name: string;
  payment_terms?: string;
  execution_period?: string;
  validity_period?: string;
  notes?: string;
  total?: number;
  vat?: number;
  grand_total?: number;
  status?: string;
  items?: any[];
}

// ============================================
// QUERY HOOKS
// ============================================

export function useQuotations(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`quote_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,project_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Quotation[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`*, 
                 client:clients(*),
                 items:quote_items(*)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

// ✅ FIXED: Complete mutation with enhanced logging and error handling
export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: CreateQuotationDTO) => {
      try {
        console.log('📝 Creating quotation with data:', data);

        // ✅ Use provided quote_number or generate one
        let quoteNumber = data.quote_number;
        
        if (!quoteNumber) {
          console.log('⚡ Generating quote number...');
          const { data: lastQuote } = await supabase
            .from('quotes')
            .select('quote_number')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          quoteNumber = 'PPL/2024/001';
          if (lastQuote?.quote_number) {
            const match = lastQuote.quote_number.match(/(\d+)$/);
            if (match) {
              const nextNum = parseInt(match[1]) + 1;
              quoteNumber = `PPL/2024/${String(nextNum).padStart(3, '0')}`;
            }
          }
        }

        console.log('📝 Using quote number:', quoteNumber);

        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log('👤 User authenticated:', user.id);

        // ✅ Prepare quote data with all required fields
        const quoteInsert = {
          quote_number: quoteNumber,
          client_id: data.client_id || null,
          client_name: data.client_name,
          client_address: data.client_address || null,
          attention: data.attention || null,
          project_name: data.project_name,
          payment_terms: data.payment_terms || null,
          execution_period: data.execution_period || null,
          validity_period: data.validity_period || null,
          notes: data.notes || null,
          total: data.total || 0,
          vat: data.vat || 0,
          grand_total: data.grand_total || 0,
          status: data.status || 'draft',
          revision_number: 1,
          created_by: user.id,
        };

        console.log('💾 Inserting quote:', quoteInsert);

        // Create quote
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .insert(quoteInsert as any)
          .select()
          .single();

        if (quoteError) {
          console.error('❌ Quote insert error:', quoteError);
          throw quoteError;
        }

        if (!quote) {
          throw new Error('Failed to create quote - no data returned');
        }

        console.log('✅ Quote created successfully:', quote.id);

        // Create quote items if provided
        if (data.items && data.items.length > 0) {
          console.log(`📦 Creating ${data.items.length} quote items...`);

          const itemsToInsert = data.items.map((item, index) => ({
            quote_id: quote.id,
            item_number: item.item_number || index + 1,
            panel_name: item.panel_name || `Panel ${index + 1}`,
            busbar_amperage: item.busbar_amperage || null,
            busbar_type: item.busbar_type || null,
            busbar_specification: item.busbar_specification || null,
            busbar_price: item.busbar_price || null,
            busbar_link_type: item.busbar_link_type || null,
            busbar_link_specification: item.busbar_link_specification || null,
            cable_link_size: item.cable_link_size || null,
            enclosure_dimensions: item.enclosure_dimensions || null,
            enclosure_price: item.enclosure_price || null,
            incomers: item.incomers || null,
            outgoings: item.outgoings || null,
            accessories: item.accessories || null,
            cables: item.cables || null,
            bolts: item.bolts || null,
            digital_meter: item.digital_meter || null,
            surge_arrester: item.surge_arrester || null,
            comap_amf_9: item.comap_amf_9 || null,
            comap_amf_16: item.comap_amf_16 || null,
            comap_intelligent_200: item.comap_intelligent_200 || null,
            capacitor_bank_25kvar: item.capacitor_bank_25kvar || null,
            capacitor_bank_60kvar: item.capacitor_bank_60kvar || null,
            power_factor_controller_12stage: item.power_factor_controller_12stage || null,
            contactor_battery_charger: item.contactor_battery_charger || null,
            others: item.others || null,
            notes: item.notes || null,
            subtotal: item.subtotal || 0,
          }));

          console.log('💾 Inserting items:', itemsToInsert);

          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(itemsToInsert as any);

          if (itemsError) {
            console.error('❌ Items insert error:', itemsError);
            // Rollback: delete the quote
            console.log('🔄 Rolling back quote...');
            await supabase.from('quotes').delete().eq('id', quote.id);
            throw itemsError;
          }

          console.log('✅ Items created successfully');
        } else {
          console.log('ℹ️ No items to create');
        }

        console.log('🎉 Quotation creation complete!');
        return quote;
      } catch (error) {
        console.error('❌ Error in mutationFn:', error);
        throw error;
      }
    },
    onSuccess: (quote) => {
      console.log('🎉 Mutation successful:', quote);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation created successfully', 'success');
    },
    onError: (error: any) => {
      console.error('❌ Mutation error caught in onError:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);

      // Specific error messages based on error codes
      if (error?.code === '23505') {
        showToast('Quote number already exists. Please regenerate a new one.', 'error');
      } else if (error?.code === '23502') {
        const field = error?.message?.match(/column "([^"]+)"/)?.[1];
        showToast(`Missing required field: ${field || 'unknown'}`, 'error');
      } else if (error?.code === '42501') {
        showToast('Permission denied. Please check your access rights.', 'error');
      } else if (error?.code === 'PGRST116') {
        showToast('Database connection error. Please try again.', 'error');
      } else if (error?.message) {
        showToast(`Failed to create quotation: ${error.message}`, 'error');
      } else {
        showToast('Failed to create quotation. Please try again.', 'error');
      }
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuoteDTO }) => {
      const { data: quote, error } = await supabase
        .from('quotes')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating quotation:', error);
      showToast('Failed to update quotation', 'error');
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first
      await supabase.from('quote_items').delete().eq('quote_id', id);

      // Delete quote
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Error deleting quotation:', error);
      showToast('Failed to delete quotation', 'error');
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      
      if (status === 'pending') {
        updates.sent_at = new Date().toISOString();
      } else if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Status updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    },
  });
}

export function useDuplicateQuotation() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get original quote with items
      const { data: originalQuote, error: fetchError } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Create new quote with copied data
      const newQuoteData = {
        quote_number: `${originalQuote.quote_number}-COPY`,
        client_id: originalQuote.client_id,
        client_name: originalQuote.client_name,
        client_address: originalQuote.client_address,
        attention: originalQuote.attention,
        project_name: originalQuote.project_name,
        payment_terms: originalQuote.payment_terms,
        execution_period: originalQuote.execution_period,
        validity_period: originalQuote.validity_period,
        notes: originalQuote.notes,
        total: originalQuote.total,
        vat: originalQuote.vat,
        grand_total: originalQuote.grand_total,
        status: 'draft' as const,
        revision_number: 1,
        created_by: user?.id,
      };

      const { data: newQuote, error: createError } = await supabase
        .from('quotes')
        .insert(newQuoteData as any)
        .select()
        .single();

      if (createError) throw createError;

      // Duplicate quote items
      if (originalQuote.quote_items && originalQuote.quote_items.length > 0) {
        const newItems = originalQuote.quote_items.map((item: any) => {
          const { id, created_at, updated_at, ...itemData } = item;
          return {
            ...itemData,
            quote_id: newQuote.id,
          };
        });

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(newItems as any);

        if (itemsError) throw itemsError;
      }

      return newQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation duplicated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error duplicating quotation:', error);
      showToast('Failed to duplicate quotation', 'error');
    },
  });
}

export function useSendQuotation() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ 
      quoteId,
      email,
      message
     }: {
      quoteId: string;
      email?: string;
      message?: string;
     }) => {
 
      // Update quote status to 'sent'
      const { data, error } = await supabase
        .from('quotes')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showToast('Quotation sent successfully', 'success');
    },
    onError: (error) => {
      console.error('Error sending quotation:', error);
      showToast('Failed to send quotation', 'error');
    },
  });
}