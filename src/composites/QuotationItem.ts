import { QuotationComponent } from "./QuotationComponent";

export class QuotationItem implements QuotationComponent {
    constructor(
        public id: string,
        public name: string,
        private quantity: number,
        private unitPrice: number,
        public componentType: string
    ) {}

    getPrice(): number {
        return this.quantity * this.unitPrice;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getChildren(): QuotationComponent[] {
        return [];
    }

    isComposite(): boolean {
        return false;
    }

    addChild(component: QuotationComponent): void {
        throw new Error("Cannot add child to a leaf node");
    }

    removeChild(id: string): void {
        throw new Error("Cannot remove child from a leaf node");
    }

    findChild(id: string): QuotationComponent | null {
        return null;
    }

    setQuantity(quantity: number): void {
        this.quantity = quantity;
    }

    setUnitPrice(price: number): void {
        this.unitPrice = price;
    }

    getUnitPrice(): number {
        return this.unitPrice;
    }
}

