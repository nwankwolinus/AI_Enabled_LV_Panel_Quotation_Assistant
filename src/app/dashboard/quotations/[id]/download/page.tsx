/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useParams } from 'next/navigation';
import { useQuotation } from '@/hooks/useQuotations';
import { useQuoteItems } from '@/hooks/useQuoteItems';

export default function QuotationPDFPage() {
  const params = useParams();
  const quoteId = params.id as string;

  const { data: quote, isLoading: quoteLoading } = useQuotation(quoteId);
  const { data: items = [], isLoading: itemsLoading } = useQuoteItems(quoteId);
  
  const parseJsonField = (field: any): any[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };

  if (quoteLoading || itemsLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Loading quotation...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={{ padding: '40px' }}>
        <h2>Quote Not Found</h2>
      </div>
    );
  }

  const createdAt = new Date(quote.created_at || Date.now());
  const formatComponent = (comp: any) => {
    const d = comp.details;
   
    if (!d) return `${comp.quantity || 1}No.`;

    const qty = comp.quantity || 1;

    return `${qty}No${qty > 1 ? 's' : ''}. ${d.amperage || ''} ${d.poles || ''} ${d.category || ''} ${d.manufacturer || ''}`;
  };
  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 1.5cm 2cm;
        }
        
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .pdf-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .letterhead {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #000;
        }
        
        .company-name {
          color: #C00;
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 10pt;
          line-height: 1.3;
        }
        
        .quote-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 10pt;
        }
        
        .recipient {
          margin-bottom: 20px;
        }
        
        .recipient p {
          margin: 2px 0;
        }
        
        .subject {
          text-align: center;
          font-weight: bold;
          text-decoration: underline;
          margin: 20px 0;
          font-size: 11pt;
        }
        
        .intro {
          text-align: justify;
          margin-bottom: 20px;
        }
        
        .item-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .item-title {
          font-weight: bold;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        
        .item-row {
          display: flex;
          margin-bottom: 3px;
        }
        
        .item-label {
          font-weight: bold;
          min-width: 140px;
          flex-shrink: 0;
        }
        
        .item-value {
          flex: 1;
        }
        
        .component-list {
          margin-left: 0;
        }
        
        .component-item {
          margin-bottom: 2px;
        }
        
        .pricing {
          margin-top: 15px;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        
        .total-section {
          margin: 25px 0;
          padding: 10px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        
        .grand-total {
          font-weight: bold;
          font-size: 12pt;
        }
        
        .terms {
          margin-top: 25px;
          page-break-inside: avoid;
        }
        
        .terms-row {
          display: flex;
          margin-bottom: 5px;
        }
        
        .terms-label {
          font-weight: bold;
          min-width: 150px;
        }
        
        .closing {
          margin-top: 30px;
        }
        
        .signature-block {
          margin-top: 30px;
        }
        
        .signature-block p {
          margin: 3px 0;
        }
        
        .print-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #C00;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        
        .print-button:hover {
          background: #A00;
        }
      `}</style>

      <div className="pdf-container">
        {/* Letterhead */}
        <div className="letterhead">
          <div className="company-name">POWER PROJECTS LIMITED</div>
          <div className="company-info">
            40, NNPC Road, Ejigbo, Lagos Tel: 08078792350.<br />
            info@powerprojectsltd.com, www.powerprojectsltd.com
          </div>
        </div>

        {/* Quote Number and Date */}
        <div className="quote-header">
          <div>{quote.quote_number}</div>
          <div>
            {createdAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Recipient */}
        <div className="recipient">
          <p><strong>The Managing Director</strong></p>
          <p>{quote.client_name}</p>
          {quote.client_address && <p>{quote.client_address}</p>}
          <p>&nbsp;</p>
          <p>{quote.attention ? `Dear ${quote.attention},` : 'Dear Sir/Madam,'}</p>
        </div>

        {/* Subject */}
        <div className="subject">
          {quote.project_name?.toUpperCase() || 'ASSEMBLY OF LOW VOLTAGE PANELS'}
        </div>

        {/* Introduction */}
        <div className="intro">
          Further to your enquiry on the above, we are pleased to quote for the assembly and supply of the 
          above-mentioned low voltage panels. These panels will be assembled in a free-standing/wall-mounted 
          sheet steel enclosures. Details are as shown below:
        </div>

        {/* Items */}
        {items.map((item, index) => {
          const incomers = parseJsonField(item.incomers);
          const outgoings = parseJsonField(item.outgoings);
          const accessories = parseJsonField(item.accessories);

          return (
            <div key={item.id} className="item-section">
              <div className="item-title">
                ITEM {index + 1}: {item.panel_name}
              </div>

              {/* Incomer */}
              {incomers.length > 0 && (
                <div className="item-row">
                  <div className="item-label">Incomer:</div>
                  <div className="item-value">
                    <div className="component-list">
                      {incomers.map((inc: any, idx: number) => (
                        <div key={idx} className="component-item">
                          {formatComponent(inc)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Busbar */}
              {item.busbar_amperage && (
                <div className="item-row">
                  <div className="item-label">Busbar:</div>
                  <div className="item-value">
                    Set of {item.busbar_amperage} 4pole air insulated copper Busbar with earth terminals
                  </div>
                </div>
              )}

              {/* Outgoings */}
              {outgoings.length > 0 && (
                <div className="item-row">
                  <div className="item-label">Outgoing:</div>
                  <div className="item-value">
                    <div className="component-list">
                      {outgoings.map((out: any, idx: number) => (
                        <div key={idx} className="component-item">
                          {formatComponent(out)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Control/Instruments */}
              {accessories.length > 0 && (
                <div className="item-row">
                  <div className="item-label">Control/Instrument:</div>
                  <div className="item-value">
                    <div className="component-list">
                      {accessories.map((acc: any, idx: number) => (
                        <div key={idx} className="component-item">
                          {acc.quantity}No{acc.quantity > 1 ? 's' : ''}. {acc.description || acc.item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Enclosure */}
              {item.enclosure_dimensions && (
                <div className="item-row">
                  <div className="item-label">Enclosure size:</div>
                  <div className="item-value">{item.enclosure_dimensions} (HxWxD)</div>
                </div>
              )}

              {/* Pricing */}
              <div className="pricing">
                <div className="price-row">
                  <span style={{ fontWeight: 'bold' }}>Unit Price:</span>
                  <span>N{(item.subtotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Total Section */}
        <div className="total-section">
          <div className="price-row">
            <span><strong>Total Price (Items 1 to {items.length}):</strong></span>
            <span><strong>N{(quote.total || 0).toLocaleString()}</strong></span>
          </div>
          <div className="price-row">
            <span><strong>Add 7.5% VAT:</strong></span>
            <span><strong>N{(quote.vat || 0).toLocaleString()}</strong></span>
          </div>
          <div className="price-row grand-total">
            <span>Grand Total:</span>
            <span>N{(quote.grand_total || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="terms">
          {quote.payment_terms && (
            <div className="terms-row">
              <div className="terms-label">Payment Terms:</div>
              <div>{quote.payment_terms}</div>
            </div>
          )}
          {quote.execution_period && (
            <div className="terms-row">
              <div className="terms-label">Execution Period:</div>
              <div>{quote.execution_period}</div>
            </div>
          )}
          {quote.validity_period && (
            <div className="terms-row">
              <div className="terms-label">Validity Period:</div>
              <div>{quote.validity_period}</div>
            </div>
          )}
        </div>

        {/* Closing */}
        <div className="closing">
          <p>Thanks for your continued patronage.</p>
          <p>&nbsp;</p>
          <p>Yours faithfully,</p>
        </div>

        {/* Signature */}
        <div className="signature-block">
          <p><strong>For: POWER PROJECTS LTD</strong></p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>_____________________</p>
          <p><strong>Sales Representative</strong></p>
          <p>08037482059 / 08078792309</p>
        </div>

        {/* Print Button */}
        <button className="print-button no-print" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
      </div>
    </>
  );
}