// ============================================
// VIEW QUOTATION PAGE
// File: src/app/dashboard/quotations/[id]/page.tsx
// ============================================

'use client';

import { use } from 'react';
import {
  DashboardLayout,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components';
import { ArrowLeft, Download, Send, Edit, Copy, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ViewQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  // Mock data - replace with actual data from your API
  const quotation = {
    id: id,
    quote_number: 'PPL/2024/001',
    project_name: 'Factory Main Distribution Panel',
    client_name: 'ABC Industries Limited',
    client_address: '123 Industrial Avenue, Ikeja, Lagos',
    attention: 'Mr. John Doe',
    status: 'pending',
    total: 25000000,
    vat: 1875000,
    grand_total: 26875000,
    validity_period: '30 days',
    payment_terms: '50% upfront, 50% on delivery',
    execution_period: '4-6 weeks',
    notes: 'Special requirements for outdoor installation',
    created_at: '2024-01-15T10:00:00Z',
    items: [
      {
        id: '1',
        panel_name: 'Main Incomer Panel',
        subtotal: 15000000,
      },
      {
        id: '2',
        panel_name: 'Distribution Board A',
        subtotal: 6000000,
      },
      {
        id: '3',
        panel_name: 'Distribution Board B',
        subtotal: 4000000,
      },
    ],
  };

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quotations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{quotation.quote_number}</h1>
                <StatusBadge status={quotation.status} />
              </div>
              <p className="text-gray-600 mt-1">{quotation.project_name}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Download PDF">
              <Download className="w-4 h-4" />
            </Button>
            {quotation.status === 'draft' && (
              <Button variant="outline" size="icon" title="Send to Client">
                <Send className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" title="Edit">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" title="Duplicate">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" title="Delete" className="text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Client & Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Client Name" value={quotation.client_name} />
              <InfoRow label="Address" value={quotation.client_address} />
              <InfoRow label="Attention" value={quotation.attention} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Created Date" value={formatDate(quotation.created_at)} />
              <InfoRow label="Validity" value={quotation.validity_period} />
              <InfoRow label="Payment Terms" value={quotation.payment_terms} />
              <InfoRow label="Execution Period" value={quotation.execution_period} />
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Panel Name</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.panel_name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(quotation.total)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">VAT (7.5%)</span>
                <span className="font-medium">{formatCurrency(quotation.vat)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl">
                <span className="font-semibold">Grand Total</span>
                <span className="font-bold text-ppl-navy">
                  {formatCurrency(quotation.grand_total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {quotation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{quotation.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
}