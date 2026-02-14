// ============================================
// AI LEARNING SERVICE
// File: src/services/AILearningService.ts
// ============================================

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database.types';
import {
  AIRecommendation,
  QuotePattern,
  AILearningMetric,
  ComponentRecommendationInput,
  ComponentRecommendationOutput,
  ComponentPairingRecommendation,
  PricingOptimizationRecommendation,
  RecommendationType,
  PatternType,
  MetricType,
  CONFIDENCE_THRESHOLDS,
  PATTERN_MIN_USAGE,
  ComponentPairingPatternData,
  ClientPreferencePatternData,
  PricingPatternData,
} from '@/types/ai-learning.types';
import { ComponentRow, QuoteRow, QuoteItemRow } from '@/types/database.types';
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
  // RECOMMENDATION GENERATION
  // ============================================

  /**
   * Get component recommendations based on context
   */
  async getComponentRecommendations(
    input: ComponentRecommendationInput
  ): Promise<ComponentRecommendationOutput> {
    try {
      logger.info('Generating component recommendations', { input });

      // 1. Get relevant patterns
      const patterns = await this.getRelevantPatterns(input);

      // 2. Get client preferences if client_id provided
      const clientPreferences = input.client_id
        ? await this.getClientPreferences(input.client_id)
        : null;

      // 3. Analyze existing components
      const existingComponentIds = input.existing_components.map(c => c.component_id);
      const pairingRecommendations = await this.getComponentPairings(existingComponentIds);

      // 4. Get pricing insights
      const pricingInsights = await this.getPricingInsights(
        input.panel_configuration?.total_amperage,
        input.budget_range
      );

      // 5. Build recommendations
      const recommendations = await this.buildRecommendations(
        patterns,
        clientPreferences,
        pairingRecommendations,
        pricingInsights,
        input
      );

      // 6. Save recommendation for feedback tracking
      const recommendationId = await this.saveRecommendation({
        recommendation_type: RecommendationType.COMPONENT_SUGGESTION,
        input_data: input as unknown as Json,
        recommendation_data: recommendations as unknown as Json,
      });

      logger.info('Component recommendations generated', {
        recommendationId,
        count: recommendations.recommended_components.length,
      });

      return recommendations;
    } catch (error) {
      logger.error('Error generating component recommendations', { input }, error as Error);
      throw error;
    }
  }

  /**
   * Get component pairing suggestions
   */
  async getComponentPairings(componentIds: string[]): Promise<ComponentPairingRecommendation[]> {
    try {
      const pairings: ComponentPairingRecommendation[] = [];

      for (const componentId of componentIds) {
        // Get pairing patterns for this component
        const { data: patterns, error } = await this.supabase
          .from('quote_patterns')
          .select('*')
          .eq('pattern_type', PatternType.COMPONENT_PAIRING)
          .gte('confidence_score', CONFIDENCE_THRESHOLDS.MINIMUM);

        if (error) throw error;

        if (!patterns) continue;

        // Filter patterns that include this component
        const relevantPatterns = patterns.filter(pattern => {
          const data = pattern.pattern_data as unknown as ComponentPairingPatternData;
          return data.main_component.id === componentId;
        });

        if (relevantPatterns.length === 0) continue;

        // Get the component details
        const { data: component } = await this.supabase
          .from('components')
          .select('*')
          .eq('id', componentId)
          .single();

        if (!component) continue;

        // Build pairing recommendation
        const pairedComponents = await this.buildPairedComponents(relevantPatterns);

        pairings.push({
          main_component_id: componentId,
          main_component: component,
          paired_components: pairedComponents,
        });
      }

      return pairings;
    } catch (error) {
      logger.error('Error getting component pairings', { componentIds }, error as Error);
      return [];
    }
  }

  /**
   * Get pricing optimization recommendations
   */
  async getPricingOptimizationRecommendations(
    quoteId: string
  ): Promise<PricingOptimizationRecommendation | null> {
    try {
      // Get quote with items
      const { data: quote, error: quoteError } = await this.supabase
        .from('quotes')
        .select('*, items:quote_items(*)')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }

      const currentTotal = quote.total || 0;
      const suggestions: any[] = [];
      let optimizedTotal = currentTotal;

      // Analyze each component for optimization opportunities
      // This is a placeholder - implement actual optimization logic
      
      // 1. Check for vendor alternatives
      // 2. Check for bulk discount opportunities
      // 3. Check for alternative components with better value
      // 4. Check for value engineering opportunities

      const savings = currentTotal - optimizedTotal;
      const savingsPercentage = (savings / currentTotal) * 100;

      return {
        current_total: currentTotal,
        optimized_total: optimizedTotal,
        savings,
        savings_percentage: savingsPercentage,
        suggestions,
      };
    } catch (error) {
      logger.error('Error generating pricing optimization', { quoteId }, error as Error);
      return null;
    }
  }

  // ============================================
  // PATTERN LEARNING
  // ============================================

  /**
   * Learn from a new quote
   */
  async learnFromQuote(quoteId: string): Promise<void> {
    try {
      logger.info('Learning from quote', { quoteId });

      // Get quote with items and components
      const { data: quote, error } = await this.supabase
        .from('quotes')
        .select(`
          *,
          items:quote_items(
            *
          ),
          client:clients(*)
        `)
        .eq('id', quoteId)
        .single();

      if (error || !quote) {
        throw new Error('Quote not found');
      }

      // Extract and update patterns
      await Promise.all([
        this.updateComponentPairingPatterns(quote),
        this.updateClientPreferencePatterns(quote),
        this.updatePricingPatterns(quote),
        this.updateVendorPreferencePatterns(quote),
      ]);

      logger.info('Finished learning from quote', { quoteId });
    } catch (error) {
      logger.error('Error learning from quote', { quoteId }, error as Error);
    }
  }

  /**
   * Update component pairing patterns
   */
  private async updateComponentPairingPatterns(quote: any): Promise<void> {
    // Analyze which components appear together
    // This is a simplified version - implement full logic based on your needs
    
    const items = quote.items || [];
    
    for (const item of items) {
      // Extract component IDs from JSON fields
      const incomers = (item.incomers as any[]) || [];
      const outgoings = (item.outgoings as any[]) || [];
      const accessories = (item.accessories as any[]) || [];

      // Update patterns for component co-occurrence
      // Implementation depends on your specific needs
    }
  }

  /**
   * Update client preference patterns
   */
  private async updateClientPreferencePatterns(quote: any): Promise<void> {
    if (!quote.client_id) return;

    // Get all quotes for this client
    const { data: clientQuotes } = await this.supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('client_id', quote.client_id);

    if (!clientQuotes || clientQuotes.length < 2) return;

    // Analyze client preferences
    const manufacturers: Record<string, number> = {};
    const vendors: Record<string, number> = {};
    let totalValue = 0;

    // Process all quotes to extract patterns
    for (const q of clientQuotes) {
      totalValue += q.total || 0;
      // Analyze items for manufacturer and vendor preferences
    }

    // Create or update client preference pattern
    const patternData: ClientPreferencePatternData = {
      client_id: quote.client_id,
      preferred_manufacturers: Object.entries(manufacturers).map(([manufacturer, count]) => ({
        manufacturer,
        frequency: count / clientQuotes.length,
      })),
      preferred_vendors: Object.entries(vendors).map(([vendor, count]) => ({
        vendor,
        frequency: count / clientQuotes.length,
      })),
      typical_amperage_range: {
        min: '0A',
        max: '0A',
      },
      average_project_value: totalValue / clientQuotes.length,
      common_project_types: [],
    };

    await this.upsertPattern(
      PatternType.CLIENT_PREFERENCE,
      patternData as unknown as Json,
      0.7
    );
  }

  /**
   * Update pricing patterns
   */
  private async updatePricingPatterns(quote: any): Promise<void> {
    // Analyze pricing trends by component category and amperage
    // Implementation depends on your specific needs
  }

  /**
   * Update vendor preference patterns
   */
  private async updateVendorPreferencePatterns(quote: any): Promise<void> {
    // Analyze vendor selection patterns
    // Implementation depends on your specific needs
  }

  // ============================================
  // FEEDBACK PROCESSING
  // ============================================

  /**
   * Record user feedback on a recommendation
   */
  async recordFeedback(
    recommendationId: string,
    wasAccepted: boolean,
    feedbackText?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_recommendations')
        .update({
          was_accepted: wasAccepted,
          feedback_text: feedbackText,
        })
        .eq('id', recommendationId);

      if (error) throw error;

      // Update metrics
      await this.updateMetrics(recommendationId, wasAccepted);

      logger.info('Feedback recorded', { recommendationId, wasAccepted });
    } catch (error) {
      logger.error('Error recording feedback', { recommendationId }, error as Error);
      throw error;
    }
  }

  /**
   * Update learning metrics based on feedback
   */
  private async updateMetrics(recommendationId: string, wasAccepted: boolean): Promise<void> {
    // Get recent recommendations
    const { data: recentRecs, error } = await this.supabase
      .from('ai_recommendations')
      .select('*')
      .not('was_accepted', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !recentRecs) return;

    const totalWithFeedback = recentRecs.length;
    const acceptedCount = recentRecs.filter(r => r.was_accepted).length;
    const acceptanceRate = totalWithFeedback > 0 ? acceptedCount / totalWithFeedback : 0;

    // Record acceptance rate metric
    await this.supabase.from('ai_learning_metrics').insert({
      metric_type: MetricType.ACCEPTANCE_RATE,
      metric_value: acceptanceRate,
      metadata: {
        total_recommendations: totalWithFeedback,
        accepted: acceptedCount,
        timestamp: new Date().toISOString(),
      } as unknown as Json,
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get relevant patterns for the given context
   */
  private async getRelevantPatterns(
    input: ComponentRecommendationInput
  ): Promise<QuotePattern[]> {
    const { data: patterns, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .gte('confidence_score', CONFIDENCE_THRESHOLDS.MINIMUM)
      .order('confidence_score', { ascending: false });

    if (error) throw error;

    return patterns || [];
  }

  /**
   * Get client preferences
   */
  private async getClientPreferences(clientId: string): Promise<ClientPreferencePatternData | null> {
    const { data: pattern, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .eq('pattern_type', PatternType.CLIENT_PREFERENCE)
      .limit(1)
      .single();

    if (error || !pattern) return null;

    const data = pattern.pattern_data as unknown as ClientPreferencePatternData;
    return data.client_id === clientId ? data : null;
  }

  /**
   * Get pricing insights
   */
  private async getPricingInsights(
    amperage?: string,
    budgetRange?: { min?: number; max?: number }
  ): Promise<PricingPatternData[]> {
    const { data: patterns, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .eq('pattern_type', PatternType.PRICING);

    if (error || !patterns) return [];

    return patterns.map(p => p.pattern_data as unknown as PricingPatternData);
  }

  /**
   * Build recommendations from analyzed data
   */
  private async buildRecommendations(
    patterns: QuotePattern[],
    clientPreferences: ClientPreferencePatternData | null,
    pairings: ComponentPairingRecommendation[],
    pricingInsights: PricingPatternData[],
    input: ComponentRecommendationInput
  ): Promise<ComponentRecommendationOutput> {
    const recommended_components: any[] = [];
    const related_accessories: any[] = [];
    let total_estimated_price = 0;

    // Build recommendations based on patterns and context
    // This is a placeholder - implement full logic based on your needs

    return {
      recommended_components,
      related_accessories,
      total_estimated_price,
    };
  }

  /**
   * Build paired components from patterns
   */
  private async buildPairedComponents(patterns: QuotePattern[]): Promise<any[]> {
    const pairedComponents: any[] = [];

    for (const pattern of patterns) {
      const data = pattern.pattern_data as unknown as ComponentPairingPatternData;
      
      for (const paired of data.paired_components) {
        const { data: component } = await this.supabase
          .from('components')
          .select('*')
          .eq('id', paired.component_id)
          .single();

        if (component) {
          pairedComponents.push({
            component,
            pairing_frequency: paired.co_occurrence_count / (pattern.usage_count || 1),
            confidence: pattern.confidence_score || 0,
            typical_quantity: paired.typical_quantity,
            reason: `Frequently paired with main component (${paired.co_occurrence_count} times)`,
          });
        }
      }
    }

    return pairedComponents;
  }

  /**
   * Save a recommendation for tracking
   */
  private async saveRecommendation(data: {
    recommendation_type: string;
    input_data: Json;
    recommendation_data: Json;
    user_id?: string;
  }): Promise<string> {
    const { data: recommendation, error } = await this.supabase
      .from('ai_recommendations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return recommendation.id;
  }

  /**
   * Upsert a pattern
   */
  private async upsertPattern(
    patternType: PatternType | string,
    patternData: Json,
    confidenceScore: number
  ): Promise<void> {
    const { error } = await this.supabase.from('quote_patterns').upsert({
      pattern_type: patternType,
      pattern_data: patternData,
      confidence_score: confidenceScore,
      usage_count: 1,
      last_seen_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get recommendation performance metrics
   */
  async getRecommendationPerformance(period: { from: string; to: string }): Promise<any> {
    const { data: recommendations, error } = await this.supabase
      .from('ai_recommendations')
      .select('*')
      .gte('created_at', period.from)
      .lte('created_at', period.to);

    if (error || !recommendations) {
      return {
        total_recommendations: 0,
        accepted_recommendations: 0,
        acceptance_rate: 0,
        by_type: {},
        average_confidence: 0,
        period,
      };
    }

    const total = recommendations.length;
    const accepted = recommendations.filter(r => r.was_accepted).length;
    const acceptanceRate = total > 0 ? accepted / total : 0;

    // Group by type
    const byType: Record<string, any> = {};
    for (const rec of recommendations) {
      if (!byType[rec.recommendation_type]) {
        byType[rec.recommendation_type] = { total: 0, accepted: 0, acceptance_rate: 0 };
      }
      byType[rec.recommendation_type].total++;
      if (rec.was_accepted) byType[rec.recommendation_type].accepted++;
    }

    // Calculate acceptance rates by type
    for (const type in byType) {
      byType[type].acceptance_rate = byType[type].total > 0 
        ? byType[type].accepted / byType[type].total 
        : 0;
    }

    return {
      total_recommendations: total,
      accepted_recommendations: accepted,
      acceptance_rate: acceptanceRate,
      by_type: byType,
      average_confidence: 0, // Calculate if you store confidence
      period,
    };
  }

  /**
   * Get top performing patterns
   */
  async getTopPerformingPatterns(limit: number = 10): Promise<QuotePattern[]> {
    const { data: patterns, error } = await this.supabase
      .from('quote_patterns')
      .select('*')
      .gte('usage_count', PATTERN_MIN_USAGE.RELIABLE)
      .order('confidence_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return patterns || [];
  }
}
