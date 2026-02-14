import { IRepository } from `@/repositories/base/IRepository`;
import { logger } from '@/services/LoggerService';

export class LoggingDecorator<T extends { id: string }> implements IRepository<T> {
    constructor(
        private readonly repository: IRepository<T>,
        private readonly entityName: string
    ) {}

    async findAll(filters?: Record<string, any>): Promise<T[]> {
        const startTime = Date.now();
        logger.info(`Finding all ${this.entityName}`, { filters });
        try {
          const result = await this.repository.findAll(filters);
          const duration = Date.now() - startTime;

          logger.info(`Found ${result.length} ${this.entityName}`, {
            count: result.length,
            duration: `${duration}ms`,
            filters,
          });

          return result;
        } catch (error) {
          logger.error(`Error finding ${this.entityName}`, error as Error, { filters });
          throw error;
        }
    }

    async findById(id: string): Promise<T | null> {
        const startTime = Date.now();
        logger.info(`Finding ${this.entityName} by id`, { id });

        try {
          const result = await this.repository.findById(id);
          const duration = Date.now() - startTime;

          logger.info(`Found ${this.entityName}`, {
            id, 
            found: !!result,
            duration: `${duration}ms`,
          });

          return result;
        } catch (error) {
          logger.error(`Error finding ${this.entityName} by id`, 
          error as Error, { id });
          throw error;
        }
    }

    async create(entity: Partial<T>): Promise<T> {
        const startTime = Date.now();
        logger.info(`Creating ${this.entityName}`, { entity });

        try {
            const result = await this.repository.create(entity);
            const duration = Date.now() - startTime;

            logger.info(`Created ${this.entityName}`, {
              id: result.id,
              duration: `${duration}ms`,
            });

            return result
        }   catch (error) {
            logger.error(`Error creating ${this.entityName}`, error as Error, { entity });
            throw error;
        }
    }

    async update(id: string, entity: Partial<T>): Promise<T> {
      const startTime = Date.now();
      logger.info(`Updating ${this.entityName}`, { id, changes: entity });

      try {
        const result = await this.repository.update(id, entity);
        const duration = Date.now() - startTime;

        logger.info(`Updated ${this.entityName}`, {
          id,
          duration: `${duration}ms`,
        });

        return result;
      } catch (error) {
        logger.error(`Error updating ${this.entityName}`, error as Error, { id, entity });
        throw error;
      }
    }

    async delete(id: string): Promise<void> {
      const startTime = Date.now();
      logger.info(`Deleting ${this.entityName}`, { id });

      try {
        await this.repository.delete(id);
        const duration = Date.now() - startTime;

        logger.info(`Deleted ${this.entityName}`, {
          id,
          duration: `${duration}ms`,
        });
      } catch (error) {
        logger.error(`Error deleting ${this.entityName}`, error as Error, { id });
        throw error;
      }
    }

    async count(filters?: Record<string, any>): Promise<number> {
      const startTime = Date.now();
      logger.info(`Counting ${this.entityName}`, { filters });

      try {
        const result = await this.repository.count(filters);
        const duration = Date.now() - startTime;

        logger.info(`Counted ${this.entityName}`, {
          count: result,
          duration: `${duration}ms`,
          filters,
        });

        return result;
      } catch (error) {
        logger.error(`Error counting ${this.entityName}`, error as Error, { filters });
        throw error;
      }
    }
}