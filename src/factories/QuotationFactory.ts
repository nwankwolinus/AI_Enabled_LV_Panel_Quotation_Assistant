import { Quote, QuoteItem } from "@/types/quotation.types";
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
    ): Partial<Quote> {
        const baseQuotation = {
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
                    project_name: "Quick Quote",
                    validity_period: "7 days",
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    execution_period: "2-3 weeks",
                };
            case 'standard':
                return {
                    ...baseQuotation,
                    project_name: "Detailed Quotation",
                    validity_period: "30 days",
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    execution_period: "4-6 weeks",
                    include_images: template.includeImages,
                    include_warranty: template.includeWarranty,
                    warranty_period: "12 months",
                };
            case 'detailed':
                return {
                    ...baseQuotation,
                    project_name: "Detailed Quotation",
                    validity_period: "30 days",
                    payment_terms: "80% upfront, 20% on completion before delivery",
                    execution_period: "6-8 weeks",
                    include_images: template.includeImages,
                    include_warranty: template.includeWarranty,
                    warranty_period: "12 months",

                };
            
            default:
                return baseQuotation; // For custom templates, return base and let caller add custom sections
        }
    }

    static createRevision(original: Quote): Partial<Quote> {
        return {
            client_id: original.client_id,
            client_name: original.client_name,
            client_address: original.client_address,
            attention: original.attention,
            project_name: original.project_name,
            payment_terms: original.payment_terms,
            validity_period: original.validity_period,
            execution_period: original.execution_period,
            notes: original.notes,
            version: (original.version || 1) + 1,
            status: "draft",
            parent_quote_id: original.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
    
}
    
