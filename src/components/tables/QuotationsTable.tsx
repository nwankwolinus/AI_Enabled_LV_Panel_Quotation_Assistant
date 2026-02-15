// ============================================
// QUOTATIONS TABLE COMPONENT
// File: src/components/tables/QuotationsTable.tsx
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { FileText, Edit, Trash2, Copy, Download, Send } from 'lucide-react';
import { Quote } from '@/types/quotation.types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface QuotationsTableProps {
  quotes: Quote[];
  isLoading?: boolean;
  onEdit?: (quoteId: string) => void;
  onDelete?: (quoteId: string) => void;
  onDuplicate?: (quoteId: string) => void;
  onDownload?: (quoteId: string) => void;
  onSend?: (quoteId: string) => void;
}

export default function QuotationsTable({
  quotes,
  isLoading,
  onEdit,
  onDelete,
  onDuplicate,
  onDownload,
  onSend,
}: QuotationsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ppl-navy"></div>
          <span className="ml-3 text-gray-600">Loading quotations...</span>
        </div>
      </Card>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No quotations found</p>
          <p className="text-sm mt-1">Create your first quotation to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quote #</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/quotations/${quote.id}`}
                  className="text-ppl-navy hover:underline"
                >
                  {quote.quote_number}
                </Link>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs truncate">{quote.project_name}</div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs truncate">{quote.client_name}</div>
              </TableCell>
              
              <TableCell>
                <StatusBadge status={quote.status} />
              </TableCell>
              
              <TableCell className="text-right font-medium">
                {quote.grand_total ? formatCurrency(quote.grand_total) : '-'}
              </TableCell>
              
              <TableCell className="text-sm text-gray-500">
                {quote.created_at ? formatDate(quote.created_at) : '-'}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/quotations/${quote.id}`}>
                    <Button variant="ghost" size="icon" title="View">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(quote.id)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onDuplicate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(quote.id)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(quote.id)}
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onSend && quote.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSend(quote.id)}
                      title="Send to Client"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(quote.id)}
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

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: any }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'warning' },
      approved: { label: 'Approved', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      sent: { label: 'Sent', variant: 'info' },
    };

    return configs[status] || { label: status, variant: 'secondary' };
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
