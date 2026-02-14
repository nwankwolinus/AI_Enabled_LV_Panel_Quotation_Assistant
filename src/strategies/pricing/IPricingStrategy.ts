import { QuoteItem} from "@/types/quotation.types";

export interface PricingResult {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    breakdown: {
        item: QuoteItem;
        originalPrice: number;
        discountedPrice: number;
        discount: number;
    }[];
}

export interface IPricingStrategy {
    calculate(items: QuoteItem[]): PricingResult;
    getName(): string;
}

