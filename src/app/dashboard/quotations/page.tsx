// ============================================
// QUOTATIONS LIST PAGE - WITH ACTIONS
// File: src/app/dashboard/quotations/page.tsx
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout, QuotationsTable, Button, Input, Select, Card } from '@/components';
import { Plus, Search, Download, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuotations, useQuotation, useDeleteQuotation, useDuplicateQuotation, useSendQuotation } from '@/hooks/useQuotations';
import { useUIStore } from '@/store/useUIStore';
import { useDebounce } from '@/hooks/useDebounce';
import ConfirmDeleteModal from '@/components/forms/ConfirmDeleteModal';
import SendQuoteModal from '@/components/forms/SendQuoteModal';

export default function QuotationsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);
  const [sendQuoteId, setSendQuoteId] = useState<string | null>(null);
  
  const { showToast } = useUIStore();
  const deleteQuotation = useDeleteQuotation();
  const duplicateQuotation = useDuplicateQuotation();
  const sendQuotation = useSendQuotation();

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 500);

  // Fetch quotes
  const { data: quotes, isLoading, refetch } = useQuotations();

  // Filter quotes
  const filteredQuotations = useMemo(() => {
    if (!quotes) return [];

    return quotes.filter((quote) => {
      const matchesSearch = !debouncedSearch || 
        quote.quote_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quote.project_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quote.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, debouncedSearch, statusFilter]);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/quotations/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeleteQuoteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteQuoteId) return;

    try {
      await deleteQuotation.mutateAsync(deleteQuoteId);
      setDeleteQuoteId(null);
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newQuote = await duplicateQuotation.mutateAsync(id);
      showToast('Quotation duplicated successfully', 'success');
      router.push(`/dashboard/quotations/${newQuote.id}/edit`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDownload = async (id: string) => {
  try {
    // Simply open the PDF page in a new tab
    window.open(`/dashboard/quotations/${id}/download`, '_blank');
    
    showToast('Opening PDF...', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Failed to open PDF', 'error');
  }
};

  const handleSend = (id: string) => {
    setSendQuoteId(id);
  };

  const confirmSend = async (email: string, message?: string) => {
    if (!sendQuoteId) return;

    try {
      await sendQuotation.mutateAsync({ 
        quoteId: sendQuoteId, 
        email, 
        message 
      });
      setSendQuoteId(null);
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExport = () => {
    if (!filteredQuotations || filteredQuotations.length === 0) {
      showToast('No quotations to export', 'warning');
      return;
    }

    const headers = ['Quote Number', 'Client', 'Project', 'Status', 'Total', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredQuotations.map(q => [
        q.quote_number,
        `"${q.client_name}"`,
        `"${q.project_name}"`,
        q.status,
        q.grand_total || 0,
        new Date(q.created_at || '').toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Quotations exported successfully', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600 mt-1">Manage all your quotations</p>
          </div>
          <Link href="/dashboard/quotations/create">
            <Button className="bg-ppl-navy">
              <Plus className="w-4 h-4 mr-2" />
              New Quotation
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={quotes?.length || 0} color="blue" />
          <StatCard 
            label="Pending" 
            value={quotes?.filter(q => q.status === 'pending').length || 0} 
            color="yellow" 
          />
          <StatCard 
            label="Approved" 
            value={quotes?.filter(q => q.status === 'approved').length || 0} 
            color="green" 
          />
          <StatCard 
            label="Draft" 
            value={quotes?.filter(q => q.status === 'draft').length || 0} 
            color="gray" 
          />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by quote number, project, or client..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="sent">Sent</option>
              </Select>
            </div>

            {/* Export Button */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        {/* Active Filters */}
        {(debouncedSearch || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">Active filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                Search: "{debouncedSearch}"
                <button
                  onClick={() => setSearchInput('')}
                  className="hover:bg-blue-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="hover:bg-blue-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <QuotationsTable
          quotes={filteredQuotations}
          isLoading={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onDownload={handleDownload}
          onSend={handleSend}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteQuoteId !== null}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteQuoteId(null)}
        isDeleting={deleteQuotation.isPending}
      />

      {/* Send Quote Modal */}
      <SendQuoteModal
        isOpen={sendQuoteId !== null}
        quoteId={sendQuoteId}
        onSend={confirmSend}
        onCancel={() => setSendQuoteId(null)}
        isSending={sendQuotation.isPending}
      />
    </DashboardLayout>
  );
}

function StatCard({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: 'blue' | 'yellow' | 'green' | 'gray';
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
  };

  return (
    <Card className="p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
    </Card>
  );
}