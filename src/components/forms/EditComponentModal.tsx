// ============================================
// EDIT COMPONENT MODAL
// File: src/components/forms/EditComponentModal.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  Textarea,
  Card,
} from '@/components';
import { X } from 'lucide-react';
import { useUpdateComponent, useComponent } from '@/hooks/useComponents';
import { CreateComponentDTO } from '@/types/component.types';

interface EditComponentModalProps {
  isOpen: boolean;
  componentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditComponentModal({ 
  isOpen, 
  componentId,
  onClose, 
  onSuccess 
}: EditComponentModalProps) {
  const { data: existingComponent, isLoading } = useComponent(componentId || '');
  const updateComponent = useUpdateComponent();
  
  const [formData, setFormData] = useState<CreateComponentDTO>({
    vendor: '',
    item: '',
    model: '',
    manufacturer: '',
    price: 0,
    currency: 'NGN',
    amperage: '',
    poles: '',
    type: '',
    specification: '',
    category: '',
  });

  // Populate form when component data loads
  useEffect(() => {
    if (existingComponent) {
      setFormData({
        vendor: existingComponent.vendor || '',
        item: existingComponent.item || '',
        model: existingComponent.model || '',
        manufacturer: existingComponent.manufacturer || '',
        price: existingComponent.price || 0,
        currency: existingComponent.currency || 'NGN',
        amperage: existingComponent.amperage || '',
        poles: existingComponent.poles || '',
        type: existingComponent.type || '',
        specification: existingComponent.specification || '',
        category: existingComponent.category || '',
      });
    }
  }, [existingComponent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!componentId) return;
    
    try {
      await updateComponent.mutateAsync({ id: componentId, data: formData });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !componentId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Component</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ppl-navy mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading component...</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item">Item Description *</Label>
                  <Input
                    id="item"
                    required
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    placeholder="e.g., ACB Masterpact MTZ3"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    <option value="ACB">ACB (Air Circuit Breaker)</option>
                    <option value="MCCB">MCCB (Molded Case Circuit Breaker)</option>
                    <option value="MCB">MCB (Miniature Circuit Breaker)</option>
                    <option value="RCCB">RCCB (Residual Current Circuit Breaker)</option>
                    <option value="Contactor">Contactor</option>
                    <option value="Digital Meter">Digital Meter</option>
                    <option value="Capacitor Bank">Capacitor Bank</option>
                    <option value="COMAP">COMAP (Control & Monitoring)</option>
                    <option value="Busbar">Busbar</option>
                    <option value="Cable">Cable</option>
                    <option value="Panel Enclosure">Panel Enclosure</option>
                    <option value="Accessories">Accessories</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Select
                    id="manufacturer"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  >
                    <option value="">Select Manufacturer</option>
                    <option value="Schneider Electric">Schneider Electric</option>
                    <option value="ABB">ABB</option>
                    <option value="Siemens">Siemens</option>
                    <option value="Eaton">Eaton</option>
                    <option value="General Electric">General Electric</option>
                    <option value="Legrand">Legrand</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="LS Electric">LS Electric</option>
                    <option value="Hager">Hager</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., MTZ3 4000A"
                  />
                </div>
              </div>
            </div>

            {/* Electrical Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Electrical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amperage">Amperage</Label>
                  <Select
                    id="amperage"
                    value={formData.amperage}
                    onChange={(e) => setFormData({ ...formData, amperage: e.target.value })}
                  >
                    <option value="">Select Amperage</option>
                    <option value="16A">16A</option>
                    <option value="25A">25A</option>
                    <option value="32A">32A</option>
                    <option value="40A">40A</option>
                    <option value="63A">63A</option>
                    <option value="100A">100A</option>
                    <option value="125A">125A</option>
                    <option value="160A">160A</option>
                    <option value="200A">200A</option>
                    <option value="250A">250A</option>
                    <option value="400A">400A</option>
                    <option value="630A">630A</option>
                    <option value="800A">800A</option>
                    <option value="1000A">1000A</option>
                    <option value="1250A">1250A</option>
                    <option value="1600A">1600A</option>
                    <option value="2000A">2000A</option>
                    <option value="2500A">2500A</option>
                    <option value="3200A">3200A</option>
                    <option value="4000A">4000A</option>
                    <option value="5000A">5000A</option>
                    <option value="6300A">6300A</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="poles">Poles</Label>
                  <Select
                    id="poles"
                    value={formData.poles}
                    onChange={(e) => setFormData({ ...formData, poles: e.target.value })}
                  >
                    <option value="">Select Poles</option>
                    <option value="1P">1P (Single Pole)</option>
                    <option value="2P">2P (Two Pole)</option>
                    <option value="3P">3P (Three Pole)</option>
                    <option value="4P">4P (Four Pole)</option>
                    <option value="3P+N">3P+N</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Fixed, Draw-out"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Vendor */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing & Vendor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    id="currency"
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="NGN">NGN (Nigerian Naira)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g., Schneider Nigeria"
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <Label htmlFor="specification">Technical Specifications</Label>
              <Textarea
                id="specification"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                placeholder="Enter detailed technical specifications..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-ppl-navy"
                disabled={updateComponent.isPending}
              >
                {updateComponent.isPending ? 'Updating...' : 'Update Component'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}