import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Quotation, QuotationItem } from '@/types/quotation.types';

interface QuotationState {
  // State
  currentQuotation: Quotation | null;
  quotationItems: QuotationItem[];
  isEditing: boolean;
  isDirty: boolean;

  // Actions
  setCurrentQuotation: (quotation: Quotation | null) => void;
  setQuotationItems: (items: QuotationItem[]) => void;
  addItem: (item: QuotationItem) => void;
  updateItem: (id: string, updates: Partial<QuotationItem>) => void;
  removeItem: (id: string) => void;
  setEditing: (editing: boolean) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;

  // Computed
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const initialState = {
  currentQuotation: null,
  quotationItems: [],
  isEditing: false,
  isDirty: false,
};

export const useQuotationStore = create<QuotationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentQuotation: (quotation) =>
          set({ currentQuotation: quotation }, false, 'setCurrentQuotation'),

        setQuotationItems: (items) =>
          set({ quotationItems: items }, false, 'setQuotationItems'),

        addItem: (item) =>
          set(
            (state) => ({
              quotationItems: [...state.quotationItems, item],
              isDirty: true,
            }),
            false,
            'addItem'
          ),

        updateItem: (id, updates) =>
          set(
            (state) => ({
              quotationItems: state.quotationItems.map((item) =>
                item.id === id ? { ...item, ...updates } : item
              ),
              isDirty: true,
            }),
            false,
            'updateItem'
          ),

        removeItem: (id) =>
          set(
            (state) => ({
              quotationItems: state.quotationItems.filter((item) => item.id !== id),
              isDirty: true,
            }),
            false,
            'removeItem'
          ),

        setEditing: (editing) =>
          set({ isEditing: editing }, false, 'setEditing'),

        setDirty: (dirty) =>
          set({ isDirty: dirty }, false, 'setDirty'),

        reset: () => set(initialState, false, 'reset'),

        getTotalPrice: () => {
          const { quotationItems } = get();
          return quotationItems.reduce((sum, item) => sum + item.total_price, 0);
        },

        getItemCount: () => {
          const { quotationItems } = get();
          return quotationItems.length;
        },
      }),
      {
        name: 'quotation-store',
        partialize: (state) => ({
          currentQuotation: state.currentQuotation,
          quotationItems: state.quotationItems,
        }),
      }
    )
  )
);