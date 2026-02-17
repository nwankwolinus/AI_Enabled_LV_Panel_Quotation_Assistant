// ============================================
// CLIENTS PAGE
// File: src/app/dashboard/clients/page.tsx
// ============================================

'use client';

import { DashboardLayout, Card, Button, Input } from '@/components';
import { Plus, Search } from 'lucide-react';

export default function ClientsPage() {
  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client relationships</p>
          </div>
          <Button className="bg-ppl-navy">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search clients..." className="pl-10" />
          </div>
        </Card>

        <Card className="p-8 text-center text-gray-500">
          <p>Client management interface coming soon...</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
