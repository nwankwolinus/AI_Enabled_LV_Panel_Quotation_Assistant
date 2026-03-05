// ============================================
// COMPONENTS PAGE - OPTIMIZED WITH DEBOUNCING
// File: src/app/dashboard/components/page.tsx
// ============================================

'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  DashboardLayout, 
  ComponentsTable, 
  Button, 
  Input, 
  Select, 
  Card,
} from '@/components';
import { Plus, Search, Upload, Download, FileSpreadsheet, Trash2, X } from 'lucide-react';
import AddComponentModal from '@/components/forms/AddComponentModal';
import EditComponentModal from '@/components/forms/EditComponentModal';
import ImportComponentsModal from '@/components/forms/ImportComponentsModal';
import { useComponents, useDeleteComponent, useBulkDeleteComponents } from '@/hooks/useComponents';
import { useUIStore } from '@/store/useUIStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

const supabase = getSupabaseClient();

export default function ComponentsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { showToast } = useUIStore();
  const deleteComponent = useDeleteComponent();
  const bulkDeleteComponents = useBulkDeleteComponents();

  // Debounce search input to prevent excessive queries
  const debouncedSearch = useDebounce(searchInput, 500); // 500ms delay

  // Memoize filters to prevent object recreation on every render
  const filters = useMemo(() => ({
    search: debouncedSearch,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  }), [debouncedSearch, categoryFilter]);

  // Fetch components with stable filters
  const { data: components, isLoading, refetch } = useComponents(filters);

  // Selection handlers
  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!components) return;
    
    if (selectedIds.size === components.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(components.map(c => c.id)));
    }
  }, [components, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      showToast('No components selected', 'warning');
      return;
    }

    // Check if any selected components are in use
    const selectedIdsArray = Array.from(selectedIds);
    const usageChecks = await Promise.all(
      selectedIdsArray.map(async (id) => {
        const { data } = await supabase
          .from('quote_items')
          .select('quote_id, quotes!inner(quote_number)')
          .or(`incomers.cs.{"component_id":"${id}"},outgoings.cs.{"component_id":"${id}"},accessories.cs.{"component_id":"${id}"}`)
          .limit(1);
        
        return {
          id,
          inUse: data && data.length > 0,
          quoteNumber: data?.[0]?.quotes?.quote_number,
        };
      })
    );

    const componentsInUse = usageChecks.filter(c => c.inUse);
    
    if (componentsInUse.length > 0) {
      const componentsList = componentsInUse
        .map(c => `- Component used in ${c.quoteNumber}`)
        .join('\n');
      
      const message = `⚠️ ${componentsInUse.length} of ${selectedIds.size} selected component(s) are currently in use:\n\n${componentsList}\n\n❌ Cannot delete components while they're in use.\n\n💡 Remove them from quotations first.`;
      
      alert(message);
      showToast(`${componentsInUse.length} component(s) in use`, 'warning');
      return;
    }

    // Confirm deletion
    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} component(s)?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      await bulkDeleteComponents.mutateAsync(selectedIdsArray);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

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
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {!isSelectionMode ? (
              <>
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
                <Button 
                  variant="outline" 
                  onClick={() => setIsSelectionMode(true)}
                  disabled={!components || components.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bulk Delete
                </Button>
                <Button className="bg-ppl-navy" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleClearSelection}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedIds.size === components?.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0 || bulkDeleteComponents.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {bulkDeleteComponents.isPending 
                    ? 'Deleting...' 
                    : `Delete ${selectedIds.size} Selected`
                  }
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selection Mode Banner */}
        {isSelectionMode && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Trash2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Bulk Delete Mode
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedIds.size === 0 
                      ? 'Select components to delete' 
                      : `${selectedIds.size} component(s) selected`
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <div className="flex flex-col gap-4">
            {/* Search and Category Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search components..."
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
                  Search by: Item, Model, Manufacturer, Vendor, Type, Category, or Specification
                </p>
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

            {/* Active Filters Display */}
            {(debouncedSearch || categoryFilter !== 'all') && (
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
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className="hover:bg-blue-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(debouncedSearch || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setCategoryFilter('all');
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Table */}
        <ComponentsTable
          components={components || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // Bulk selection props
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
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