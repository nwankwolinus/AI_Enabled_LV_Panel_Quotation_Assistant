// ============================================
// AI LEARNING SERVICE
// File: src/services/AILearningService.ts
// ============================================

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database.types';
import {
  ComponentRecommendationInput,
  ComponentRecommendationOutput,
  ComponentPairingRecommendation,
  PricingOptimizationRecommendation,
  QuotePattern,
  RecommendationType,
  PatternType,
  MetricType,
  CONFIDENCE_THRESHOLDS,
  PATTERN_MIN_USAGE,
  isComponentPairingPatternData,
  ComponentPairingPatternData,
  ClientPreferencePatternData,
  isClientPreferencePatternData,
  isPricingPatternData,
  PricingPatternData,
} from '@/types/ai-learning.types';
import { logger } from './LoggerService';

export class AILearningService {
  private static instance: AILearningService;

  private constructor(private readonly supabase: SupabaseClient<Database>) {}

  public static getInstance(supabase: SupabaseClient<Database>): AILearningService {
    if (!this.instance) {
      this.instance = new AILearningService(supabase);
    }
    return this.instance;
  }

  // ============================================
  // AUTH GUARD
  // ============================================

  /**
   * Check if user is authenticated before touching the DB.
   * This prevents 401 errors when the service is called before login.
   */
  private async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  // ============================================
  // RECOMMENDATION GENERATION
  // ============================================

  async getComponentRecommendations(
    input: ComponentRecommendationInput
  ): Promise<ComponentRecommendationOutput> {
    const empty: ComponentRecommendationOutput = {
      recommended_components: [],
      related_accessories: [],
      total_estimated_price: 0,
    };

    // Guard: nothing to work with
    if (!input.existing_components?.length) return empty;

    // Guard: not authenticated → silently skip, no error
    if (!(await this.isAuthenticated())) return empty;

    try {
      logger.info('Generating component recommendations');

      const existingIds = input.existing_components
        .map(c => c.component_id)
        .filter(Boolean);

      // Run all fetches concurrently, each fails safely
      const [patterns, pairings, pricingInsights] = await Promise.all([
        this.getRelevantPatterns().catch(() => []),
        this.getComponentPairings(existingIds),
        this.getPricingInsights(input.panel_configuration?.total_amperage),
      ]);

      const clientPreferences = input.client_id
        ? await this.getClientPreferences(input.client_id).catch(() => null)
        : null;

      const recommendations = this.buildRecommendations(
        patterns,
        clientPreferences,
        pairings,
        pricingInsights,
        input
      );

      // Fire-and-forget: save record without blocking
      this.saveRecommendation({
        recommendation_type: RecommendationType.COMPONENT_SUGGESTION,
        input_data: input as unknown as Json,
        recommendation_data: recommendations as unknown as Json,
      }).catch(err =>
        logger.warn('Could not persist recommendation', { error: String(err) })
      );

      return recommendations;
    } catch (error) {
      logger.error('Error generating component recommendations', error);
      return empty;
    }
  }

  async getComponentPairings(componentIds: string[]): Promise<ComponentPairingRecommendation[]> {
    if (!componentIds?.length) return [];
    if (!(await this.isAuthenticated())) return [];

    try {
      const { data: patterns, error } = await this.supabase
        .from('quote_patterns')
        .select('*')
        .eq('pattern_type', PatternType.COMPONENT_PAIRING)
        .gte('confidence_score', CONFIDENCE_THRESHOLDS.MINIMUM);

      if (error) {
        logger.warn('Could not fetch pairing patterns', { error: error.message });
        return [];
      }

      if (!patterns?.length) return [];

      const pairings: ComponentPairingRecommendation[] = [];

      for (const componentId of componentIds) {
        // Safely filter — pattern_data may have unexpected shape
        const relevant = (patterns ?? []).filter(p => {
          if (!isComponentPairingPatternData(p.pattern_data)) return false;
          return p.pattern_data.main_component.id === componentId;
        });

        if (!relevant.length) continue;

        const { data: component } = await this.supabase
          .from('components')
          .select('*')
          .eq('id', componentId)
          .maybeSingle();

        if (!component) continue;

        pairings.push({
          main_component_id: componentId,
          main_component: component,
          paired_components: await this.buildPairedComponents(relevant),
        });
      }

      return pairings;
    } catch (error) {
      logger.warn('Error getting component pairings — returning empty', {
        error: String(error),
      });
      return [];
    }
  }

  async getPricingOptimizationRecommendations(
    quoteId: string
  ): Promise<PricingOptimizationRecommendation | null> {
    if (!quoteId) return null;
    if (!(await this.isAuthenticated())) return null;

    try {
      const { data: quote, error } = await this.supabase
        .from('quotes')
        .select('total')
        .eq('id', quoteId)
        .maybeSingle();

      if (error || !quote) return null;

      const currentTotal = quote.total ?? 0;

      return {
        current_total: currentTotal,
        optimized_total: currentTotal,
        savings: 0,
        savings_percentage: 0,
        suggestions: [],
      };
    } catch (error) {
      logger.warn('Error generating pricing optimisation', { error: String(error) });
      return null;
    }
  }

  // ============================================
  // PATTERN LEARNING
  // ============================================

  async learnFromQuote(quoteId: string): Promise<void> {
    if (!(await this.isAuthenticated())) return;

    try {
      logger.info('Learning from quote', { quoteId });

      const { data: quote, error } = await this.supabase
        .from('quotes')
        .select('*, items:quote_items(*), client:clients(*)')
        .eq('id', quoteId)
        .single();

      if (error || !quote) throw new Error(`Quote ${quoteId} not found`);

      // Run all pattern updates concurrently; individual failures won't break others
      await Promise.allSettled([this.updateClientPreferencePatterns(quote)]);

      logger.info('Finished learning from quote', { quoteId });
    } catch (error) {
      logger.error('Error learning from quote', error, { quoteId });
    }
  }

  private async updateClientPreferencePatterns(quote: any): Promise<void> {
    if (!quote?.client_id) return;

    const { data: clientQuotes } = await this.supabase
      .from('quotes')
      .select('total')
      .eq('client_id', quote.client_id);

    if (!clientQuotes || clientQuotes.length < 2) return;

    const total = clientQuotes.reduce((sum, q) => sum + (q.total ?? 0), 0);

    const patternData: ClientPreferencePatternData = {
      client_id: quote.client_id,
      preferred_manufacturers: [],
      preferred_vendors: [],
      typical_amperage_range: { min: '0A', max: '0A' },
      average_project_value: total / clientQuotes.length,
      common_project_types: [],
    };

    await this.upsertPattern(
      PatternType.CLIENT_PREFERENCE,
      patternData as unknown as Json,
      0.5
    ).catch(err =>
      logger.warn('Could not upsert client preference pattern', { error: String(err) })
    );
  }

  // ============================================
  // FEEDBACK
  // ============================================

  async recordFeedback(
    recommendationId: string,
    wasAccepted: boolean,
    feedbackText?: string
  ): Promise<void> {
    if (!(await this.isAuthenticated())) return;

    try {
      const { error } = await this.supabase
        .from('ai_recommendations')
        .update({
          was_accepted: wasAccepted,
          feedback_text: feedbackText ?? null,
        })
        .eq('id', recommendationId);

      if (error) throw error;

      // Update metrics without blocking
      this.updateAcceptanceMetric().catch(() => {});

      logger.info('Feedback recorded', { recommendationId, wasAccepted });
    } catch (error) {
      logger.error('Error recording feedback', error, { recommendationId });
      throw error;
    }
  }

  private async updateAcceptanceMetric(): Promise<void> {
    const { data: recent } = await this.supabase
      .from('ai_recommendations')
      .select('was_accepted')
      .not('was_accepted', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!recent?.length) return;

    const accepted = recent.filter(r => r.was_accepted).length;
    const rate = accepted / recent.length;

    await this.supabase.from('ai_learning_metrics').insert({
      metric_type: MetricType.ACCEPTANCE_RATE,
      metric_value: rate,
      metadata: {
        total: recent.length,
        accepted,
        timestamp: new Date().toISOString(),
      } as unknown as Json,
    });
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async getRelevantPatterns(): Promise<QuotePattern[]> {
    const { data, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .gte('confidence_score', CONFIDENCE_THRESHOLDS.MINIMUM)
      .order('confidence_score', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  private async getClientPreferences(
    clientId: string
  ): Promise<ClientPreferencePatternData | null> {
    const { data, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .eq('pattern_type', PatternType.CLIENT_PREFERENCE)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    if (!isClientPreferencePatternData(data.pattern_data)) return null;
    return data.pattern_data.client_id === clientId ? data.pattern_data : null;
  }

  private async getPricingInsights(amperage?: string): Promise<PricingPatternData[]> {
    const { data, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .eq('pattern_type', PatternType.PRICING);

    if (error || !data) return [];

    return data
    .map(p => p.pattern_data as unknown)
    .filter(isPricingPatternData);
  }

  private buildRecommendations(
    _patterns: QuotePattern[],
    _clientPreferences: ClientPreferencePatternData | null,
    _pairings: ComponentPairingRecommendation[],
    _pricingInsights: PricingPatternData[],
    _input: ComponentRecommendationInput
  ): ComponentRecommendationOutput {
    // System is still learning — returns empty until enough patterns exist
    return {
      recommended_components: [],
      related_accessories: [],
      total_estimated_price: 0,
    };
  }

  private async buildPairedComponents(patterns: QuotePattern[]): Promise<any[]> {
    const results: any[] = [];

    for (const pattern of patterns) {
      if (!isComponentPairingPatternData(pattern.pattern_data)) continue;

        const { paired_components } = pattern.pattern_data;
        if (!paired_components?.length) continue;

        for (const paired of paired_components) {
          if (!paired?.component_id) continue;

          const { data: component } = await this.supabase
            .from('components')
            .select('*')
            .eq('id', paired.component_id)
            .maybeSingle();

          if (component) {
            results.push({
              component,
              pairing_frequency:
                paired.co_occurrence_count / Math.max(pattern.usage_count ?? 1, 1),
              confidence: pattern.confidence_score ?? 0,
              typical_quantity: paired.typical_quantity ?? 1,
              reason: `Used together ${paired.co_occurrence_count} time(s)`,
            });
          }
        }
      } 
    
    return results;
  }

  private async saveRecommendation(data: {
    recommendation_type: string;
    input_data: Json;
    recommendation_data: Json;
    user_id?: string;
  }): Promise<string> {
    const { data: rec, error } = await this.supabase
      .from('ai_recommendations')
      .insert(data)
      .select('id')
      .single();

    if (error) throw error;
    return rec.id;
  }

  private async upsertPattern(
    patternType: PatternType | string,
    patternData: Json,
    confidenceScore: number
  ): Promise<void> {
  // First try to find existing pattern
    const { data: existing } = await this.supabase
      .from('quote_patterns')
      .select('id, usage_count')
      .eq('pattern_type', patternType)
      .eq('pattern_data->>client_id', (patternData as Record<string, unknown>)['client_id'] as string ?? '')
      .maybeSingle();

    if (existing) {
    // Update existing — increment usage_count
      const { error } = await this.supabase
        .from('quote_patterns')
        .update({
          pattern_data: patternData,
          confidence_score: confidenceScore,
          usage_count: (existing.usage_count ?? 0) + 1,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await this.supabase
        .from('quote_patterns')
        .insert({
          pattern_type: patternType,
          pattern_data: patternData,
          confidence_score: confidenceScore,
          usage_count: 1,
          last_seen_at: new Date().toISOString(),
      });

     if (error) throw error;
  }
}

  // ============================================
  // ANALYTICS
  // ============================================

  async getRecommendationPerformance(
    period: { from: string; to: string }
  ): Promise<any> {
    const empty = {
      total_recommendations: 0,
      accepted_recommendations: 0,
      acceptance_rate: 0,
      by_type: {},
      average_confidence: 0,
      period,
    };

    if (!(await this.isAuthenticated())) return empty;

    try {
      const { data, error } = await this.supabase
        .from('ai_recommendations')
        .select('*')
        .gte('created_at', period.from)
        .lte('created_at', period.to);

      if (error || !data) return empty;

      const total = data.length;
      const accepted = data.filter(r => r.was_accepted).length;
      const byType: Record<string, any> = {};

      for (const rec of data) {
        if (!byType[rec.recommendation_type]) {
          byType[rec.recommendation_type] = { total: 0, accepted: 0, acceptance_rate: 0 };
        }
        byType[rec.recommendation_type].total++;
        if (rec.was_accepted) byType[rec.recommendation_type].accepted++;
      }

      for (const type in byType) {
        const t = byType[type];
        t.acceptance_rate = t.total > 0 ? t.accepted / t.total : 0;
      }

      return {
        ...empty,
        total_recommendations: total,
        accepted_recommendations: accepted,
        acceptance_rate: total > 0 ? accepted / total : 0,
        by_type: byType,
      };
    } catch (error) {
      logger.warn('Error fetching recommendation performance', { error: String(error) });
      return empty;
    }
  }

  async getTopPerformingPatterns(limit = 10): Promise<QuotePattern[]> {
    if (!(await this.isAuthenticated())) return [];

    try {
      const { data, error } = await this.supabase
        .from('quote_patterns')
        .select('*')
        .gte('usage_count', PATTERN_MIN_USAGE.RELIABLE)
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      logger.warn('Error fetching top patterns', { error: String(error) });
      return [];
    }
  }
}