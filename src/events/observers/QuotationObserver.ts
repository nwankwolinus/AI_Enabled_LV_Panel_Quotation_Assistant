import { eventBus } from '../EventBus';
import { EventType  } from '../types';
import { RepositoryFactory } from '@/src/repositories';
import { logger } from '@/services/LoggerService';

export class QuotationObserver {
    constructor() {
        this.setupListeners();
    }

    private setupListeners(): void {
        // Update AI patterns when quotation is created
        eventBus.subscribe(EventType.QUOTATION_CREATED, async (payload) => {
            try {
                await this.updateAIPatterns(payload.quotation);
                logger.info('AI patterns updated for new quotation', { quotationId: payload.quotation.id, });
            } catch (error) {
                logger.error('Failed to update AI patterns', error as Error, { quotationId: payload.quotation.id, });
            }
        });

        // Log quotation updates
        eventBus.subscribe(EventType.QUOTATION_UPDATED, async (payload) => {
            logger.info('Quotation updated', { 
                quotationId: payload.quotation.id, 
                changes: payload.changes,
                userId: payload.userId,
             });
        });
    }

    private async updateAIPatterns(quotation: Quotation): Promise<void> {
        // Extract patterns from quotation
        // Update quote_patterns table for AI Learning
        // This would be implemented based on my AI logic
    }
}