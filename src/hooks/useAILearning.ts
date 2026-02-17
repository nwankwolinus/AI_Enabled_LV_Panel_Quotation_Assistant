// ============================================
// AI LEARNING HOOKS
// File: src/hooks/useAILearning.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AILearningService } from '@/services/AILearningService';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ComponentRecommendationInput,
  AIFeedback,
} from '@/types/ai-learning.types';
import { useUIStore } from '@/store/useUIStore';
import { useEffect, useState } from 'react';

// ============================================
// AUTH STATE HOOK
// ============================================

/**
 * Returns true once we know the user is logged in.
 * Prevents AI hooks from firing before auth is resolved.
 */
function useIsAuthenticated(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(session !== null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(session !== null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isAuthenticated;
}

// ============================================
// RECOMMENDATION HOOKS
// ============================================

/**
 * Get component recommendations.
 * Only runs when: user is authenticated + components exist.
 */
export function useComponentRecommendations(
  input: ComponentRecommendationInput,
  enabled = true
) {
  const isAuthenticated = useIsAuthenticated();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  const hasComponents = (input.existing_components?.length ?? 0) > 0;
  const shouldRun = enabled && isAuthenticated && hasComponents;

  return useQuery({
    queryKey: ['ai-recommendations', 'components', input],
    queryFn: () => aiService.getComponentRecommendations(input),
    enabled: shouldRun,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry AI calls
  });
}

/**
 * Get component pairing suggestions.
 * Only runs when: user is authenticated + component IDs provided.
 */
export function useComponentPairings(componentIds: string[], enabled = true) {
  const isAuthenticated = useIsAuthenticated();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  const hasIds = (componentIds?.length ?? 0) > 0;
  const shouldRun = enabled && isAuthenticated && hasIds;

  return useQuery({
    queryKey: ['ai-recommendations', 'pairings', componentIds],
    queryFn: () => aiService.getComponentPairings(componentIds),
    enabled: shouldRun,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

/**
 * Get pricing optimisation for a quote.
 * Only runs when: user is authenticated + valid quoteId.
 */
export function usePricingOptimization(quoteId: string, enabled = true) {
  const isAuthenticated = useIsAuthenticated();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  const shouldRun = enabled && isAuthenticated && Boolean(quoteId);

  return useQuery({
    queryKey: ['ai-recommendations', 'pricing', quoteId],
    queryFn: () => aiService.getPricingOptimizationRecommendations(quoteId),
    enabled: shouldRun,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

// ============================================
// FEEDBACK HOOKS
// ============================================

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

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
}

// ============================================
// LEARNING HOOKS
// ============================================

export function useLearnFromQuote() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  return useMutation({
    mutationFn: (quoteId: string) => aiService.learnFromQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
  });
}

// ============================================
// ANALYTICS HOOKS
// ============================================

export function useRecommendationPerformance(period: { from: string; to: string }) {
  const isAuthenticated = useIsAuthenticated();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  return useQuery({
    queryKey: ['ai-analytics', 'performance', period],
    queryFn: () => aiService.getRecommendationPerformance(period),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15,
    retry: false,
  });
}

export function useTopPerformingPatterns(limit = 10) {
  const isAuthenticated = useIsAuthenticated();
  const supabase = getSupabaseClient();
  const aiService = AILearningService.getInstance(supabase);

  return useQuery({
    queryKey: ['ai-analytics', 'top-patterns', limit],
    queryFn: () => aiService.getTopPerformingPatterns(limit),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

// ============================================
// COMPOSITE HOOKS
// ============================================

export function useAIQuoteAssistant(input: ComponentRecommendationInput) {
  const recommendations = useComponentRecommendations(input, true);
  const pairings = useComponentPairings(
    input.existing_components?.map(c => c.component_id) ?? [],
    (input.existing_components?.length ?? 0) > 0
  );

  return {
    recommendations: recommendations.data ?? null,
    pairings: pairings.data ?? [],
    isLoading: recommendations.isLoading || pairings.isLoading,
    error: recommendations.error || pairings.error,
    refetch: () => {
      recommendations.refetch();
      pairings.refetch();
    },
  };
}

export function useAIQuoteInsights(quoteId: string) {
  const pricingOpt = usePricingOptimization(quoteId, Boolean(quoteId));

  return {
    pricingOptimization: pricingOpt.data ?? null,
    isLoading: pricingOpt.isLoading,
    error: pricingOpt.error,
  };
}