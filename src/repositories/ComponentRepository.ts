import { BaseRepository } from "./base/BaseRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Component,
  ComponentFilters,
  ComponentSortOptions,
  CreateComponentDTO,
  UpdateComponentDTO,
} from "@/types/component.types";

export class ComponentRepository extends BaseRepository<Component> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "components");
  }

  // ============================================================
  // 🔍 Advanced Filter Search
  // ============================================================
  async findWithFilters(
    filters: ComponentFilters = {},
    sort?: ComponentSortOptions
  ): Promise<Component[]> {
    let query = this.supabase.from(this.tableName).select("*");

    // 🔎 Search
    if (filters.search_query || filters.search) {
      const searchTerm = filters.search_query || filters.search;
      query = query.or(
        `item.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`
      );
    }

    // 🏷 Category
    if (filters.category) {
      query = Array.isArray(filters.category)
        ? query.in("category", filters.category)
        : query.eq("category", filters.category);
    }

    // 🏭 Manufacturer
    if (filters.manufacturer) {
      query = Array.isArray(filters.manufacturer)
        ? query.in("manufacturer", filters.manufacturer)
        : query.eq("manufacturer", filters.manufacturer);
    }

    // 💰 Price range
    if (filters.min_price !== undefined) {
      query = query.gte("price", filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte("price", filters.max_price);
    }

    // 🔌 Amperage
    if (filters.amperage) {
      query = Array.isArray(filters.amperage)
        ? query.in("amperage", filters.amperage)
        : query.eq("amperage", filters.amperage);
    }

    // 📌 Sorting
    if (sort) {
      query = query.order(sort.field, {
        ascending: sort.direction === "asc",
      });
    } else {
      query = query.order("item");
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching components: ${error.message}`);
    }

    return data as Component[];
  }

  // ============================================================
  // ➕ Create Component
  // ============================================================
  async createComponent(dto: CreateComponentDTO): Promise<Component> {
    return this.create(dto);
  }

  // ============================================================
  // ✏ Update Component
  // ============================================================
  async updateComponent(
    id: string,
    dto: UpdateComponentDTO
  ): Promise<Component> {
    return this.update(id, dto);
  }
}
