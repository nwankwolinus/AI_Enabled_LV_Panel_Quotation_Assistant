// ============================================
// CLIENTS PAGE - COMPLETE (FIXED)
// File: src/app/dashboard/clients/page.tsx
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout, Card, Button, Input } from '@/components';
import { Plus, Search, X } from 'lucide-react';
import AddClientModal from '@/components/forms/AddClientModal';
import EditClientModal from '@/components/forms/EditClientModal';
import ClientsTable from '@/components/tables/ClientsTable';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { useUIStore } from '@/store/useUIStore';
import { useDebounce } from '@/hooks/useDebounce';

export default function ClientsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const { showToast } = useUIStore();
  const deleteClient = useDeleteClient();

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 500);

  // Fetch all clients (no filters passed - we filter on frontend)
  const { data: allClients, isLoading, refetch } = useClients();

  // Filter clients on frontend
  const clients = useMemo(() => {
    if (!allClients) return [];
    if (!debouncedSearch) return allClients;

    const searchLower = debouncedSearch.toLowerCase();
    return allClients.filter(client => 
      client.name?.toLowerCase().includes(searchLower) ||
      client.contact_person?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower) ||
      client.address?.toLowerCase().includes(searchLower)
    );
  }, [allClients, debouncedSearch]);

  const handleEdit = (id: string) => {
    setEditingClientId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteClient.mutateAsync(id);
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client relationships</p>
          </div>
          <Button 
            className="bg-ppl-navy"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Clients" value={clients?.length || 0} />
          <StatCard 
            label="With Email" 
            value={clients?.filter(c => c.email).length || 0} 
          />
          <StatCard 
            label="With Phone" 
            value={clients?.filter(c => c.phone).length || 0} 
          />
          <StatCard 
            label="Complete Info" 
            value={clients?.filter(c => c.email && c.phone && c.address).length || 0} 
          />
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search clients by name, contact person, email, phone, or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5 ml-1">
            Search by: Name, Contact Person, Email, Phone, or Address
          </p>
        </Card>

        {/* Active Search Filter */}
        {debouncedSearch && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">Active filter:</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
              Search: "{debouncedSearch}"
              <button
                onClick={() => setSearchInput('')}
                className="hover:bg-blue-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Clients Table/Grid */}
        <ClientsTable
          clients={clients || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        clientId={editingClientId}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClientId(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setEditingClientId(null);
          refetch();
        }}
      />
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-ppl-navy">{value}</p>
    </Card>
  );
}