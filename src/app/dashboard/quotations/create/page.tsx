// ============================================
// CREATE QUOTATION PAGE
// File: src/app/dashboard/quotations/create/page.tsx
// ============================================

'use client';

import { mockComponents } from '@/lib/mock-data';
import { useState } from 'react';
import {
  DashboardLayout,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  AIRecommendations,
  ComponentsTable,
} from '@/components';
import { Save, Send, ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ComponentRecommendationInput } from '@/types/ai-learning.types';

export default function CreateQuotationPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    attention: '',
    validityPeriod: '30 days',
    paymentTerms: '50% upfront, 50% on delivery',
    executionPeriod: '4-6 weeks',
    notes: '',
  });

  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);
  const [showComponentModal, setShowComponentModal] = useState(false);

  // Mock components - Replace with actual data from your API
  const availableComponents = mockComponents;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create quotation:', formData, selectedComponents);
    alert('Quotation created successfully! (This is a demo)');
  };

  const handleSaveDraft = () => {
    console.log('Save as draft');
    alert('Draft saved! (This is a demo)');
  };

  const handleAddComponent = (component: any) => {
    // Check if component already added
    const alreadyAdded = selectedComponents.some(c => c.id === component.id);
    if (alreadyAdded) {
      alert('Component already added!');
      return;
    }

    setSelectedComponents([...selectedComponents, { ...component, quantity: 1 }]);
    setShowComponentModal(false);
  };

  const handleRemoveComponent = (componentId: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.id !== componentId));
  };

  const handleQuantityChange = (componentId: string, quantity: number) => {
    setSelectedComponents(
      selectedComponents.map(c =>
        c.id === componentId ? { ...c, quantity: Math.max(1, quantity) } : c
      )
    );
  };

  const calculateTotal = () => {
    return selectedComponents.reduce((sum, component) => {
      return sum + (component.price * component.quantity);
    }, 0);
  };

  // AI Recommendations Input
  const aiInput: ComponentRecommendationInput = {
    existing_components: selectedComponents.map(c => ({
      component_id: c.id,
    })),
    panel_configuration: {
      total_amperage: '4000A',
    },
  };

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quotations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Quotation</h1>
            <p className="text-gray-600 mt-1">Fill in the details to create a new quotation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Select or enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g., Factory Main Distribution Panel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="attention">Attention</Label>
                  <Input
                    id="attention"
                    value={formData.attention}
                    onChange={(e) => setFormData({ ...formData, attention: e.target.value })}
                    placeholder="Contact person"
                  />
                </div>
                <div>
                  <Label htmlFor="validityPeriod">Validity Period</Label>
                  <Select
                    id="validityPeriod"
                    value={formData.validityPeriod}
                    onChange={(e) => setFormData({ ...formData, validityPeriod: e.target.value })}
                  >
                    <option value="7 days">7 days</option>
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="executionPeriod">Execution Period</Label>
                <Input
                  id="executionPeriod"
                  value={formData.executionPeriod}
                  onChange={(e) => setFormData({ ...formData, executionPeriod: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {selectedComponents.length > 0 && (
            <AIRecommendations
              input={aiInput}
              onAcceptRecommendation={(componentId) => {
                console.log('Add component:', componentId);
                // Find component and add it
                const component = availableComponents.find(c => c.id === componentId);
                if (component) {
                  handleAddComponent(component);
                }
              }}
            />
          )}

          {/* Components Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Components</CardTitle>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowComponentModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Components
              </Button>
            </CardHeader>
            <CardContent>
              {selectedComponents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No components added yet.</p>
                  <p className="text-sm mt-1">Click "Add Components" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedComponents.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{component.item}</h4>
                        <p className="text-sm text-gray-600">
                          {component.manufacturer} - {component.model}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`qty-${component.id}`} className="text-sm">Qty:</Label>
                          <Input
                            id={`qty-${component.id}`}
                            type="number"
                            min="1"
                            value={component.quantity}
                            onChange={(e) => handleQuantityChange(component.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className="font-medium">
                            ₦{(component.price * component.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₦{component.price.toLocaleString()} each
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveComponent(component.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Subtotal</span>
                      <span className="text-ppl-navy">₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/dashboard/quotations">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit" className="bg-ppl-navy">
              <Send className="w-4 h-4 mr-2" />
              Create Quotation
            </Button>
          </div>
        </form>
      </div>

      {/* Component Selection Modal */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select Components</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComponentModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ComponentsTable
                components={availableComponents}
                onSelect={handleAddComponent}
                selectable={true}
              />
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setShowComponentModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}