import { Quotation, QuotationItem } from "@/types/quotation.types";
import { v4 as uuidv4 } from "uuid";

export class QuotationBuilder {
    private quotation: Partial<Quotation>;
    private items: QuotationItem[] = [];

    constructor(clientId: string, userId: string) {
        this.quotation = {
            id: uuidv4(),
            client_id: clientId,
            created_by: userId,
            status: "draft",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    public setTitle(title: string): this {
        this.quotation.quote_title = title;
        return this;
    }

    public setQuoteNumber(quoteNumber: string): this {
        this.quotation.quote_number = quoteNumber;
        return this;
    }

    public setValidity(days: number): this {
        this.quotation.validity_days = days;
        return this;
    }

    public setPaymentTerms(terms: string): this {
        this.quotation.payment_terms = terms;
        return this;
    }

    public setDeliveryTimeline(timeline: string): this {
        this.quotation.delivery_timeline = timeline;
        return this;
    }

    public setWarranty(period: string): this {
        this.quotation.warranty_period = period;
        this.quotation.include_warranty = true;
        return this;
    }
    
    public includeSpecifications(include: boolean): this {
        this.quotation.include_specifications = include;
        return this;
    }

    public includeImages(include: boolean = true): this {
        this.quotation.include_images = include;
        return this;
    }

    public addItem(componentId: string, quantity: number, unitPrice: number): this {
        const item: QuotationItem = {
            id: uuidv4(),
            quotation_id: this.quotation.id!,
            component_id: componentId,
            quantity,
            unit_price: unitPrice,
            total_price: quantity * unitPrice,
            created_at: new Date().toISOString(),

        };
        this.items.push(item);
        return this;
    }

    public additems(items: Array<{ componentId: string; quantity: number; unitPrice: number }>): this {
        items.forEach(item => {
            this.addItem(item.componentId, item.quantity, item.unitPrice);
        });
        return this;
    }

    public addItems(items: Array<{ componentId: string; quantity: number; unitPrice: number }>): this {
        items.forEach(item => {
            this.addItem(item.componentId, item.quantity, item.unitPrice);
        })
        return this;
    }

    public setTermsAndConditions(terms: string): this {
        this.quotation.terms_and_conditions = terms;
        return this;
    }

    public build(): { quotation: Quotation; items: QuotationItem[] } {
        // Validate required fields
        if (!this.quotation.quote_title) {
            throw new Error("Quote title is required");
        }

        if (this.items.length === 0) {
            throw new Error("Quotation must have at least one item");
        }

        // Calculate totals
        const subtotal = this.items.reduce((sum, item) => sum + item.total_price, 0);
        this.quotation.subtotal = subtotal;

        return {
            quotation: this.quotation as Quotation,
            items: this.items,
        };
    }

    public reset(): this {
        this.items = [];
        return this;
    }

}