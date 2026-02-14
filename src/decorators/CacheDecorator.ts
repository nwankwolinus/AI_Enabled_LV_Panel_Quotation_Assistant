import { IRepository } from "@/repositories/IRepository";
import { cacheManager } from "@/services/CacheManager";
import { logger } from "@/services/LoggerService";

export class CacheDecorator<T extends { id: string }> implements IRepository<T> {
    constructor(
        private readonly repository: IRepository<T>,
        private readonly cachePrefix: string,
        private readonly ttl: number = 5 * 60 * 1000 // 5 minutes default
    ) {}

    async findAll(filters?: Record<string, any>): Promise<T[]> {
        const cachekey = `${this.cachePrefix}:all:${JSON.stringify(filters || {})}`
        
        // Try to get from cache
        const cached = cacheManager.get<T[]>(cacheKey);
        if (cached) {
            logger.debug(`Cache hit`, { cacheKey });
            return cached;
        }

        // Get from repository
        const result = await this.repository.findAll(filters);

        // Store in cache
        cacheManager.set(cachekey, result, this.ttl);
        logger.debug(`Cache set`, { cacheKey });

        return result;
    }

    async findById(id: string): Promise<T | null> {
        const cacheKey = `${this.cachePrefix}:${id}`;

        const cached = cacheManager.get<T>(cacheKey);
        if (cached) {
            logger.debug(`Cache hit`, { cacheKey });
            return cached;
        }

        const result = await this.repository.findById(id);
       
        if (result) {
            cacheManager.set(cacheKey, result, this.ttl);
            logger.debug(`Cache miss - stored`, { cacheKey });
        }
        return result;
    }

    async create(entity: Partial<T>): Promise<T> {
        const result = await this.repository.create(entity);

        // Invalidate list caches
        this.invalidateListCaches();

        // Cache the new entity
        const cachekey = `${this.cachePrefix}:${result.id}`;
        cacheManager.set(cachekey, result, this.ttl);

        return result;
    }

    async update(id: string, entity: Partial<T>): Promise<T> {
        const result = await this.repository.update(id, entity);

        // Invalidate caches
        const cacheKey - `${this.cachePrefix}:${id}`;
        cacheManager.delete(cacheKey);
        this.invalidateListCaches();

        return result;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);

        // Invalidate caches
        const cacheKey = `${this.cachePrefix}:${id}`;
        cacheManager.delete(cacheKey);
        this.invalidateListCaches();
    }

    async count(filters?: Record<string, any>): Promise<number> {
        const cacheKey = `${this.cachePrefix}:count:${JSON.stringify(filters || {})}`;

        const cached = cacheManager.get<number>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        const result = await this.repository.count(filters);
        cacheManager.set(cacheKey, result, this.ttl);
       
        return result;
    }

    private invalidateListCaches(): void {
        cacheManager.invalidateByPattern(new RegExp(`^${this.cachePrefix}:all:`));
        cacheManager.invalidateByPattern(new RegExp(`^${this.cachePrefix}:count:`));
    }
}

