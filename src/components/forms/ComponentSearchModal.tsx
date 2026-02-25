// ============================================
// COMPONENT SEARCH MODAL
// File: src/components/forms/ComponentSearchModal.tsx
// ============================================

'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components';
import { X, Search } from 'lucide-react';

interface ComponentSearchModalProps {
  isOpen: boolean;
  components: any[];
  onSelect: (component: any) => void;
  onClose: () => void;
}

export default function ComponentSearchModal({
  isOpen,
  components,
  onSelect,
  onClose,
}: ComponentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  // Filter components
  const filteredComponents = components.filter(comp => {
    const matchesSearch = searchQuery === '' || 
      comp.item?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(components.map(c => c.category).filter(Boolean)))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Select Component</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-6 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by item, model, or manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === cat 
                    ? 'bg-ppl-navy text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No components found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComponents.map(component => (
                <button
                  key={component.id}
                  onClick={() => onSelect(component)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-ppl-navy hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{component.item}</h3>
                      <p className="text-sm text-gray-600">{component.model}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                      {component.category || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Manufacturer: {component.manufacturer}</p>
                    {component.amperage && <p>Amperage: {component.amperage}</p>}
                    {component.poles && <p>Poles: {component.poles}</p>}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-500">{component.vendor}</span>
                    <span className="text-lg font-bold text-ppl-navy">
                      {component.currency} {component.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredComponents.length} component(s) found
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}