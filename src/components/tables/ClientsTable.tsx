// ============================================
// CLIENTS TABLE
// File: src/components/tables/ClientsTable.tsx
// ============================================

'use client';

import { Client } from '@/types/client.types';
import { Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Button, Card } from '@/components';

interface ClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClientsTable({
  clients,
  isLoading,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ppl-navy"></div>
          <span className="ml-3 text-gray-600">Loading clients...</span>
        </div>
      </Card>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No clients found</p>
          <p className="text-sm mt-1">Add your first client to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {client.name}
                </h3>
                {client.contact_person && (
                  <p className="text-sm text-gray-600 mt-1">
                    {client.contact_person}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`mailto:${client.email}`}
                    className="hover:text-ppl-navy truncate"
                  >
                    {client.email}
                  </a>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`tel:${client.phone}`}
                    className="hover:text-ppl-navy"
                  >
                    {client.phone}
                  </a>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(client.id)}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(client.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}