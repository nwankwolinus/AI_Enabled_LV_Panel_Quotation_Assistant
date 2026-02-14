import { BaseRepository } from "./base/BaseRepository";
import { Quote, QuoteWithRelations } from "@/types/quotation.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Original_Surfer } from "next/font/google";

export class QuotationRepository extends BaseRepository<Quote> {
    constructor(supabase: SupabaseClient) {
        super(supabase, "quotations");
    }

    // custom method: Find quotations with all relations
    async findWithRelations(id: string): Promise<QuoteWithRelations | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select(`
                *,
                client:clients(*),
                items:quotation_items(
                    *,
                    component:components(*)
                ),
                created_by_user:users!created_by(*)
            `)
            .eq("id", id)
            .single();
        
            if (error) {
                if (error.code === "PGRST116") return null;
                throw new Error(`Error fetching quotation with relations: ${error.message}`);
            }

            return data as QuoteWithRelations;
        }

    // custom method: Find by client
    async findByClient(clientId: string): Promise<Quote[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*, client:clients(*)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
    
        if (error) throw new Error(`Error fetching quotations by client: ${error.message}`);
        return data as Quote[];
       }

    // custom method: Find recent quotations
    async findRecent(limit: number = 10): Promise<Quote[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select("*, client:clients(*)")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`Error fetching recent quotations: ${error.message}`);
        return data as Quote[];
    }   

    // Custom method: Search quotations
    async search(query: string): Promise<Quote[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select("*, client:clients(*)")
            .or(`quote_number.ilike.%${query}%,title.ilike.%${query}%`)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`Error searching quotations: ${error.message}`);
        return data as Quote[];
        }

    // Custom method: Get quotations by status
    async findByStatus(status: string): Promise<Quote[]> {
        const {data, error } = await this.supabase
            .from(this.tableName)
            .select('*, client:clients(*)')
            .eq('status', status)
            .order('created_at', { ascending: false });
            
        if (error) throw new Error(`Error fetching quotations by status: ${error.message}`);
        return data as Quote[];
    }

    // Custom method: Clone quotation
    async clone(id: string, newData: Partial<Quote>): Promise<Quote>
    {
        // Get original quotation with items
        const original = await this.findWithRelations(id);
        if (!original) throw new Error("Quotation not found");

        // Create new quoatation
        const { items, ...quoatationData } = original;
        const newQuotation = await this.create({
            ...quoatationData,
            ...newData,
            version: 1,
            quote_number: undefined, // will be auto-generated
        });

        // Clone items
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                ...item,
                quotation_id: newQuotation.id,
                id: undefined, // Will be auto-generated
            }));

            await this.supabase
              .from("quotation_items")
              .insert(itemsToInsert);   
        }

        return newQuotation;
    }
}
