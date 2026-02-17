// ============================================
// UI STORE
// File: src/store/useUIStore.ts
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Modals
  isCreateQuotationModalOpen: boolean;
  isEditQuotationModalOpen: boolean;
  isDeleteConfirmModalOpen: boolean;
  
  // Sidebar
  isSidebarCollapsed: boolean;
  
  // Loading
  isLoading: boolean;
  loadingMessage: string;
  
  // Toast
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  
  // Selected items
  selectedQuotationId: string | null;
  selectedComponentId: string | null;
  selectedClientId: string | null;
  
  // Actions - Modals
  openCreateQuotationModal: () => void;
  closeCreateQuotationModal: () => void;
  openEditQuotationModal: (id: string) => void;
  closeEditQuotationModal: () => void;
  openDeleteConfirmModal: (id: string) => void;
  closeDeleteConfirmModal: () => void;
  
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Actions - Loading
  setLoading: (loading: boolean, message?: string) => void;
  
  // Actions - Toast
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
  
  // Actions - Selection
  setSelectedQuotation: (id: string | null) => void;
  setSelectedComponent: (id: string | null) => void;
  setSelectedClient: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isCreateQuotationModalOpen: false,
      isEditQuotationModalOpen: false,
      isDeleteConfirmModalOpen: false,
      isSidebarCollapsed: false,
      isLoading: false,
      loadingMessage: '',
      toast: null,
      selectedQuotationId: null,
      selectedComponentId: null,
      selectedClientId: null,
      
      // Modal actions
      openCreateQuotationModal: () => set({ isCreateQuotationModalOpen: true }),
      closeCreateQuotationModal: () => set({ isCreateQuotationModalOpen: false }),
      openEditQuotationModal: (id: string) => set({ 
        isEditQuotationModalOpen: true,
        selectedQuotationId: id 
      }),
      closeEditQuotationModal: () => set({ 
        isEditQuotationModalOpen: false,
        selectedQuotationId: null 
      }),
      openDeleteConfirmModal: (id: string) => set({ 
        isDeleteConfirmModalOpen: true,
        selectedQuotationId: id 
      }),
      closeDeleteConfirmModal: () => set({ 
        isDeleteConfirmModalOpen: false,
        selectedQuotationId: null 
      }),
      
      // Sidebar actions
      toggleSidebar: () => set((state) => ({ 
        isSidebarCollapsed: !state.isSidebarCollapsed 
      })),
      setSidebarCollapsed: (collapsed: boolean) => set({ 
        isSidebarCollapsed: collapsed 
      }),
      
      // Loading actions
      setLoading: (loading: boolean, message = '') => set({ 
        isLoading: loading, 
        loadingMessage: message 
      }),
      
      // Toast actions
      showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => 
        set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
      
      // Selection actions
      setSelectedQuotation: (id: string | null) => set({ selectedQuotationId: id }),
      setSelectedComponent: (id: string | null) => set({ selectedComponentId: id }),
      setSelectedClient: (id: string | null) => set({ selectedClientId: id }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        // Only persist sidebar state
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);