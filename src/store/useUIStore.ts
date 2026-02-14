import { create } from 'zustand';

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

  // Actions
  openCreateQuotationModal: () => void;
  closeCreateQuotationModal: () => void;
  openEditQuotationModal: () => void;
  closeEditQuotationModal: () => void;
  openDeleteConfirmModal: () => void;
  closeDeleteConfirmModal: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isCreateQuotationModalOpen: false,
  isEditQuotationModalOpen: false,
  isDeleteConfirmModalOpen: false,
  isSidebarCollapsed: false,
  isLoading: false,
  loadingMessage: '',
  toast: null,

  // Actions
  openCreateQuotationModal: () => set({ isCreateQuotationModalOpen: true }),
  closeCreateQuotationModal: () => set({ isCreateQuotationModalOpen: false }),
  openEditQuotationModal: () => set({ isEditQuotationModalOpen: true }),
  closeEditQuotationModal: () => set({ isEditQuotationModalOpen: false }),
  openDeleteConfirmModal: () => set({ isDeleteConfirmModalOpen: true }),
  closeDeleteConfirmModal: () => set({ isDeleteConfirmModalOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));