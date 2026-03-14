// ============================================
// QUOTE ITEMS EDITOR
// File: src/components/quotations/QuoteItemsEditor.tsx
// ============================================

'use client';

import { useState } from 'react';
import { Card, Button } from '@/components';
import { Plus, Edit2, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { QuoteItemRow } from '@/types/database.types';

interface QuoteItemsEditorProps {
  quoteId: string;
  items: QuoteItemRow[];
  onItemsChange: (items: QuoteItemRow[]) => void;
  readonly?: boolean;
}

export default function QuoteItemsEditor({
  quoteId,
  items,
  onItemsChange,
  readonly = false,
}: QuoteItemsEditorProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleAddItem = () => {
    const newItem: Partial<QuoteItemRow> = {
      id: `temp-${Date.now()}`,
      quote_id: quoteId,
      item_number: items.length + 1,
      panel_name: `Panel ${items.length + 1}`,
      incomers: null,
      outgoings: null,
      accessories: null,
      busbar_amperage: null,
      busbar_specification: null,
      busbar_price: null,
      enclosure_dimensions: null,
      enclosure_price: null,
      subtotal: 0,
    };

    onItemsChange([...items, newItem as QuoteItemRow]);
    setEditingItem(newItem.id!);
    setExpandedItem(newItem.id!);
  };

  const handleDuplicateItem = (item: QuoteItemRow) => {
    const duplicatedItem: Partial<QuoteItemRow> = {
      ...item,
      id: `temp-${Date.now()}`,
      item_number: items.length + 1,
      panel_name: `${item.panel_name} (Copy)`,
    };

    onItemsChange([...items, duplicatedItem as QuoteItemRow]);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this panel?')) return;
    
    const filtered = items.filter(item => item.id !== id);
    // Renumber items
    const renumbered = filtered.map((item, index) => ({
      ...item,
      item_number: index + 1,
    }));
    
    onItemsChange(renumbered);
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const calculateSubtotal = (item: QuoteItemRow): number => {
    let total = 0;

    // Incomers
    if (item.incomers && Array.isArray(item.incomers)) {
      total += item.incomers.reduce((sum: number, inc: any) => 
        sum + (inc.quantity * inc.unit_price || 0), 0
      );
    }

    // Outgoings
    if (item.outgoings && Array.isArray(item.outgoings)) {
      total += item.outgoings.reduce((sum: number, out: any) => 
        sum + (out.quantity * out.unit_price || 0), 0
      );
    }

    // Accessories
    if (item.accessories && Array.isArray(item.accessories)) {
      total += item.accessories.reduce((sum: number, acc: any) => 
        sum + (acc.quantity * acc.unit_price || 0), 0
      );
    }

    // Busbar
    if (item.busbar_price) {
      total += item.busbar_price;
    }

    // Enclosure
    if (item.enclosure_price) {
      total += item.enclosure_price;
    }

    // Digital Meter
    if (item.digital_meter && typeof item.digital_meter === 'object') {
      const meter = item.digital_meter as any;
      total += (meter.quantity || 0) * (meter.unit_price || 0);
    }

    // Surge Arrester
    if (item.surge_arrester && typeof item.surge_arrester === 'object') {
      const arrester = item.surge_arrester as any;
      total += (arrester.quantity || 0) * (arrester.unit_price || 0);
    }

    // COMAP Controllers
    ['comap_intelligent_200', 'comap_amf_9', 'comap_amf_16'].forEach(key => {
      const comap = (item as any)[key];
      if (comap && typeof comap === 'object') {
        total += (comap.quantity || 0) * (comap.unit_price || 0);
      }
    });

    // Capacitor Banks
    ['capacitor_bank_25kvar', 'capacitor_bank_60kvar'].forEach(key => {
      const cap = (item as any)[key];
      if (cap && typeof cap === 'object') {
        total += (cap.quantity || 0) * (cap.unit_price || 0);
      }
    });

    // Power Factor Controller
    if (item.power_factor_controller_12stage && typeof item.power_factor_controller_12stage === 'object') {
      const pfc = item.power_factor_controller_12stage as any;
      total += (pfc.quantity || 0) * (pfc.unit_price || 0);
    }

    // Contactor Battery Charger
    if (item.contactor_battery_charger && typeof item.contactor_battery_charger === 'object') {
      const cbc = item.contactor_battery_charger as any;
      total += (cbc.quantity || 0) * (cbc.unit_price || 0);
    }

    // Cables
    if (item.cables && Array.isArray(item.cables)) {
      total += item.cables.reduce((sum: number, cable: any) => 
        sum + (cable.quantity * cable.unit_price || 0), 0
      );
    }

    // Bolts
    if (item.bolts && Array.isArray(item.bolts)) {
      total += item.bolts.reduce((sum: number, bolt: any) => 
        sum + (bolt.quantity * bolt.unit_price || 0), 0
      );
    }

    // Others
    if (item.others && Array.isArray(item.others)) {
      total += item.others.reduce((sum: number, other: any) => 
        sum + (other.quantity * other.unit_price || 0), 0
      );
    }

    return total;
  };

  if (items.length === 0 && readonly) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>No items in this quotation</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items List */}
      {items.map((item) => {
        const isExpanded = expandedItem === item.id;
        const subtotal = calculateSubtotal(item);

        return (
          <Card key={item.id} className="overflow-hidden">
            {/* Item Header */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-sm font-medium text-gray-500">
                    #{item.item_number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.panel_name}
                    </h3>
                    {item.enclosure_dimensions && (
                      <p className="text-sm text-gray-600">
                        {item.enclosure_dimensions}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="font-semibold text-ppl-navy">
                      ₦{subtotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!readonly && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item.id)}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateItem(item)}
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                {/* Incomers */}
                {item.incomers && Array.isArray(item.incomers) && item.incomers.length > 0 && (
                  <ItemSection
                    title="Incomers"
                    items={item.incomers as any[]}
                  />
                )}

                {/* Outgoings */}
                {item.outgoings && Array.isArray(item.outgoings) && item.outgoings.length > 0 && (
                  <ItemSection
                    title="Outgoings"
                    items={item.outgoings as any[]}
                  />
                )}

                {/* Busbar */}
                {item.busbar_amperage && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Busbar</h4>
                    <div className="text-sm text-gray-600">
                      <p>{item.busbar_type} - {item.busbar_amperage}</p>
                      {item.busbar_specification && <p>{item.busbar_specification}</p>}
                      <p className="font-medium text-gray-900 mt-1">
                        ₦{item.busbar_price?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Enclosure */}
                {item.enclosure_dimensions && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Enclosure</h4>
                    <div className="text-sm text-gray-600">
                      <p>{item.enclosure_dimensions}</p>
                      <p className="font-medium text-gray-900 mt-1">
                        ₦{item.enclosure_price?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Accessories */}
                {item.accessories && Array.isArray(item.accessories) && item.accessories.length > 0 && (
                  <ItemSection
                    title="Accessories"
                    items={item.accessories as any[]}
                  />
                )}

                {/* Notes */}
                {item.notes && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Add Item Button */}
      {!readonly && (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={handleAddItem}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Panel
        </Button>
      )}

      {/* Summary */}
      <Card className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total ({items.length} panels)</span>
          <span className="text-2xl font-bold text-ppl-navy">
            ₦{items.reduce((sum, item) => sum + (item.subtotal || 0), 0).toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
}

// Helper component for displaying item sections
function ItemSection({ title, items }: { title: string; items: any[] }) {
  return (
    <div>
      <h4 className="font-medium text-sm text-gray-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900">{item.description || item.item || 'Item'}</p>
              {item.specification && (
                <p className="text-gray-500 text-xs">{item.specification}</p>
              )}
            </div>
            <div className="text-right ml-4">
              <p className="text-gray-600">
                {item.quantity} × ₦{item.unit_price?.toLocaleString() || '0'}
              </p>
              <p className="font-medium text-gray-900">
                ₦{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}