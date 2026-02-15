// ============================================
// AI LEARNING - REACT HOOKS
// File: src/hooks/useAILearning.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AILearningService } from '@/services/AILearningService';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ComponentRecommendationInput,
  ComponentRecommendationOutput,
  ComponentPairingRecommendation,
  PricingOptimizationRecommendation,
  RecommendationPerformance,
  QuotePattern,
  AIFeedback,
} from '@/types/ai-learning.types';
import { useUIStore } from '@/store/useUIStore';

const aiService = AILearningService.getInstance(getSupabaseClient());

// ============================================
// RECOMMENDATION HOOKS
// ============================================

/**
 * Get component recommendations
 */
export const useComponentRecommendations = (
  input: ComponentRecommendationInput,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['ai-recommendations', 'components', input],
    queryFn: () => aiService.getComponentRecommendations(input),
    enabled: enabled && input.existing_components.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get component pairing suggestions
 */
export const useComponentPairings = (componentIds: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ai-recommendations', 'pairings', componentIds],
    queryFn: () => aiService.getComponentPairings(componentIds),
    enabled: enabled && componentIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Get pricing optimization recommendations
 */
export const usePricingOptimization = (quoteId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ai-recommendations', 'pricing', quoteId],
    queryFn: () => aiService.getPricingOptimizationRecommendations(quoteId),
    enabled: enabled && !!quoteId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================
// FEEDBACK HOOKS
// ============================================

/**
 * Submit feedback for a recommendation
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ recommendation_id, was_accepted, feedback_text }: AIFeedback) =>
      aiService.recordFeedback(recommendation_id, was_accepted, feedback_text),
    
    onSuccess: () => {
      showToast('Thank you for your feedback!', 'success');
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-analytics'] });
    },

    onError: () => {
      showToast('Failed to submit feedback', 'error');
    },
  });
};

// ============================================
// LEARNING HOOKS
// ============================================

/**
 * Learn from a quote
 */
export const useLearnFromQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => aiService.learnFromQuote(quoteId),
    
    onSuccess: () => {
      // Invalidate pattern-related queries
      queryClient.invalidateQueries({ queryKey: ['ai-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
  });
};

// ============================================
// ANALYTICS HOOKS
// ============================================

/**
 * Get recommendation performance metrics
 */
export const useRecommendationPerformance = (period: { from: string; to: string }) => {
  return useQuery({
    queryKey: ['ai-analytics', 'performance', period],
    queryFn: () => aiService.getRecommendationPerformance(period),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Get top performing patterns
 */
export const useTopPerformingPatterns = (limit: number = 10) => {
  return useQuery({
    queryKey: ['ai-analytics', 'top-patterns', limit],
    queryFn: () => aiService.getTopPerformingPatterns(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// ============================================
// COMPOSITE HOOKS
// ============================================

/**
 * Complete AI assistance for quote creation
 */
export const useAIQuoteAssistant = (input: ComponentRecommendationInput) => {
  const recommendations = useComponentRecommendations(input, true);
  const pairings = useComponentPairings(
    input.existing_components.map(c => c.component_id),
    input.existing_components.length > 0
  );

  return {
    recommendations: recommendations.data,
    pairings: pairings.data,
    isLoading: recommendations.isLoading || pairings.isLoading,
    error: recommendations.error || pairings.error,
    refetch: () => {
      recommendations.refetch();
      pairings.refetch();
    },
  };
};

/**
 * AI insights for existing quote
 */
export const useAIQuoteInsights = (quoteId: string) => {
  const pricingOpt = usePricingOptimization(quoteId, !!quoteId);

  return {
    pricingOptimization: pricingOpt.data,
    isLoading: pricingOpt.isLoading,
    error: pricingOpt.error,
  };
};
