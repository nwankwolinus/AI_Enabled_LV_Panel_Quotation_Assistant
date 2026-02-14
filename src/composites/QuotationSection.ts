import { QuotationComponent } from './QuotationComponent';

export class QuotationSection implements QuotationComponent {
  private children: QuotationComponent[] = [];

  constructor(
    public id: string,
    public name: string,
    private discountPercent: number = 0
  ) {}

  getPrice(): number {
    const subtotal = this.children.reduce((sum, child) => sum + child.getPrice(), 0);
    const discount = subtotal * this.discountPercent;
    return subtotal - discount;
  }

  getQuantity(): number {
    return this.children.reduce((sum, child) => sum + child.getQuantity(), 0);
  }

  getChildren(): QuotationComponent[] {
    return [...this.children];
  }

  isComposite(): boolean {
    return true;
  }

  addChild(component: QuotationComponent): void {
    this.children.push(component);
  }

  removeChild(id: string): void {
    this.children = this.children.filter(child => child.id !== id);
  }

  findChild(id: string): QuotationComponent | null {
    for (const child of this.children) {
      if (child.id === id) {
        return child;
      }
      
      if (child.isComposite()) {
        const found = child.findChild(id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  setDiscount(percent: number): void {
    this.discountPercent = percent / 100;
  }

  getDiscount(): number {
    const subtotal = this.children.reduce((sum, child) => sum + child.getPrice(), 0);
    return subtotal * this.discountPercent;
  }

  getItemCount(): number {
    return this.children.reduce((count, child) => {
      if (child.isComposite()) {
        return count + (child as QuotationSection).getItemCount();
      }
      return count + 1;
    }, 0);
  }
}