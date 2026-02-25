// ============================================
// COMPONENTS PAGE - WITH EDIT
// File: src/app/dashboard/components/page.tsx
// ============================================

'use client';

import { useState } from 'react';
import { 
  DashboardLayout, 
  ComponentsTable, 
  Button, 
  Input, 
  Select, 
  Card,
} from '@/components';
import { Plus, Search, Upload, Download, FileSpreadsheet } from 'lucide-react';
import AddComponentModal from '@/components/forms/AddComponentModal';
import EditComponentModal from '@/components/forms/EditComponentModal';
import ImportComponentsModal from '@/components/forms/ImportComponentsModal';
import { useComponents, useDeleteComponent } from '@/hooks/useComponents';
import { useUIStore } from '@/store/useUIStore';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();
export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

  const { showToast } = useUIStore();
  const deleteComponent = useDeleteComponent();

  // Fetch components
  const { data: components, isLoading, refetch } = useComponents({
    search: searchQuery,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  const handleExportToExcel = () => {
    if (!components || components.length === 0) {
      showToast('No components to export', 'warning');
      return;
    }

    const headers = ['Vendor', 'Item', 'Model', 'Manufacturer', 'Price', 'Currency', 'Amperage', 'Poles', 'Category'];
    const csvContent = [
      headers.join(','),
      ...components.map(c => [
        c.vendor,
        `"${c.item}"`,
        c.model,
        c.manufacturer,
        c.price,
        c.currency,
        c.amperage || '',
        c.poles || '',
        c.category || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `components-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Components exported successfully', 'success');
  };

  const handleDownloadTemplate = () => {
    const headers = ['vendor', 'item', 'model', 'manufacturer', 'price', 'currency', 'amperage', 'poles', 'type', 'specification', 'category'];
    const example = ['Schneider', 'ACB Masterpact MTZ3', 'MTZ3 4000A', 'Schneider Electric', '12000000', 'NGN', '4000A', '4P', 'Fixed', 'Draw-out type with microprocessor-based protection', 'ACB'];
    
    const csvContent = [
      headers.join(','),
      example.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Template downloaded', 'success');
  };

  const handleEdit = (id: string) => {
    setEditingComponentId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Check if component is used before asking for confirmation
    const { data: quotesUsingComponent } = await supabase
      .from('quote_items')
      .select('quote_id, quotes!inner(quote_number, project_name)')
      .or(`incomers.cs.{"component_id":"${id}"},outgoings.cs.{"component_id":"${id}"},accessories.cs.{"component_id":"${id}"}`)
      .limit(5);

    // Show different confirmation based on usage
    if (quotesUsingComponent && quotesUsingComponent.length > 0) {
      const quotesList = quotesUsingComponent
        .map((q: any) => `- ${q.quotes?.quote_number}: ${q.quotes?.project_name}`)
        .join('\n');
      
      const message = `⚠️ This component is currently used in ${quotesUsingComponent.length} quotation(s):\n\n${quotesList}\n\n❌ Cannot delete component while it's in use.\n\n💡 To delete this component, first remove it from all quotations.`;
      
      alert(message);
      showToast('Component is being used in quotations', 'warning');
      return;
    }

    // Standard confirmation if not in use
    if (!confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteComponent.mutateAsync(id);
      refetch();
    } catch (error) {
      // Error toast handled by hook
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Components</h1>
            <p className="text-gray-600 mt-1">Manage your component library</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-ppl-navy" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Components" value={components?.length || 0} />
          <StatCard 
            label="ACBs" 
            value={components?.filter(c => c.category === 'ACB').length || 0} 
          />
          <StatCard 
            label="MCCBs" 
            value={components?.filter(c => c.category === 'MCCB').length || 0} 
          />
          <StatCard 
            label="MCBs" 
            value={components?.filter(c => c.category === 'MCB').length || 0} 
          />
          <StatCard 
            label="Others" 
            value={components?.filter(c => c.category !== 'ACB' && c.category !== 'MCCB' && c.category !== 'MCB').length || 0} 
          />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by item, model, manufacturer, or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48"
            >
              <option value="all">All Categories</option>
              <option value="ACB">ACB</option>
              <option value="MCCB">MCCB</option>
              <option value="MCB">MCB</option>
              <option value="RCCB">RCCB</option>
              <option value="Contactor">Contactor</option>
              <option value="Digital Meter">Digital Meter</option>
              <option value="Capacitor Bank">Capacitor Bank</option>
              <option value="COMAP">COMAP</option>
              <option value="Busbar">Busbar</option>
              <option value="Cable">Cable</option>
              <option value="Panel Enclosure">Panel Enclosure</option>
              <option value="Accessories">Accessories</option>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <ComponentsTable
          components={components || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <AddComponentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />

      <EditComponentModal
        isOpen={isEditModalOpen}
        componentId={editingComponentId}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingComponentId(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setEditingComponentId(null);
          refetch();
        }}
      />

      <ImportComponentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
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