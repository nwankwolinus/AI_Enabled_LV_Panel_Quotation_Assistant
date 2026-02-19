import { BaseRepository } from "./base/BaseRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  QuotePattern,
  PatternType,
  ComponentPairingPatternData,
  isComponentPairingPatternData,
} from "@/types/ai-learning.types";

export class AIPatternRepository extends BaseRepository<QuotePattern> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "quote_patterns");
  }

  // ============================================================
  // 🤖 Find patterns by type
  // ============================================================
  async findByType(patternType: PatternType | string): Promise<QuotePattern[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("pattern_type", patternType)
      .order("confidence_score", { ascending: false });

    if (error) {
      throw new Error(`Error fetching patterns by type: ${error.message}`);
    }

    return data as QuotePattern[];
  }

  // ============================================================
  // 🔍 Find component pairing patterns for a component
  // ============================================================
  async findComponentPairings(
    componentId: string
  ): Promise<ComponentPairingPatternData[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("pattern_type", PatternType.COMPONENT_PAIRING);

    if (error) {
      throw new Error(`Error fetching component pairing patterns: ${error.message}`);
    }

    // ✅ SAFE parsing using your type guard
    const relevant: ComponentPairingPatternData[] = [];

    for (const pattern of data ?? []) {
      const pd = pattern.pattern_data;

      if (isComponentPairingPatternData(pd)) {
        if (pd.main_component.id === componentId) {
          relevant.push(pd);
        }
      }
    }

    return relevant;
  }

  // ============================================================
  // 📊 Get top patterns by confidence
  // ============================================================
  async findTopPatterns(limit: number = 20): Promise<QuotePattern[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .order("confidence_score", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching top patterns: ${error.message}`);
    }

    return data as QuotePattern[];
  }

  // ============================================================
  // 🔥 Increment usage count (learning loop)
  // ============================================================
  async incrementUsage(patternId: string): Promise<void> {
    const { error } = await this.supabase.rpc("increment_pattern_usage", {
      pattern_id: patternId,
    });

    if (error) {
      throw new Error(`Error incrementing pattern usage: ${error.message}`);
    }
  }

  // ============================================================
  // 🧠 Update confidence score
  // ============================================================
  async updateConfidence(
    patternId: string,
    confidence: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        confidence_score: confidence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patternId);

    if (error) {
      throw new Error(`Error updating pattern confidence: ${error.message}`);
    }
  }
}
