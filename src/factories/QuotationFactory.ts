import { Quotation, QuotationItem } from "@/types/quotation.types";
import { v4 as uuidv4 } from "uuid";

export interface QuotationTemplate {
    type: "standard" | "minimal" | "detailed" | "custom";
    includeImages: boolean;
    includeSpecs: boolean;
    includeWarranty: boolean;
    includeDelivery: boolean;
    includePaymentTerms: boolean;
    includeValidity: boolean;
    customSections?: string[]; // For custom templates, allow defining additional sections
}

export class QuotationFactory {
    static createFromTemplate(
        template: QuotationTemplate,
        clientId: string,
        userId: string
    ): Partial<Quotation> {
        const baseQuotation = {
            id: uuidv4(),
            client_id: clientId,
            created_by: userId,
            status: "draft" as const,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        switch (template.type) {
            case 'minimal':
                return {
                    ...baseQuotation,
                    title: "Quick Quote",
                    validity_days: 7,
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    delivery_timeline: "2-3 weeks",
                };
            case 'standard':
                return {
                    ...baseQuotation,
                    title: "Detailed Quotation",
                    validity_days: 30,
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    delivery_timeline: "4-6 weeks",
                    include_images: true,
                    include_warranty: template.includeWarranty,
                    warranty_period: "12 months",
                };
            case 'detailed':
                return {
                    ...baseQuotation,
                    title: "Detailed Quotation",
                    vailidity_days: 30,
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    delivery_timeline: "6-8 weeks",
                    include_images: true,
                    include_warranty: template.includeWarranty,
                    warranty_period: "12 months",

                };
            
            default:
                return baseQuotation; // For custom templates, return base and let caller add custom sections
        }
    }

    static createRevision(original: Quotation): Partial<Quotation> {
        return {
            ...original,
            id: uuidv4(),
            version: original.version + 1,
            status: "draft",
            parent_quote_id: original.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
    
}
    
