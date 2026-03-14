// ============================================
// SEND QUOTE MODAL
// File: src/components/modals/SendQuoteModal.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label, Textarea, Card } from '@/components';
import { X, Mail, Send } from 'lucide-react';
import { useQuotation } from '@/hooks/useQuotations';

interface SendQuoteModalProps {
  isOpen: boolean;
  quoteId: string | null;
  onSend: (email: string, message?: string) => void;
  onCancel: () => void;
  isSending?: boolean;
}

export default function SendQuoteModal({
  isOpen,
  quoteId,
  onSend,
  onCancel,
  isSending = false,
}: SendQuoteModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Fetch quote details to get client email
  const { data: quote } = useQuotation(quoteId || '');

  // Pre-fill email when quote loads
  useEffect(() => {
  if (quote?.client?.email) {
    setEmail(quote.client.email);
  }

  if (quote) {
    setMessage(
      `Dear ${quote.client_name || 'Client'},\n\n` +
      `Please find attached the quotation ${quote.quote_number} for ${quote.project_name}.\n\n` +
      `If you have any questions or require any clarifications, please don't hesitate to contact us.\n\n` +
      `Best regards,\n` +
      `Power Projects Limited`
    );
  }
}, [quote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(email, message);
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Send Quotation</h2>
              {quote && (
                <p className="text-sm text-gray-600">
                  {quote.quote_number} - {quote.project_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Email will be sent with PDF attachment
            </p>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={8}
              disabled={isSending}
            />
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              What will be sent:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• PDF quotation document</li>
              <li>• Your custom message (if provided)</li>
              <li>• Company contact information</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-ppl-navy"
              disabled={isSending || !email}
            >
              {isSending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Quotation
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}