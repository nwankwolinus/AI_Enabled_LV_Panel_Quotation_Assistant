import { BaseRepository } from "./base/BaseRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Client,
  ClientWithRelations,
  ClientFilters,
  ClientSortOptions,
  CreateClientDTO,
  UpdateClientDTO,
} from "@/types/client.types";

export class ClientRepository extends BaseRepository<Client> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "clients");
  }

  // ============================================================
  // 🔍 Find with Filters
  // ============================================================
  async findWithFilters(
    filters: ClientFilters = {},
    sort?: ClientSortOptions
  ): Promise<Client[]> {
    let query = this.supabase.from(this.tableName).select("*");

    // 🔎 Search
    if (filters.search_query) {
      query = query.or(
        `name.ilike.%${filters.search_query}%,email.ilike.%${filters.search_query}%`
      );
    }

    // 📅 Date range
    if (filters.created_from) {
      query = query.gte("created_at", filters.created_from);
    }
    if (filters.created_to) {
      query = query.lte("created_at", filters.created_to);
    }

    // 📌 Sorting
    if (sort) {
      query = query.order(sort.field, {
        ascending: sort.direction === "asc",
      });
    } else {
      query = query.order("name");
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching clients: ${error.message}`);
    }

    return data as Client[];
  }

  // ============================================================
  // 👥 Get Client With Quotes
  // ============================================================
  async findWithRelations(id: string): Promise<ClientWithRelations | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        quotes:quotations(*),
        created_by_user:users!created_by(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching client with relations: ${error.message}`);
    }

    return data as ClientWithRelations;
  }

  // ============================================================
  // ➕ Create Client
  // ============================================================
  async createClient(dto: CreateClientDTO): Promise<Client> {
    return this.create(dto);
  }

  // ============================================================
  // ✏ Update Client
  // ============================================================
  async updateClient(id: string, dto: UpdateClientDTO): Promise<Client> {
    return this.update(id, dto);
  }
}
