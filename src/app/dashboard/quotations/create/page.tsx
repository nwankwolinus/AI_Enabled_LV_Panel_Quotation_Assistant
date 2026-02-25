// ============================================
// CREATE QUOTATION PAGE - REAL DATABASE
// File: src/app/dashboard/quotations/create/page.tsx
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Button, Input, Label, Select, Textarea, Card } from '@/components';
import { Save, Plus, Trash2, Search } from 'lucide-react';
import { useComponents } from '@/hooks/useComponents';
import { useClients } from '@/hooks/useClients';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useUIStore } from '@/store/useUIStore';
import ComponentSearchModal from '@/components/forms/ComponentSearchModal';

interface QuoteItem {
  id: string;
  panel_name: string;
  busbar_amperage: string;
  incomers: Array<{ component_id: string; quantity: number; price: number }>;
  outgoings: Array<{ component_id: string; quantity: number; price: number }>;
  accessories: Array<{ component_id: string; quantity: number; price: number }>;
  enclosure_dimensions: string;
  enclosure_price: number;
  subtotal: number;
}

export default function CreateQuotationPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const createQuotation = useCreateQuotation();
  
  // Fetch data
  const { data: clients } = useClients();
  const { data: components } = useComponents();

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_address: '',
    attention: '',
    project_name: '',
    payment_terms: 'Net 30 days',
    execution_period: '4-6 weeks',
    validity_period: '30 days',
    notes: '',
  });

  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: crypto.randomUUID(),
      panel_name: '',
      busbar_amperage: '',
      incomers: [],
      outgoings: [],
      accessories: [],
      enclosure_dimensions: '',
      enclosure_price: 0,
      subtotal: 0,
    },
  ]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchingFor, setSearchingFor] = useState<{
    itemIndex: number;
    type: 'incomer' | 'outgoing' | 'accessory';
  } | null>(null);

  // Calculate totals
  const calculateItemSubtotal = (item: QuoteItem) => {
    const incomersTotal = item.incomers.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const outgoingsTotal = item.outgoings.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const accessoriesTotal = item.accessories.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    return incomersTotal + outgoingsTotal + accessoriesTotal + item.enclosure_price;
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const vat = grandTotal * 0.075; // 7.5% VAT
  const totalWithVAT = grandTotal + vat;

  // Handlers
  const handleClientChange = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        client_id: clientId,
        client_name: client.name,
        client_address: client.address || '',
      });
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        panel_name: '',
        busbar_amperage: '',
        incomers: [],
        outgoings: [],
        accessories: [],
        enclosure_dimensions: '',
        enclosure_price: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      showToast('At least one panel is required', 'warning');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const openComponentSearch = (itemIndex: number, type: 'incomer' | 'outgoing' | 'accessory') => {
    setSearchingFor({ itemIndex, type });
    setIsSearchModalOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    if (!searchingFor) return;

    const { itemIndex, type } = searchingFor;
    const item = items[itemIndex];
    const array = item[type === 'incomer' ? 'incomers' : type === 'outgoing' ? 'outgoings' : 'accessories'];

    // Check if component already added
    if (array.some(c => c.component_id === component.id)) {
      showToast('Component already added to this section', 'warning');
      return;
    }

    const newComponent = {
      component_id: component.id,
      quantity: 1,
      price: component.price,
    };

    updateItem(itemIndex, 
      type === 'incomer' ? 'incomers' : type === 'outgoing' ? 'outgoings' : 'accessories',
      [...array, newComponent]
    );

    setIsSearchModalOpen(false);
    setSearchingFor(null);
  };

  const removeComponent = (itemIndex: number, type: 'incomer' | 'outgoing' | 'accessory', componentIndex: number) => {
    const item = items[itemIndex];
    const field = type === 'incomer' ? 'incomers' : type === 'outgoing' ? 'outgoings' : 'accessories';
    const array = item[field];
    updateItem(itemIndex, field, array.filter((_, i) => i !== componentIndex));
  };

  const updateComponentQuantity = (
    itemIndex: number, 
    type: 'incomer' | 'outgoing' | 'accessory', 
    componentIndex: number,
    quantity: number
  ) => {
    const item = items[itemIndex];
    const field = type === 'incomer' ? 'incomers' : type === 'outgoing' ? 'outgoings' : 'accessories';
    const array = [...item[field]];
    array[componentIndex] = { ...array[componentIndex], quantity };
    updateItem(itemIndex, field, array);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      showToast('Please select a client', 'error');
      return;
    }

    if (items.length === 0 || items.every(i => !i.panel_name)) {
      showToast('Please add at least one panel', 'error');
      return;
    }

    try {
      const quotationData = {
        ...formData,
        total: grandTotal,
        vat,
        grand_total: totalWithVAT,
        status: 'draft',
        items: items.map((item, index) => ({
          item_number: index + 1,
          panel_name: item.panel_name,
          busbar_amperage: item.busbar_amperage,
          incomers: item.incomers,
          outgoings: item.outgoings,
          accessories: item.accessories,
          enclosure_dimensions: item.enclosure_dimensions,
          enclosure_price: item.enclosure_price,
          subtotal: calculateItemSubtotal(item),
        })),
      };

      await createQuotation.mutateAsync(quotationData);
      showToast('Quotation created successfully', 'success');
      router.push('/dashboard/quotations');
    } catch (error) {
      console.error('Error creating quotation:', error);
      showToast('Failed to create quotation', 'error');
    }
  };

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Quotation</h1>
            <p className="text-gray-600 mt-1">Fill in the details below to generate a new quotation</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-ppl-navy" disabled={createQuotation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {createQuotation.isPending ? 'Saving...' : 'Save Quotation'}
            </Button>
          </div>
        </div>

        {/* Client Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select
                id="client"
                required
                value={formData.client_id}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="">Select Client</option>
                {clients?.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="attention">Attention</Label>
              <Input
                id="attention"
                value={formData.attention}
                onChange={(e) => setFormData({ ...formData, attention: e.target.value })}
                placeholder="Contact person"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="project">Project Name *</Label>
              <Input
                id="project"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g., Factory Main Distribution Panel"
              />
            </div>
          </div>
        </Card>

        {/* Quote Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Panels & Components</h2>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Panel
            </Button>
          </div>

          <div className="space-y-6">
            {items.map((item, itemIndex) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Panel {itemIndex + 1}</h3>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(itemIndex)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                {/* Panel Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Panel Name *</Label>
                    <Input
                      required
                      value={item.panel_name}
                      onChange={(e) => updateItem(itemIndex, 'panel_name', e.target.value)}
                      placeholder="e.g., MDB-01"
                    />
                  </div>
                  <div>
                    <Label>Busbar Amperage *</Label>
                    <Select
                      required
                      value={item.busbar_amperage}
                      onChange={(e) => updateItem(itemIndex, 'busbar_amperage', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="400A">400A</option>
                      <option value="630A">630A</option>
                      <option value="800A">800A</option>
                      <option value="1000A">1000A</option>
                      <option value="1600A">1600A</option>
                      <option value="2000A">2000A</option>
                      <option value="2500A">2500A</option>
                      <option value="3200A">3200A</option>
                      <option value="4000A">4000A</option>
                    </Select>
                  </div>
                </div>

                {/* Components Sections */}
                <ComponentSection
                  title="Incomers"
                  components={item.incomers}
                  allComponents={components || []}
                  onAdd={() => openComponentSearch(itemIndex, 'incomer')}
                  onRemove={(idx) => removeComponent(itemIndex, 'incomer', idx)}
                  onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'incomer', idx, qty)}
                />

                <ComponentSection
                  title="Outgoings"
                  components={item.outgoings}
                  allComponents={components || []}
                  onAdd={() => openComponentSearch(itemIndex, 'outgoing')}
                  onRemove={(idx) => removeComponent(itemIndex, 'outgoing', idx)}
                  onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'outgoing', idx, qty)}
                />

                <ComponentSection
                  title="Accessories"
                  components={item.accessories}
                  allComponents={components || []}
                  onAdd={() => openComponentSearch(itemIndex, 'accessory')}
                  onRemove={(idx) => removeComponent(itemIndex, 'accessory', idx)}
                  onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'accessory', idx, qty)}
                />

                {/* Enclosure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Enclosure Dimensions</Label>
                    <Input
                      value={item.enclosure_dimensions}
                      onChange={(e) => updateItem(itemIndex, 'enclosure_dimensions', e.target.value)}
                      placeholder="e.g., 2000 x 1200 x 600mm"
                    />
                  </div>
                  <div>
                    <Label>Enclosure Price (NGN)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.enclosure_price}
                      onChange={(e) => updateItem(itemIndex, 'enclosure_price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="text-right font-semibold text-lg pt-4 border-t">
                  Panel Subtotal: ₦{calculateItemSubtotal(item).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Terms & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
            <div className="space-y-4">
              <div>
                <Label>Payment Terms</Label>
                <Select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                >
                  <option value="Net 30 days">Net 30 days</option>
                  <option value="50% upfront, 50% on completion">50% upfront, 50% on completion</option>
                  <option value="30% upfront, 70% on delivery">30% upfront, 70% on delivery</option>
                </Select>
              </div>
              <div>
                <Label>Execution Period</Label>
                <Input
                  value={formData.execution_period}
                  onChange={(e) => setFormData({ ...formData, execution_period: e.target.value })}
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
              <div>
                <Label>Validity Period</Label>
                <Input
                  value={formData.validity_period}
                  onChange={(e) => setFormData({ ...formData, validity_period: e.target.value })}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>
          </Card>

          {/* Pricing Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-semibold">₦{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>VAT (7.5%):</span>
                <span className="font-semibold">₦{vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-ppl-navy pt-3 border-t">
                <span>Grand Total:</span>
                <span>₦{totalWithVAT.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes..."
            rows={4}
          />
        </Card>
      </form>

      {/* Component Search Modal */}
      <ComponentSearchModal
        isOpen={isSearchModalOpen}
        components={components || []}
        onSelect={handleComponentSelect}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchingFor(null);
        }}
      />
    </DashboardLayout>
  );
}

// Component Section Helper
function ComponentSection({
  title,
  components,
  allComponents,
  onAdd,
  onRemove,
  onUpdateQuantity,
}: {
  title: string;
  components: Array<{ component_id: string; quantity: number; price: number }>;
  allComponents: any[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdateQuantity: (idx: number, qty: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Search className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      {components.length === 0 ? (
        <div className="text-sm text-gray-500 italic py-2">No {title.toLowerCase()} added</div>
      ) : (
        <div className="space-y-2">
          {components.map((comp: any, idx: number) => {
            const fullComp = allComponents.find((c: any) => c.id === comp.component_id);
            return (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{fullComp?.item || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {fullComp?.model} - ₦{comp.price.toLocaleString()} each
                  </p>
                </div>
                <Input
                  type="number"
                  min="1"
                  value={comp.quantity}
                  onChange={(e) => onUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <div className="w-32 text-right font-medium">
                  ₦{(comp.price * comp.quantity).toLocaleString()}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}