import { SupabaseClient } from '@supabase/supabase-js'; 
import { IRepository } from './IRepository';

export abstract class BaseRepository<T extends { id: string }>
implements IRepository<T> {
    constructor(
        protected readonly supabase: SupabaseClient,
        protected readonly tableName: string
    ) {}


    async findAll(filters?: Record<string, any>): Promise<T[]> {
        let query = this.supabase
        .from(this.tableName)
        .select('*');

        if (filters) {
            Object.entries(filters).forEach(([Key, value]) => {
                query = query.eq(Key, value);
            });
        }
        const { data, error } = await query;
        if (error) throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
        return data as T[];
    }

    async findById(id: string): Promise<T | null> {
        const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw new Error(`Error fetching ${this.tableName} by ID: ${error.message}`);
        return data as T;
    }

    async create(entity: Partial<T>): Promise<T> {
        const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(entity)
        .select('*')
        .single();

        if (error) throw new Error(`Error creating ${this.tableName}: ${error.message}`);
        return data as T;
    }

    async update(id: string, entity: Partial<T>): Promise<T> {
        const { data, error } = await this.supabase
        .from(this.tableName)
        .update(entity)
        .eq('id', id)
        .select('*')
        .single();

        if (error) throw new Error(`Error updating ${this.tableName}: ${error.message}`);
        return data as T;

    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

        if (error) throw new Error(`Error deleting ${this.tableName}: ${error.message}`);
   
    }

    async count(filters?: Record<string, any>): Promise<number> {
        let query = this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true });
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        const { count, error } = await query;
        if (error) throw new Error(`Error counting ${this.tableName}: ${error.message}`);
        return count || 0;
    }


}
