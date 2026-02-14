import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, QuoteWithRelations } from '@/types/quotation.types';

export class PDFDocumentBuilder {
  private doc: jsPDF;
  private yPosition: number = 20;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  public addHeader(logoUrl?: string): this {
    // Add company logo
    if (logoUrl) {
      this.doc.addImage(logoUrl, 'PNG', this.margins.left, this.yPosition, 40, 20);
    }

    // Company name and details
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 138); // PPL Navy
    this.doc.text('POWER PROJECTS LIMITED', this.pageWidth / 2, this.yPosition + 10, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 25;
    this.doc.text('3A Mole Road, Ikoyi, Lagos', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 5;
    this.doc.text('Tel: +234 806 704 2742 | Email: info@powerprojectsltd.com', this.pageWidth / 2, this.yPosition, { align: 'center' });
    
    this.yPosition += 15;
    this.addHorizontalLine();
    this.yPosition += 10;

    return this;
  }

  public addQuotationInfo(quotation: Quote): this {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('QUOTATION', this.pageWidth / 2, this.yPosition, { align: 'center' });
    
    this.yPosition += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Two columns: left for quote details, right for client details
    const leftX = this.margins.left;
    const rightX = this.pageWidth / 2 + 10;

    // Left column: Quote details
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quote Number:', leftX, this.yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(quotation.quote_number || 'N/A', leftX + 35, this.yPosition);
    
    this.yPosition += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Date:', leftX, this.yPosition);
    this.doc.setFont('helvetica', 'normal');
    const createdAt = quotation.created_at
      ? new Date(quotation.created_at).toLocaleDateString()
      : 'N/A';

    this.doc.text(createdAt, leftX + 35, this.yPosition);

    
    this.yPosition += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Valid Until:', leftX, this.yPosition);
    this.doc.setFont('helvetica', 'normal');
    const validUntil = new Date(quotation.created_at ?? Date.now());

    function getValidityDays(value: string | null): number {
      const parsed = Number(value);
        return isNaN(parsed) ? 30 : parsed;
    }
    const validityDays = getValidityDays(quotation.validity_period);
    validUntil.setDate(validUntil.getDate() + validityDays);
    
    this.doc.text(validUntil.toLocaleDateString(), leftX + 35, this.yPosition);

    // Reset yPosition for right column
    this.yPosition -= 12;

    // Right column: Client details (will be populated if client data is passed)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Prepared For:', rightX, this.yPosition);
    
    this.yPosition += 15;
    return this;
  }

  public addClientInfo(client: any): this {
    const rightX = this.pageWidth / 2 + 10;
    this.yPosition -= 9; // Align with "Prepared For"

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(client.name || 'N/A', rightX, this.yPosition + 6);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    if (client.address) {
      this.doc.text(client.address, rightX, this.yPosition + 11);
    }
    if (client.contact_person) {
      this.doc.text(`Attn: ${client.contact_person}`, rightX, this.yPosition + 16);
    }

    this.doc.setFontSize(10);
    this.yPosition += 25;
    return this;
  }

  public addItemsTable(items: any[]): this {
    const tableData = items.map((item, index) => [
      index + 1,
      item.component?.name || item.description || 'N/A',
      item.quantity || 1,
      this.formatCurrency(item.unit_price || 0),
      this.formatCurrency(item.total_price || 0),
    ]);

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['S/N', 'Description', 'Qty', 'Unit Price (₦)', 'Total (₦)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // PPL Navy
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    return this;
  }

  public addPricingSummary(pricing: {
    subtotal: number;
    discount?: number;
    tax: number;
    total: number;
  }): this {
    const rightAlign = this.pageWidth - this.margins.right - 50;
    const valueAlign = this.pageWidth - this.margins.right;

    this.doc.setFontSize(10);
    
    // Subtotal
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Subtotal:', rightAlign, this.yPosition);
    this.doc.text(this.formatCurrency(pricing.subtotal), valueAlign, this.yPosition, { align: 'right' });
    
    this.yPosition += 6;

    // Discount (if applicable)
    if (pricing.discount && pricing.discount > 0) {
      this.doc.text('Discount:', rightAlign, this.yPosition);
      this.doc.text(`-${this.formatCurrency(pricing.discount)}`, valueAlign, this.yPosition, { align: 'right' });
      this.yPosition += 6;
    }

    // Tax
    this.doc.text('VAT (7.5%):', rightAlign, this.yPosition);
    this.doc.text(this.formatCurrency(pricing.tax), valueAlign, this.yPosition, { align: 'right' });
    
    this.yPosition += 8;
    this.addHorizontalLine(rightAlign - 5, this.pageWidth - this.margins.right);
    this.yPosition += 2;

    // Total
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('TOTAL:', rightAlign, this.yPosition);
    this.doc.text(this.formatCurrency(pricing.total), valueAlign, this.yPosition, { align: 'right' });
    
    this.yPosition += 15;
    return this;
  }

  public addTermsAndConditions(terms: string): this {
    this.checkPageBreak(30);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Terms and Conditions', this.margins.left, this.yPosition);
    
    this.yPosition += 7;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    const splitTerms = this.doc.splitTextToSize(terms, this.pageWidth - this.margins.left - this.margins.right);
    this.doc.text(splitTerms, this.margins.left, this.yPosition);
    
    this.yPosition += splitTerms.length * 5;
    return this;
  }

  public addPaymentTerms(terms: string): this {
    this.checkPageBreak(20);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Payment Terms:', this.margins.left, this.yPosition);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(terms, this.margins.left + 35, this.yPosition);
    
    this.yPosition += 10;
    return this;
  }

  public addFooter(): this {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    
    this.doc.text(
      'This quotation is valid for the period specified and subject to our terms and conditions.',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    this.doc.text(
      `Page ${this.doc.internal.pages.length - 1}`,
      this.pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );

    return this;
  }

  public addSignatureSection(): this {
    this.checkPageBreak(40);
    
    this.yPosition += 20;

    const leftX = this.margins.left + 20;
    const rightX = this.pageWidth - this.margins.right - 60;

    // Prepared by
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Prepared by:', leftX, this.yPosition);
    this.yPosition += 15;
    this.doc.line(leftX, this.yPosition, leftX + 50, this.yPosition);
    this.yPosition += 5;
    this.doc.setFontSize(8);
    this.doc.text('Signature & Date', leftX, this.yPosition);

    // Reset for right column
    this.yPosition -= 20;

    // Approved by
    this.doc.setFontSize(9);
    this.doc.text('Approved by:', rightX, this.yPosition);
    this.yPosition += 15;
    this.doc.line(rightX, this.yPosition, rightX + 50, this.yPosition);
    this.yPosition += 5;
    this.doc.setFontSize(8);
    this.doc.text('Signature & Date', rightX, this.yPosition);

    return this;
  }

  private addHorizontalLine(startX?: number, endX?: number): void {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(
      startX || this.margins.left,
      this.yPosition,
      endX || this.pageWidth - this.margins.right,
      this.yPosition
    );
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.margins.bottom) {
      this.doc.addPage();
      this.yPosition = this.margins.top;
    }
  }

  public build(): jsPDF {
    this.addFooter();
    return this.doc;
  }

  public save(filename: string): void {
    this.build().save(filename);
  }

  public getBlob(): Promise<Blob> {
    return new Promise((resolve) => {
      const blob = this.build().output('blob');
      resolve(blob);
    });
  }

  public getDataUri(): string {
    return this.build().output('datauristring');
  }
}