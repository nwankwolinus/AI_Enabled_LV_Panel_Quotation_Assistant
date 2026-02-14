export interface IRepository<T> {
    findAll(filters?: Record<string, any>): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(entity: Partial<T>): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    count(filters?: Record<string, any>): Promise<number>;
}