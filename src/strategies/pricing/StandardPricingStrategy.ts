import { IPricingStrategy, PricingResult } from './IPricingStrategy';
import { QuotationItem } from '@/types/quotation.types';

export class StandardPricingStrategy implements IPricingStrategy {
  private readonly TAX_RATE = 0.075; // 7.5% VAT

  getName(): string {
    return 'Standard Pricing';
  }

  calculate(items: QuotationItem[]): PricingResult {
    const breakdown = items.map(item => ({
      item,
      originalPrice: item.total_price,
      discountedPrice: item.total_price,
      discount: 0,
    }));

    const subtotal = breakdown.reduce((sum, b) => sum + b.discountedPrice, 0);
    const discount = 0;
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
}