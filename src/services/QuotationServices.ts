import { QuotationBuilder } from '@/builders/QuotationBuilder';
import { RepositoryFactory } from '@/repositories';
import { PricingContext } from '@/strategies/pricing/PricingContext';
import { eventBus } from '@/events/EventBus';
import { EventType } from '../events/types';
import { logger } from '@/services/LoggerService';
import { MiddlewareChain } from '../middleware/middlewareChains';
import { AuthMiddleware } from '../middleware/auth/AuthMiddleware';
import { RoleMiddleware } from '../middleware/auth/RoleMiddleware';
import { ValidationMiddleware } from '../middleware/validation/ValidationMiddleware';
import { createQuotationSchema } from '@/lib/validations/quotation.schema';

export class QuotationService {
  private static instance: QuotationService;

  private constructor() {}

  public static getInstance(): QuotationService {
    if (!this.instance) {
      this.instance = new QuotationService();
    }
    return this.instance;
  }

  async createQuotation(data: {
    clientId: string;
    userId: string;
    title: string;
    items: Array<{
      componentId: string;
      quantity: number;
      unitPrice: number;
    }>;
    pricingStrategy?: 'standard' | 'bulk_discount' | 'custom';
  }) {
    // Step 1: Middleware validation
    const middleware = new MiddlewareChain()
      .use(new AuthMiddleware())
      .use(new RoleMiddleware(['sales_manager', 'sales_engineer']))
      .use(new ValidationMiddleware(createQuotationSchema, 'quotationData'));

    const middlewareResult = await middleware.execute({
      quotationData: data,
    });

    if (!middlewareResult.success) {
      throw new Error(middlewareResult.error);
    }

    try {
      // Step 2: Build quotation using Builder pattern
      const builder = new QuotationBuilder(data.clientId, data.userId);

      builder
        .setTitle(data.title)
        .setValidity(30)
        .setPaymentTerms('50% upfront, 50% on delivery')
        .setDeliveryTimeline('4-6 weeks')
        .setWarranty('12 months')
        .includeSpecifications()
        .includeImages();

      // Add items
      data.items.forEach(item => {
        builder.addItem(item.componentId, item.quantity, item.unitPrice);
      });

      const { quotation, items } = builder.build();

      // Step 3: Calculate pricing using Strategy pattern
      const pricingContext = new PricingContext(data.pricingStrategy || 'standard');
      const pricing = pricingContext.calculate(items);

      quotation.subtotal = pricing.subtotal;
      quotation.total = pricing.total;

      // Step 4: Save to database using Repository pattern
      const savedQuotation = await RepositoryFactory.quotations.create(quotation);

      // Save items
      const itemsWithQuotationId = items.map(item => ({
        ...item,
        quotation_id: savedQuotation.id,
      }));

      await Promise.all(
        itemsWithQuotationId.map(item =>
          RepositoryFactory.quotations.supabase
            .from('quotation_items')
            .insert(item)
        )
      );

      // Step 5: Publish event using Observer pattern
      await eventBus.publish(EventType.QUOTATION_CREATED, {
        quotation: savedQuotation,
        userId: data.userId,
      });

      // Step 6: Log action
      logger.info('Quotation created', {
        quotationId: savedQuotation.id,
        userId: data.userId,
        itemCount: items.length,
        total: pricing.total,
      });

      return {
        quotation: savedQuotation,
        items: itemsWithQuotationId,
        pricing,
      };
    } catch (error) {
      logger.error('Failed to create quotation', error as Error, { data });
      throw error;
    }
  }
}