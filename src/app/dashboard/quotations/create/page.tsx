// ============================================
// CREATE QUOTATION PAGE - WITH BUSBAR & CABLE AUTO-CALC
// File: src/app/dashboard/quotations/create/page.tsx
// NEW: Added Main Busbar, Link Busbar, and Cable sections with auto-calculations
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, Button, Input, Label, Select, Textarea, Card } from '@/components';
import { Save, Plus, Trash2, Search, RefreshCw, Calculator } from 'lucide-react';
import { useComponents } from '@/hooks/useComponents';
import { useClients } from '@/hooks/useClients';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useUIStore } from '@/store/useUIStore';
import ComponentSearchModal from '@/components/forms/ComponentSearchModal';
import { generateUniqueQuoteNumber } from '@/lib/utils';
import { QuoteItem } from '@/types/quotation.types';
import { calculatePanel } from '@/lib/calculations/panelCalculator';

type PanelType = 'isolator' | 'changeover' | 'synch_panel' | 'lv_panel' | 'custom';

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
      panel_type: 'lv_panel',
      panel_name: '',
      busbar_amperage: '',
      incomers: [],
      outgoings: [],
      accessories: [],
      enclosure_dimensions: '',
      enclosure_height: 0,
      enclosure_width: 0,
      enclosure_depth: 0,
      enclosure_price: 0,
      main_busbar: null,
      link_busbars: [],
      cables: [],
      subtotal: 0,
      bolts: null,
      busbar_link_specification: null,
      busbar_link_type: null,
      busbar_price: null,
      busbar_specification: null,
      busbar_type: null,
      cable_link_size: null,
      capacitor_bank_25kvar: null,
      capacitor_bank_60kvar: null,
      comap_amf_16: null,
      comap_amf_9: null,
      comap_intelligent_200: null,
      contactor_battery_charger: null,
      created_at: null,
      digital_meter: null,
      item_number: 0,
      notes: null,
      others: null,
      power_factor_controller_12stage: null,
      quote_id: '',
      surge_arrester: null,
      updated_at: null
    },
  ]);

  const [quoteNumber, setQuoteNumber] = useState('');
  const [isGeneratingQuoteNumber, setIsGeneratingQuoteNumber] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchingFor, setSearchingFor] = useState<{
    itemIndex: number;
    type: 'incomer' | 'outgoing' | 'accessory';
  } | null>(null);

  // Generate quote number on mount
  useEffect(() => {
    const generateNumber = async () => {
      setIsGeneratingQuoteNumber(true);
      try {
        const number = await generateUniqueQuoteNumber();
        setQuoteNumber(number);
      } catch (error) {
        console.error('Error generating quote number:', error);
        showToast('Failed to generate quote number', 'error');
      } finally {
        setIsGeneratingQuoteNumber(false);
      }
    };
    generateNumber();
  }, [showToast]);

  const handleRegenerateQuoteNumber = async () => {
    setIsGeneratingQuoteNumber(true);
    try {
      const number = await generateUniqueQuoteNumber();
      setQuoteNumber(number);
      showToast('New quote number generated', 'success');
    } catch (error) {
      showToast('Failed to generate quote number', 'error');
    } finally {
      setIsGeneratingQuoteNumber(false);
    }
  };

  // ============================================
  // BUSBAR & CABLE CALCULATION FUNCTIONS
  // ============================================

  /**
   * Auto-calculate busbar and cable when item changes
   */
  /**
 * Auto-calculate busbar and cable using the calculation engine
 */
  const autoCalculateBusbarAndCable = (item: QuoteItem): QuoteItem => {
    const updatedItem = { ...item };
    updatedItem.subtotal = calculateItemSubtotal(updatedItem);

    // Skip if no components loaded yet
    if (!components || components.length === 0) {
      return updatedItem;
    }

    // Run calculation engine
    const result = calculatePanel({
      enclosure_height: item.enclosure_height,
      enclosure_width: item.enclosure_width,
      busbar_amperage: item.busbar_amperage || undefined,
      incomers: item.incomers,
      outgoings: item.outgoings,
      components: components?.map(c => ({
        ...c,
        category: c.category || undefined,
        amperage: c.amperage || undefined,
      })) || [],
    });

    // Update item with calculated results
    updatedItem.main_busbar = result.main_busbar ? {
      ...result.main_busbar,
      quantity_meters: result.main_busbar.meters,
    } : null;
    updatedItem.link_busbars = result.link_busbars.map(busbar => ({
      ...busbar,
      quantity_meters: busbar.meters,
    }));
    updatedItem.cables = result.cables.map(cable => ({
      ...cable,
      quantity_meters: cable.meters,
    }));

    return updatedItem;
  };
  // Calculate item subtotal
  const calculateItemSubtotal = (item: QuoteItem) => {
    const incomersTotal = item.incomers.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const outgoingsTotal = item.outgoings.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const accessoriesTotal = item.accessories.reduce((sum, c) => sum + (c.price * c.quantity), 0);

    // ✅ CHANGED: Main busbar
    const mainBusbarTotal = item.main_busbar?.total || 0;

    // ✅ CHANGED: Sum all link busbars
    const linkBusbarsTotal = item.link_busbars?.reduce((sum, b) => sum + b.total, 0) || 0;

    // ✅ CHANGED: Sum all cables
    const cablesTotal = item.cables?.reduce((sum, c) => sum + c.total, 0) || 0;

    return incomersTotal + outgoingsTotal + accessoriesTotal +
      mainBusbarTotal + linkBusbarsTotal + cablesTotal + item.enclosure_price;
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const vat = grandTotal * 0.075;
  const totalWithVAT = grandTotal + vat;

  // ============================================
  // HANDLERS
  // ============================================

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
        panel_type: null,
        panel_name: '',
        busbar_amperage: '',
        incomers: [],
        outgoings: [],
        accessories: [],
        enclosure_dimensions: '',
        enclosure_height: 0,
        enclosure_width: 0,
        enclosure_depth: 0,
        enclosure_price: 0,
        main_busbar: null,
        link_busbars: [],
        cables: [],
        subtotal: 0,
        bolts: null,
        busbar_link_specification: null,
        busbar_link_type: null,
        busbar_price: null,
        busbar_specification: null,
        busbar_type: null,
        cable_link_size: null,
        capacitor_bank_25kvar: null,
        capacitor_bank_60kvar: null,
        comap_amf_16: null,
        comap_amf_9: null,
        comap_intelligent_200: null,
        contactor_battery_charger: null,
        created_at: null,
        digital_meter: null,
        item_number: 0,
        notes: null,
        others: null,
        power_factor_controller_12stage: null,
        quote_id: '',
        surge_arrester: null,
        updated_at: null
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
    let updatedItem = { ...newItems[index], [field]: value };

    // Auto-recalculate when relevant fields change
    if (field === 'enclosure_dimensions' || field === 'enclosure_width' ||
      field === 'enclosure_height' || field === 'busbar_amperage' ||
      field === 'incomers' || field === 'outgoings') {
      updatedItem = autoCalculateBusbarAndCable(updatedItem);
    }

    newItems[index] = updatedItem;
    setItems(newItems);
  };

  /**
   * Parse enclosure dimensions and update width/height/depth
   */
  const handleEnclosureDimensionsChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].enclosure_dimensions = value;

    // Parse dimensions: "2000 x 800 x 600" or "2000x800x600"
    const match = value.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i);
    if (match) {
      newItems[index].enclosure_height = parseInt(match[1]);
      newItems[index].enclosure_width = parseInt(match[2]);
      newItems[index].enclosure_depth = parseInt(match[3]);

      // Auto-calculate busbar
      newItems[index] = autoCalculateBusbarAndCable(newItems[index]);
    }

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

    if (array.some(c => c.component_id === component.id)) {
      showToast('Component already added to this section', 'warning');
      return;
    }

    // Extract amperage and poles from component (you may need to adjust this based on your data structure)
    const amperage = extractAmperageFromComponent(component);
    const poles = extractPolesFromComponent(component);

    const newComponent = {
      component_id: component.id,
      quantity: 1,
      price: component.price,
      amperage,
      poles,
    };

    updateItem(itemIndex,
      type === 'incomer' ? 'incomers' : type === 'outgoing' ? 'outgoings' : 'accessories',
      [...array, newComponent]
    );

    setIsSearchModalOpen(false);
    setSearchingFor(null);
  };

  // Helper functions to extract amperage and poles from component
  const extractAmperageFromComponent = (component: any): number | undefined => {
  if (component.amperage) return parseInt(component.amperage);

  const match =
    component.item?.match(/(\d+)\s*A/i) ||
    component.category?.match(/(\d+)\s*A/i);

  return match ? parseInt(match[1]) : undefined;
};
  const extractPolesFromComponent = (component: any): number | undefined => {
    // Try to extract poles from model or specification
    const match = component.item?.match(/(\d+)P/) || component.category?.match(/(\d+)P/);
    return match ? parseInt(match[1]) : undefined;
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

    if (!quoteNumber) {
      showToast('Quote number is required', 'error');
      return;
    }

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
        quote_number: quoteNumber,
        ...formData,
        total: grandTotal,
        vat,
        grand_total: totalWithVAT,
        status: 'draft',
        items: items.map((item, index) => ({
        item_number: index + 1,
        panel_name: item.panel_name,
        busbar_amperage: item.busbar_amperage || undefined,
        incomers: item.incomers,
        outgoings: item.outgoings,
        accessories: item.accessories,
        enclosure_dimensions: item.enclosure_dimensions,
        enclosure_price: item.enclosure_price,
  
        // ✅ Main busbar data
        busbar_type: item.main_busbar?.size || null,
        busbar_specification: item.main_busbar ? `${item.main_busbar.meters.toFixed(2)}m` : null,
        busbar_price: item.main_busbar?.total || null,
  
        // ✅ Link busbars (store as JSON array or summary)
        busbar_link_type: item.link_busbars.length > 0 
          ? item.link_busbars.map(b => b.size).join(', ') 
          : null,
        busbar_link_specification: item.link_busbars.length > 0
          ? item.link_busbars.map(b => `${b.size}: ${b.meters.toFixed(2)}m`).join('; ')
          : null,
  
        // ✅ Cables (store as JSON array or summary)
        cable_link_size: item.cables.length > 0
            ? item.cables.map(c => c.size).join(', ')
        : null,
  
  subtotal: calculateItemSubtotal(item),
})),
      };

      await createQuotation.mutateAsync(quotationData);
      showToast('Quotation created successfully', 'success');
      router.push('/dashboard/quotations');
    } catch (error: any) {
      console.error('Error creating quotation:', error);

      if (error?.code === '23505') {
        showToast('Quote number conflict. Generating new number...', 'warning');
        await handleRegenerateQuoteNumber();
      } else {
        showToast('Failed to create quotation', 'error');
      }
    }
  };

  return (
    <DashboardLayout>
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
            <Button
              type="submit"
              className="bg-ppl-navy"
              disabled={createQuotation.isPending || isGeneratingQuoteNumber || !quoteNumber}
            >
              <Save className="w-4 h-4 mr-2" />
              {createQuotation.isPending ? 'Saving...' : 'Save Quotation'}
            </Button>
          </div>
        </div>

        {/* Quote Number Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Quote Number</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="PPL/2024/001"
                disabled={isGeneratingQuoteNumber}
                required
                className="font-mono text-lg bg-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerateQuoteNumber}
              disabled={isGeneratingQuoteNumber}
              title="Generate new quote number"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingQuoteNumber ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-blue-700 mt-2 font-medium">
            {isGeneratingQuoteNumber
              ? '⏳ Generating unique quote number...'
              : quoteNumber
                ? '✅ Quote number ready - Sequential from database'
                : '⚠️ Click regenerate to get a quote number'
            }
          </p>
        </Card>

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
                {/* PANEL HEADER */}
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

                {/* PANEL DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Panel Type *</Label>
                    <Select
                      required
                      value={item.panel_type || ''}
                      onChange={(e) => updateItem(itemIndex, 'panel_type', e.target.value as PanelType)}
                    >
                      <option value="">Select</option>
                      <option value="isolator">Isolator</option>
                      <option value="changeover">Changeover</option>
                      <option value="lv_panel">LV Panel</option>
                      <option value="synch_panel">Synch Panel</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </div>
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
                      value={item.busbar_amperage || ''}
                      onChange={(e) => updateItem(itemIndex, 'busbar_amperage', e.target.value as string)}
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

                {/* COMPONENTS SECTIONS */}
                {item.panel_type !== 'isolator' && (
                  <ComponentSection
                    title="Incomers"
                    components={item.incomers}
                    allComponents={components || []}
                    onAdd={() => openComponentSearch(itemIndex, 'incomer')}
                    onRemove={(idx) => removeComponent(itemIndex, 'incomer', idx)}
                    onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'incomer', idx, qty)}
                  />
                )}

                {(item.panel_type === 'lv_panel' || item.panel_type === 'changeover' ||
                  item.panel_type === 'synch_panel' || item.panel_type === 'custom') && (
                    <ComponentSection
                      title="Outgoings"
                      components={item.outgoings}
                      allComponents={components || []}
                      onAdd={() => openComponentSearch(itemIndex, 'outgoing')}
                      onRemove={(idx) => removeComponent(itemIndex, 'outgoing', idx)}
                      onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'outgoing', idx, qty)}
                    />
                  )}

                {item.panel_type && (
                  <ComponentSection
                    title="Accessories"
                    components={item.accessories}
                    allComponents={components || []}
                    onAdd={() => openComponentSearch(itemIndex, 'accessory')}
                    onRemove={(idx) => removeComponent(itemIndex, 'accessory', idx)}
                    onUpdateQuantity={(idx, qty) => updateComponentQuantity(itemIndex, 'accessory', idx, qty)}
                  />
                )}

                {/* ENCLOSURE */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Enclosure</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Dimensions (H x W x D in mm) *</Label>
                      <Input
                        required
                        value={item.enclosure_dimensions}
                        onChange={(e) => handleEnclosureDimensionsChange(itemIndex, e.target.value)}
                        placeholder="e.g., 2000 x 800 x 600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: Height x Width x Depth (e.g., 2000 x 800 x 600)
                      </p>
                    </div>
                    <div>
                      <Label>Enclosure Price (₦)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.enclosure_price}
                        onChange={(e) => updateItem(itemIndex, 'enclosure_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* BUSBAR SECTIONS */}
                {item.main_busbar || item.busbar_amperage ? (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Main Busbar (Auto-calculated)</h4>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm">Amperage</Label>
                          <Input
                            value={item.busbar_amperage || ''}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Quantity (meters)</Label>
                          <Input
                            value={item.main_busbar ? item.main_busbar.meters.toFixed(2) : '0.00'}
                            disabled
                            className="bg-gray-100"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            {item.enclosure_height > 0 && item.enclosure_height < 1600
                              ? '0.5m × 4'
                              : `${(item.enclosure_width / 1000).toFixed(2)}m × 4`
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm">Price/Meter (₦)</Label>
                          <Input
                            value= {item.main_busbar?.price_per_meter ? item.main_busbar.price_per_meter.toLocaleString() : '0'}
                            disabled
                            className="bg-gray-100"                          
                          />
                          <p className="text-xs text-gray-600 mt-1">Auto from DB</p>
                        </div>
                        <div>
                          <Label className="text-sm">Total (₦)</Label>
                          <Input
                            value={item.main_busbar?.total
                              ? item.main_busbar.total.toLocaleString()
                              : '0'}
                            disabled
                            className="bg-gray-100 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {item.link_busbars && item.link_busbars.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">Link Busbars (Auto-calculated for 400A+)</h4>
                    </div>
                    <div className="space-y-2">
                      {item.link_busbars.map((busbar, idx) => (
                        <div key={idx} className="bg-green-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm">Size</Label>
                              <Input value={busbar.size} disabled className="bg-gray-100 font-medium" />
                            </div>
                            <div>
                              <Label className="text-sm">Quantity (meters)</Label>
                              <Input value={busbar.meters.toFixed(2)} disabled className="bg-gray-100" />
                              <p className="text-xs text-gray-600 mt-1">1.5 × poles × qty</p>
                            </div>
                            <div>
                              <Label className="text-sm">Price/Meter (₦)</Label>
                              <Input value={busbar.price_per_meter.toLocaleString()} disabled className="bg-gray-100" />
                              <p className="text-xs text-gray-600 mt-1">Auto from DB</p>
                            </div>
                            <div>
                              <Label className="text-sm">Total (₦)</Label>
                              <Input value={busbar.total.toLocaleString()} disabled className="bg-gray-100 font-semibold" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CABLE SECTION */}
                {item.cables && item.cables.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold">Cables (Auto-calculated for ≤250A)</h4>
                    </div>
                    <div className="space-y-2">
                      {item.cables.map((cable, idx) => (
                        <div key={idx} className="bg-orange-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm">Size</Label>
                              <Input value={cable.size} disabled className="bg-gray-100 font-medium" />
                            </div>
                            <div>
                              <Label className="text-sm">Quantity (meters)</Label>
                              <Input value={cable.meters.toFixed(2)} disabled className="bg-gray-100" />
                              <p className="text-xs text-gray-600 mt-1">1.5 × poles × qty</p>
                            </div>
                            <div>
                              <Label className="text-sm">Price/Meter (₦)</Label>
                              <Input value={cable.price_per_meter.toLocaleString()} disabled className="bg-gray-100" />
                              <p className="text-xs text-gray-600 mt-1">Auto from DB</p>
                            </div>
                            <div>
                              <Label className="text-sm">Total (₦)</Label>
                              <Input value={cable.total.toLocaleString()} disabled className="bg-gray-100 font-semibold" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ITEM SUBTOTAL */}
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
  components: Array<{ component_id: string; quantity: number; price: number; amperage?: number; poles?: number }>;
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
                    {comp.amperage && comp.poles && (
                      <span className="ml-2 text-blue-600">
                        ({comp.amperage}A, {comp.poles}P)
                      </span>
                    )}
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