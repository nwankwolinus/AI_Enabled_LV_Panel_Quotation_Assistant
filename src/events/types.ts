import { Quotation, QuotationItem } from '@/types/quotation.types';

export enum EventType {
    // Quotation events
    QUOTATION_CREATED = 'quotation_created',
    QUOTATION_UPDATED = 'quotation_updated',
    QUOTATION_DELETED = 'quotation_deleted',
    QUOTATION_SUBMITTED = 'quotation_submitted',
    QUOTATION_APPROVED = 'quotation_approved',
    QUOTATION_REJECTED = 'quotation_rejected',

    // Item events
    ITEM_ADDED = 'item:added',
    ITEM_UPDATED = 'item:updated',
    ITEM_REMOVED = 'item:removed',

    // User events
    USER_LOGIN = 'user:login',
    USER_LOGOUT = 'user:logout',

    // System events
    CACHE_INVALIDATED = 'cache:invalidated',
    ERROR_OCCURRED = 'error:occurred',
}

export interface EventPayload {
    [EventType.QUOTATION_CREATED]: { quotation: Quotation; userId: string };
    [EventType.QUOTATION_UPDATED]: { quotation: Quotation; userId: string; changes: Partial<Quotation>  };
    [EventType.QUOTATION_DELETED]: { quotationId: string; userId: string };
    [EventType.QUOTATION_SUBMITTED]: { quotation: Quotation; userId: string };
    [EventType.QUOTATION_APPROVED]: { quotation: Quotation; approverId: string };
    [EventType.QUOTATION_REJECTED]: { quotation: Quotation; userId: string; reason: string };

    [EventType.ITEM_ADDED]: { item: QuotationItem; quotationId: string };
    [EventType.ITEM_UPDATED]: { item: QuotationItem; quotationId: string };
    [EventType.ITEM_REMOVED]: { itemId: string; quotationId: string };

    [EventType.USER_LOGIN]: { userId: string; email: string };
    [EventType.USER_LOGOUT]: { userId: string };

    [EventType.CACHE_INVALIDATED]: { Keys: string[] };
    [EventType.ERROR_OCCURRED]: { error: Error; context: Record<string, any> };
}