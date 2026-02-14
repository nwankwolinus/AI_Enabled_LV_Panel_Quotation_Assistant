import { SupabaseClient } from "@supabase/supabase-js";
import { QuotationRepository } from "./QuotationRepository";
import { ComponentRepository } from "./ComponentRepository";
import { ClientRepository } from "./ClientRepository";
import { AIPatternRepository } from "./AIPatternRepository";

export class RepositoryFactory {
    private static quotationRepo: QuotationRepository;
    private static componentRepo: ComponentRepository;
    private static clientRepo: ClientRepository;
    private static aiPatternRepo: AIPatternRepository;

    static initialize(supabase: SupabaseClient) {
        this.quotationRepo = new QuotationRepository(supabase);
        this.componentRepo = new ComponentRepository(supabase);
        this.clientRepo = new ClientRepository(supabase);
        this.aiPatternRepo = new AIPatternRepository(supabase);
    }

    static get quotations(): QuotationRepository {
        if (!this.quotationRepo) {
            throw new Error("RepositoryFactory not initialized");
        }
        return this.quotationRepo;
    }

    static get components(): ComponentRepository {
        if (!this.componentRepo) {
            throw new Error("RepositoryFactory not initialized");
        }
        return this.componentRepo;
    }

    static get clients(): ClientRepository {
        if (!this.clientRepo) {
            throw new Error("RepositoryFactory not initialized");
        }
        return this.clientRepo;
    }

    static get aiPatterns(): AIPatternRepository {
        if (!this.aiPatternRepo) {
            throw new Error("RepositoryFactory not initialized");
        }
        return this.aiPatternRepo;
    }
}