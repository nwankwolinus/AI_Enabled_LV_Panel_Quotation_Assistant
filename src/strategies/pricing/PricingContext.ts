import { IPricingStrategy } from "./IPricingStrategy";
import { QuotationItem } from "@/types/quotation.types";
import { StandardPricingStrategy } from "./StandardPricingStrategy";
import { BulkDiscountStrategy } from "./BulkDiscountStrategy";
import { CustomPricingStrategy } from "./CustomPricingStrategy";

export type PricingStrategyType = 'standard' | 'bulk_discount' | 'custom';

export class PricingContext {
    private strategy: IPricingStrategy;

    constructor(strategyType: PricingStrategyType = 'standard') {
        this.strategy = this.createStrategy(strategyType);
    }

    private createStrategy(type: PricingStrategyType): IPricingStrategy {
        switch (type) {
            case 'bulk_discount':
                return new BulkDiscountStrategy();
            case 'custom':
                return new CustomPricingStrategy();
            case 'standard':
            default:
                return new StandardPricingStrategy();
        }
    }

    public setStrategy(strategyType: PricingStrategyType): void {
        this.strategy = this.createStrategy(strategyType);
    }

    public calculate(items: QuotationItem[]) {
        return this.strategy.calculate(items);
    }

    public getStrategyName(): string {
        return this.strategy.getName();
    }
}