import { IPricingStrategy, PricingResult } from './IPricingStrategy';
import { QuoteItem } from '@/types/quotation.types';

export class BulkDiscountStrategy implements IPricingStrategy {
    private readonly TAX_RATE = 0.075;
    private readonly DISCOUNT_TIERS = [
        { minAmount: 10000000, discountPercent: 0.15 }, // 15% for 10M+
        { minAmount: 5000000, discountPercent: 0.10 },  // 10% for 5M+
        { minAmount: 2000000, discountPercent: 0.05 },  // 5% for 2M+
    ];

    getName(): string {
        return 'Bulk Discount Strategy';
    }

    calculate(items: QuoteItem[]): PricingResult {
        // Use 'subtotal' from QuoteItem
        const subtotalBeforeDiscount = items.reduce(
            (sum, item) => sum + (item.subtotal ?? 0),
            0
        );

        // Determine discount percentage based on total amount
        const discountPercent = this.getDiscountPercent(subtotalBeforeDiscount);

        const breakdown = items.map(item => {
            const price = item.subtotal ?? 0;
            const itemDiscount = price * discountPercent;

            return {
                item,
                originalPrice: price,
                discountedPrice: price - itemDiscount,
                discount: itemDiscount,
            };
        });

        const subtotal = breakdown.reduce((sum, b) => sum + b.discountedPrice, 0);
        const discount = subtotalBeforeDiscount - subtotal;
        const tax = subtotal * this.TAX_RATE;
        const total = subtotal + tax;

        return {
            subtotal,
            discount,
            tax,
            total,
            breakdown,
        };
    }

    private getDiscountPercent(amount: number): number {
        for (const tier of this.DISCOUNT_TIERS) {
            if (amount >= tier.minAmount) {
                return tier.discountPercent;
            }
        }
        return 0;
    }
}
