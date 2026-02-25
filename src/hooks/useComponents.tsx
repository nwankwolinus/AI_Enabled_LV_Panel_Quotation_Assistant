// ============================================
// COMPONENTS HOOKS
// File: src/hooks/useComponents.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CreateComponentDTO, ComponentFilters } from '@/types/component.types';
import { useUIStore } from '@/store/useUIStore';

const supabase = getSupabaseClient();

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all components with optional filters
 */
export function useComponents(filters?: ComponentFilters) {
  return useQuery({
    queryKey: ['components', filters],
    queryFn: async () => {
      let query = supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters?.search || filters?.search_query) {
        const searchTerm = filters.search || filters.search_query || '';
        query = query.or(`item.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%,vendor.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          query = query.in('category', filters.category);
        } else {
          query = query.eq('category', filters.category);
        }
      }

      // Apply manufacturer filter
      if (filters?.manufacturer) {
        if (Array.isArray(filters.manufacturer)) {
          query = query.in('manufacturer', filters.manufacturer);
        } else {
          query = query.eq('manufacturer', filters.manufacturer);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single component by ID
 */
export function useComponent(id: string) {
  return useQuery({
    queryKey: ['components', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Get component categories with counts
 */
export function useComponentCategories() {
  return useQuery({
    queryKey: ['components', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('category');

      if (error) throw error;

      // Count by category
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const category = item.category || 'Uncategorized';
        counts[category] = (counts[category] || 0) + 1;
      });

      return Object.entries(counts).map(([category, count]) => ({
        category,
        count,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new component
 */
export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: CreateComponentDTO) => {
      const { data: component, error } = await supabase
        .from('components')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showToast('Component created successfully', 'success');
    },
    onError: (error) => {
      console.error('Error creating component:', error);
      showToast('Failed to create component', 'error');
    },
  });
}

/**
 * Update an existing component
 */
export function useUpdateComponent() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateComponentDTO> }) => {
      const { data: component, error } = await supabase
        .from('components')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showToast('Component updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating component:', error);
      showToast('Failed to update component', 'error');
    },
  });
}

/**
 * Delete a component
 */
export function useDeleteComponent() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if component is used in any quotations
      const { data: quotesUsingComponent, error: checkError } = await supabase
        .from('quote_items')
        .select('quote_id')
        .or(`incomers.cs.{"component_id":"${id}"},outgoings.cs.{"component_id":"${id}"},accessories.cs.{"component_id":"${id}"}`)
        .limit(1);

      if (checkError) {
        console.error('Error checking component usage:', checkError);
        throw new Error('Failed to verify component usage');
      }

      // If component is used in quotations, prevent deletion
      if (quotesUsingComponent && quotesUsingComponent.length > 0) {
        throw new Error('COMPONENT_IN_USE');
      }

      // Delete the component
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        
        // Handle specific error codes
        if (error.code === '23503') {
          // Foreign key violation
          throw new Error('COMPONENT_IN_USE');
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showToast('Component deleted successfully', 'success');
    },
    onError: (error: any) => {
      console.error('Error deleting component:', error);
      
      // Handle specific error types
      if (error.message === 'COMPONENT_IN_USE') {
        showToast(
          'Cannot delete component: It is being used in one or more quotations',
          'error'
        );
      } else if (error.code === '23503' || error.code === '409') {
        showToast(
          'Cannot delete component: It is referenced by existing quotations',
          'error'
        );
      } else {
        showToast(
          `Failed to delete component: ${error.message || 'Unknown error'}`,
          'error'
        );
      }
    },
  });
}

/**
 * Import multiple components
 */
export function useImportComponents() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (components: CreateComponentDTO[]) => {
      const { data, error } = await supabase
        .from('components')
        .insert(components)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      showToast(`Successfully imported ${data.length} components`, 'success');
    },
    onError: (error) => {
      console.error('Error importing components:', error);
      showToast('Failed to import components', 'error');
    },
  });
}

/**
 * Export components to CSV
 */
export function useExportComponents() {
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (filters?: ComponentFilters) => {
      let query = supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search || filters?.search_query) {
        const searchTerm = filters.search || filters.search_query || '';
        query = query.or(`item.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
      }

      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          query = query.in('category', filters.category);
        } else {
          query = query.eq('category', filters.category);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Generate CSV
      const headers = [
        'vendor',
        'item',
        'model',
        'manufacturer',
        'price',
        'currency',
        'amperage',
        'poles',
        'type',
        'specification',
        'category',
      ];

      const csvContent = [
        headers.join(','),
        ...data.map(c =>
          [
            c.vendor,
            `"${c.item}"`,
            c.model,
            c.manufacturer,
            c.price,
            c.currency,
            c.amperage || '',
            c.poles || '',
            c.type || '',
            `"${c.specification || ''}"`,
            c.category || '',
          ].join(',')
        ),
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `components-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      return data.length;
    },
    onSuccess: (count) => {
      showToast(`Exported ${count} components`, 'success');
    },
    onError: (error) => {
      console.error('Error exporting components:', error);
      showToast('Failed to export components', 'error');
    },
  });
}