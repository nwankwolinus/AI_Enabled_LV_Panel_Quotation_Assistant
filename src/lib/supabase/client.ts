import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from "@/types/database.types";

export class SupabaseClientSingleton {
    private static instance: SupabaseClient<Database> | null = null;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): SupabaseClient<Database> {
        if (!this.instance) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabasekey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

            if (!supabaseUrl || !supabasekey) {
                throw new Error("Missing Supabase environment variables");
            }

            this.instance = createClient<Database>(supabaseUrl, supabasekey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                    }
                });
        }   

        return this.instance;
        }

        public static resetInstance() {
            this.instance = null;
        }
}
// Export convenience function
export const getSupabaseClient = () => SupabaseClientSingleton.getInstance();
