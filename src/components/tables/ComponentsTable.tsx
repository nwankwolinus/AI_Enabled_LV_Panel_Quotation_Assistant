// ============================================
// COMPONENTS TABLE
// File: src/components/tables/ComponentsTable.tsx
// ============================================

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import { Component } from '@/types/component.types';
import { formatCurrency } from '@/lib/utils';

interface ComponentsTableProps {
  components: Component[];
  isLoading?: boolean;
  onEdit?: (componentId: string) => void;
  onDelete?: (componentId: string) => void;
  onSelect?: (component: Component) => void;
  selectable?: boolean;
}

export default function ComponentsTable({
  components,
  isLoading,
  onEdit,
  onDelete,
  onSelect,
  selectable,
}: ComponentsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ppl-navy"></div>
          <span className="ml-3 text-gray-600">Loading components...</span>
        </div>
      </Card>
    );
  }

  if (!components || components.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No components found</p>
          <p className="text-sm mt-1">Add components to your library to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Manufacturer</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amperage</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => (
            <TableRow key={component.id}>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate">{component.item}</div>
              </TableCell>
              
              <TableCell>{component.manufacturer}</TableCell>
              
              <TableCell>{component.model}</TableCell>
              
              <TableCell>
                {component.category && (
                  <Badge variant="outline" className="text-xs">
                    {component.category}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                {component.amperage || '-'}
              </TableCell>
              
              <TableCell>{component.vendor}</TableCell>
              
              <TableCell className="text-right font-medium">
                {formatCurrency(component.price, component.currency || 'NGN')}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {selectable && onSelect && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelect(component)}
                      title="Select Component"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(component.id)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(component.id)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
