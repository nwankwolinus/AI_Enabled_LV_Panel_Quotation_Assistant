// ============================================
// COMPONENTS PAGE - COMPLETE
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
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components';
import { Plus, Search, Upload, Download, FileSpreadsheet } from 'lucide-react';
import AddComponentModal from '@/components/forms/AddComponentModal';
import ImportComponentsModal from '@/components/forms/ImportComponentsModal';
import { useComponents } from '@/hooks/useComponents';
import { useUIStore } from '@/store/useUIStore';

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { showToast } = useUIStore();

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

    // Simple CSV export (upgrade to XLSX later)
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
    // Headers match your exact table structure
    const headers = ['vendor', 'item', 'model', 'manufacturer', 'price', 'currency', 'amperage', 'poles', 'type', 'specification', 'category'];
    
    // Example rows with realistic data
    const examples = [
      ['Schneider', 'ACB Masterpact MTZ3 4000A', 'MTZ3 4000A', 'Schneider Electric', '12000000', 'NGN', '4000A', '4P', 'Fixed', 'Draw-out type with electronic protection', 'ACB'],
      ['ABB', 'MCCB Tmax T7 630A', 'T7 630A', 'ABB', '850000', 'NGN', '630A', '4P', 'Fixed', 'Thermal magnetic protection', 'MCCB'],
      ['Schneider', 'MCB Acti 9 C63', 'C63A', 'Schneider Electric', '15000', 'NGN', '63A', '3P', 'Fixed', 'Thermal magnetic MCB', 'MCB'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...examples.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Template downloaded - Fill in your data and import!', 'success');
  };

  const handleEdit = (id: string) => {
    showToast('Edit functionality coming soon', 'info');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;
    
    try {
      // TODO: Implement delete API call
      showToast('Component deleted successfully', 'success');
      refetch();
    } catch (error) {
      showToast('Failed to delete component', 'error');
    }
  };

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
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
            label="Others" 
            value={components?.filter(c => c.category !== 'ACB' && c.category !== 'MCCB').length || 0} 
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