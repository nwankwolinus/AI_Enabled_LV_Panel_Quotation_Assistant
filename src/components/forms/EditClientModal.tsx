// ============================================
// EDIT CLIENT MODAL
// File: src/components/forms/EditClientModal.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label, Textarea, Card } from '@/components';
import { X } from 'lucide-react';
import { useClient, useUpdateClient } from '@/hooks/useClients';
import { UpdateClientDTO } from '@/types/client.types';

interface EditClientModalProps {
  isOpen: boolean;
  clientId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditClientModal({ 
  isOpen, 
  clientId, 
  onClose, 
  onSuccess 
}: EditClientModalProps) {
  const { data: client, isLoading } = useClient(clientId || '');
  const updateClient = useUpdateClient();
  
  const [formData, setFormData] = useState<UpdateClientDTO>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });

  // Load client data when available
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        contact_person: client.contact_person || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    
    try {
      await updateClient.mutateAsync({ id: clientId, data: formData });
      onSuccess();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Client</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ppl-navy mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading client...</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., ABC Industries Ltd"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter company address..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +234 XXX XXX XXXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., contact@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-ppl-navy"
                disabled={updateClient.isPending}
              >
                {updateClient.isPending ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}