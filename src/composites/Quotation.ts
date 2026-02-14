import { QuotationComponent } from './QuotationComponent';
import { QuotationSection } from './QuotationSection';

export class QuotationComposite implements QuotationComponent {
  private sections: QuotationSection[] = [];
  private taxRate: number = 0.075; // 7.5% VAT

  constructor(
    public id: string,
    public name: string,
    public clientId: string
  ) {}

  getPrice(): number {
    const subtotal = this.getSubtotal();
    const tax = subtotal * this.taxRate;
    return subtotal + tax;
  }

  getSubtotal(): number {
    return this.sections.reduce((sum, section) => sum + section.getPrice(), 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getQuantity(): number {
    return this.sections.reduce((sum, section) => sum + section.getQuantity(), 0);
  }

  getChildren(): QuotationComponent[] {
    return [...this.sections];
  }

  isComposite(): boolean {
    return true;
  }

  addChild(component: QuotationComponent): void {
    if (!(component instanceof QuotationSection)) {
      throw new Error('Can only add QuotationSection to Quotation');
    }
    this.sections.push(component);
  }

  removeChild(id: string): void {
    this.sections = this.sections.filter(section => section.id !== id);
  }

  findChild(id: string): QuotationComponent | null {
    for (const section of this.sections) {
      if (section.id === id) {
        return section;
      }
      
      const found = section.findChild(id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  getSectionCount(): number {
    return this.sections.length;
  }

  getTotalItemCount(): number {
    return this.sections.reduce((count, section) => count + section.getItemCount(), 0);
  }

  getPricingBreakdown() {
    return {
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      total: this.getPrice(),
      sections: this.sections.map(section => ({
        id: section.id,
        name: section.name,
        subtotal: section.getPrice() + section.getDiscount(),
        discount: section.getDiscount(),
        total: section.getPrice(),
        items: section.getItemCount(),
      })),
    };
  }
}