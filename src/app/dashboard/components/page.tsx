// ============================================
// COMPONENTS PAGE
// File: src/app/dashboard/components/page.tsx
// ============================================

'use client';

import { mockComponents } from '@/lib/mock-data';
import { useState } from 'react';
import { DashboardLayout, ComponentsTable, Button, Input, Select, Card } from '@/components';
import { Plus, Search, Upload } from 'lucide-react';

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data
  const components = mockComponents;

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Components</h1>
            <p className="text-gray-600 mt-1">Manage your component library</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-ppl-navy">
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="ACB">ACB</option>
              <option value="MCCB">MCCB</option>
              <option value="MCB">MCB</option>
              <option value="Digital Meter">Digital Meter</option>
            </Select>
          </div>
        </Card>

        <ComponentsTable
          components={components}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(id) => console.log('Delete', id)}
        />
      </div>
    </DashboardLayout>
  );
}
