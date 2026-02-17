// ============================================
// QUOTATIONS LIST PAGE
// File: src/app/dashboard/quotations/page.tsx
// ============================================

'use client';

import { mockQuotations } from '@/lib/mock-data';
import { useState } from 'react';
import { DashboardLayout, QuotationsTable, Button, Input, Select, Card } from '@/components';
import { Plus, Search, Filter, Download } from 'lucide-react';
import Link from 'next/link';

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const quotations = mockQuotations;

  const handleEdit = (id: string) => {
    console.log('Edit quotation:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete quotation:', id);
  };

  const handleDuplicate = (id: string) => {
    console.log('Duplicate quotation:', id);
  };

  const handleDownload = (id: string) => {
    console.log('Download quotation:', id);
  };

  const handleSend = (id: string) => {
    console.log('Send quotation:', id);
  };

  const filteredQuotations = quotations.filter((quote) => {
    const matchesSearch = 
      quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
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

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by quote number, project, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={quotations.length} color="blue" />
          <StatCard 
            label="Pending" 
            value={quotations.filter(q => q.status === 'pending').length} 
            color="yellow" 
          />
          <StatCard 
            label="Approved" 
            value={quotations.filter(q => q.status === 'approved').length} 
            color="green" 
          />
          <StatCard 
            label="Draft" 
            value={quotations.filter(q => q.status === 'draft').length} 
            color="gray" 
          />
        </div>

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
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
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
