import { EventType, EventPayload } from './types';

type EventHandler<T = any> = (payload: T) => void | Promise<void>;

export class EventBus {
    private static instance: EventBus | null = null;
    private listeners: Map<EventType, Set<EventHandler>> = new Map();

    private constructor() {}

    public static getInstance(): EventBus {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        return this.instance;
    }

    public subscribe<T extends EventType>(
        event: T,
        handler: EventHandler<EventPayload[T]>
    ): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(handler);
        }
    }

    public async publish<T extends EventType>(
        event: T,
        payload: EventPayload[T]
    ): Promise<void> {
        const handlers = this.listeners.get(event);

        if (!handlers || handlers.size === 0) {
            return;
        }

        // Execute all handlers
        const promises = Array.from(handlers).map(handler => Promise.resolve(handler(payload))
    );

    await Promise.allSettled(promises);
    }

    public unsubscribeAll(event?: EventType): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    public getListenerCount(event: EventType): number {
        return this.listeners.get(event)?.size || 0;
    }
}

// Export convenience instance
export const eventBus = EventBus.getInstance();