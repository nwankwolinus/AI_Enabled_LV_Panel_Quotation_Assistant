'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useQuotationStore } from '@/store/useQuotationStore';
import { useUIStore } from '@/store/useUIStore';
import { QuotationService } from '@/services/QuotationServices';
import { createQuotationSchema } from '@/lib/validations/quotation.schema';

export default function CreateQuotationPage() {
  const quotationService = QuotationService.getInstance();
  const { addItem, quotationItems, getTotalPrice } = useQuotationStore();
  const { showToast, setLoading } = useUIStore();
  const createMutation = useCreateQuotation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createQuotationSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true, 'Creating quotation...');

      const result = await quotationService.createQuotation({
        ...data,
        items: quotationItems.map(item => ({
          componentId: item.component_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      });

      showToast('Quotation created successfully!', 'success');
      // Navigate to quotation detail page
    } catch (error) {
      showToast('Failed to create quotation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Quotation</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          {/* Items list */}
          <p className="text-lg font-bold mt-4">
            Total: ₦{getTotalPrice().toLocaleString()}
          </p>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-6 px-6 py-2 bg-ppl-navy text-white rounded"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
        </button>
      </form>
    </div>
  );
}