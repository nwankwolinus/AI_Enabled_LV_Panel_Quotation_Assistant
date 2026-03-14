// ============================================
// EDIT QUOTATION PAGE - WITH ITEMS EDITOR
// File: src/app/dashboard/quotations/[id]/edit/page.tsx
// ============================================

'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout, Button, Card } from '@/components';
import { ArrowLeft, Save, Send, Download } from 'lucide-react';
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';
import { useQuoteItems } from '@/hooks/useQuoteItems';
import { useUIStore } from '@/store/useUIStore';
import Link from 'next/link';
import QuoteItemsEditor from '@/components/quotations/QuoteItemsEditor';
import { useState, useEffect } from 'react';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const { showToast } = useUIStore();

  // Fetch quotation data
  const { data: quote, isLoading, error } = useQuotation(quoteId);
  const { data: quoteItems = [], isLoading: itemsLoading } = useQuoteItems(quoteId);
  const updateQuotation = useUpdateQuotation();

  // Local state for items (for optimistic updates)
  const [localItems, setLocalItems] = useState(quoteItems);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (quoteItems.length > 0 && (!isInitialized || quoteItems.length !== localItems.length)) {
      setLocalItems(quoteItems);
      setIsInitialized(true);
    }
  }, [quoteItems.length, isInitialized]); // Only runs when length changes

  const calculateTotals = () => {
    const subtotal = localItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const vat = subtotal * 0.075; // 7.5% VAT
    const grandTotal = subtotal + vat;

    return { subtotal, vat, grandTotal };
  };

  const handleSaveDraft = async () => {
    try {
      const { subtotal, vat, grandTotal } = calculateTotals();
      
      await updateQuotation.mutateAsync({
        id: quoteId,
        data: {
          total: subtotal,
          vat: vat,
          grand_total: grandTotal,
          status: 'draft',
        },
      });

      showToast('Quotation saved as draft', 'success');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSendQuote = async () => {
    try {
      const { subtotal, vat, grandTotal } = calculateTotals();
      
      await updateQuotation.mutateAsync({
        id: quoteId,
        data: {
          total: subtotal,
          vat: vat,
          grand_total: grandTotal,
          status: 'pending',
          sent_at: new Date().toISOString(),
        },
      });

      showToast('Quotation sent successfully', 'success');
      router.push('/dashboard/quotations');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDownloadPDF = async () => {
    try {
      showToast('Generating PDF...', 'info');
      
      const response = await fetch(`/api/quotations/${quoteId}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quote?.quote_number || 'quotation'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download PDF', 'error');
    }
  };

  if (isLoading || itemsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ppl-navy mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quote) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quotation Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The quotation you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/dashboard/quotations">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { subtotal, vat, grandTotal } = calculateTotals();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quotations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Quotation
              </h1>
              <p className="text-gray-600 mt-1">
                {quote.quote_number} - {quote.project_name}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={updateQuotation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateQuotation.isPending ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              className="bg-ppl-navy"
              onClick={handleSendQuote}
              disabled={updateQuotation.isPending || localItems.length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Quote
            </Button>
          </div>
        </div>

        {/* Quote Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quotation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Client Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Client:</span>
                  <span className="ml-2 text-gray-900">{quote.client_name}</span>
                </div>
                {quote.client_address && (
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 text-gray-900">{quote.client_address}</span>
                  </div>
                )}
                {quote.attention && (
                  <div>
                    <span className="text-gray-600">Attention:</span>
                    <span className="ml-2 text-gray-900">{quote.attention}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quote Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Quote Number:</span>
                  <span className="ml-2 text-gray-900">{quote.quote_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                      quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quote.status}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(quote.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quote Items */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quote Items</h2>
          <QuoteItemsEditor
            quoteId={quoteId}
            items={localItems}
            onItemsChange={setLocalItems}
          />
        </Card>

        {/* Totals */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>VAT (7.5%)</span>
              <span className="font-medium">₦{vat.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                <span className="text-2xl font-bold text-ppl-navy">
                  ₦{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms & Conditions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
          
          <div className="space-y-4">
            {quote.payment_terms && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <p className="text-sm text-gray-900">{quote.payment_terms}</p>
              </div>
            )}
            
            {quote.execution_period && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Execution Period
                </label>
                <p className="text-sm text-gray-900">{quote.execution_period}</p>
              </div>
            )}
            
            {quote.validity_period && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity Period
                </label>
                <p className="text-sm text-gray-900">{quote.validity_period}</p>
              </div>
            )}
            
            {quote.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <p className="text-sm text-gray-900">{quote.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}