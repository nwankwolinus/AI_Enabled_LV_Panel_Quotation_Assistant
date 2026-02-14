export interface QuotationComponent {
    id: string;
    name: string;
    getPrice(): number;
    getQuantity(): number;
    getChildren(): QuotationComponent[];
    isComposite(): boolean;
    addChild(component: QuotationComponent): void;
    removeChild(id: string): void;
    findChild(id: string): QuotationComponent | null;
}