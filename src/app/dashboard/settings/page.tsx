// ============================================
// SETTINGS PAGE
// File: src/app/dashboard/settings/page.tsx
// ============================================

'use client';

import { DashboardLayout, Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@/components';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Power Projects Limited" />
            </div>
            <div>
              <Label htmlFor="companyAddress">Address</Label>
              <Input id="companyAddress" defaultValue="Lagos, Nigeria" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Phone</Label>
                <Input id="companyPhone" defaultValue="+234 XXX XXX XXXX" />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email</Label>
                <Input id="companyEmail" defaultValue="info@powerprojects.ng" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Quotation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validityPeriod">Default Validity Period</Label>
              <Input id="validityPeriod" defaultValue="30 days" />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Default Payment Terms</Label>
              <Input id="paymentTerms" defaultValue="50% upfront, 50% on delivery" />
            </div>
            <div>
              <Label htmlFor="vatRate">VAT Rate (%)</Label>
              <Input id="vatRate" type="number" defaultValue="7.5" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-ppl-navy">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
