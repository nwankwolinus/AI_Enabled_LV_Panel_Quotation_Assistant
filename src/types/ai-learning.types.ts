// ============================================
// AI LEARNING SYSTEM - TYPE DEFINITIONS
// File: src/types/ai-learning.types.ts
// ============================================

import { Json } from './database.types';
import { ComponentRow, QuoteRow, QuoteItemRow } from './database.types';

// ============================================
// ENUMS
// ============================================

export enum RecommendationType {
  COMPONENT_SUGGESTION = 'component_suggestion',
  COMPONENT_PAIRING = 'component_pairing',
  PRICING_OPTIMIZATION = 'pricing_optimization',
  PANEL_CONFIGURATION = 'panel_configuration',
  VENDOR_PREFERENCE = 'vendor_preference',
  AMPERAGE_SUGGESTION = 'amperage_suggestion',
}

export enum PatternType {
  COMPONENT_PAIRING = 'component_pairing',
  CLIENT_PREFERENCE = 'client_preference',
  PANEL_CONFIGURATION = 'panel_configuration',
  PRICING = 'pricing',
  VENDOR_PREFERENCE = 'vendor_preference',
  SEASONAL = 'seasonal',
  PROJECT_TYPE = 'project_type',
}

export enum MetricType {
  RECOMMENDATION_ACCURACY = 'recommendation_accuracy',
  ACCEPTANCE_RATE = 'acceptance_rate',
  PATTERN_CONFIDENCE = 'pattern_confidence',
  USER_SATISFACTION = 'user_satisfaction',
  PREDICTION_ERROR = 'prediction_error',
  LEARNING_RATE = 'learning_rate',
}

// ============================================
// CORE INTERFACES
// ============================================

/**
 * AI Recommendation
 * Maps to ai_recommendations table
 */
export interface AIRecommendation {
  id: string;
  recommendation_type: RecommendationType | string;
  input_data: Json; // Context that generated the recommendation
  recommendation_data: Json; // The actual recommendation
  user_id: string | null;
  was_accepted: boolean | null;
  feedback_text: string | null;
  created_at: string | null;
}

/**
 * Quote Pattern
 * Maps to quote_patterns table
 */
export interface QuotePattern {
  id: string;
  pattern_type: PatternType | string;
  pattern_data: Json;
  confidence_score: number | null;
  usage_count: number | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * AI Learning Metric
 * Maps to ai_learning_metrics table
 */
export interface AILearningMetric {
  id: string;
  metric_type: MetricType | string;
  metric_value: number;
  metadata: Json | null;
  recorded_at: string | null;
}

// ============================================
// RECOMMENDATION STRUCTURES
// ============================================

/**
 * Component Recommendation Input
 */
export interface ComponentRecommendationInput {
  client_id?: string;
  project_type?: string;
  existing_components: Array<{
    component_id: string;
    amperage?: string;
    category?: string;
  }>;
  panel_configuration?: {
    total_amperage?: string;
    voltage?: string;
    phases?: number;
  };
  budget_range?: {
    min?: number;
    max?: number;
  };
}

/**
 * Component Recommendation Output
 */
export interface ComponentRecommendationOutput {
  recommended_components: Array<{
    component: ComponentRow;
    reason: string;
    confidence: number;
    suggested_quantity?: number;
    estimated_price?: number;
    alternatives?: ComponentRow[];
  }>;
  related_accessories: Array<{
    component: ComponentRow;
    reason: string;
    is_required: boolean;
  }>;
  total_estimated_price: number;
}

/**
 * Component Pairing Recommendation
 */
export interface ComponentPairingRecommendation {
  main_component_id: string;
  main_component: ComponentRow;
  paired_components: Array<{
    component: ComponentRow;
    pairing_frequency: number; // How often they appear together (0-1)
    confidence: number;
    typical_quantity: number;
    reason: string;
  }>;
}

/**
 * Pricing Optimization Recommendation
 */
export interface PricingOptimizationRecommendation {
  current_total: number;
  optimized_total: number;
  savings: number;
  savings_percentage: number;
  suggestions: Array<{
    type: 'vendor_change' | 'bulk_discount' | 'alternative_component' | 'value_engineering';
    description: string;
    current_cost: number;
    optimized_cost: number;
    savings: number;
    components_affected: string[];
  }>;
}

/**
 * Panel Configuration Recommendation
 */
export interface PanelConfigurationRecommendation {
  recommended_busbar: {
    type: string;
    amperage: string;
    specification: string;
    estimated_price: number;
    reason: string;
  };
  recommended_enclosure: {
    dimensions: string;
    type: string;
    estimated_price: number;
    reason: string;
  };
  recommended_incomers: BreakerDetail[];
  recommended_accessories: ComponentRow[];
  total_estimated_cost: number;
}

/**
 * Breaker Detail for recommendations
 */
interface BreakerDetail {
  component: ComponentRow;
  amperage: string;
  poles: string;
  quantity: number;
  reason: string;
}

// ============================================
// PATTERN STRUCTURES
// ============================================

/**
 * Component Pairing Pattern Data
 */
export interface ComponentPairingPatternData {
  main_component: {
    id: string;
    category: string;
    amperage?: string;
  };
  paired_components: Array<{
    component_id: string;
    category: string;
    typical_quantity: number;
    co_occurrence_count: number;
  }>;
  typical_accessories: string[];
  vendor_preference?: string;
}

/**
 * Client Preference Pattern Data
 */
export interface ClientPreferencePatternData {
  client_id: string;
  preferred_manufacturers: Array<{
    manufacturer: string;
    frequency: number;
  }>;
  preferred_vendors: Array<{
    vendor: string;
    frequency: number;
  }>;
  typical_amperage_range: {
    min: string;
    max: string;
  };
  average_project_value: number;
  common_project_types: string[];
}

/**
 * Pricing Pattern Data
 */
export interface PricingPatternData {
  amperage: string;
  category: string;
  average_price: number;
  price_range: {
    min: number;
    max: number;
  };
  price_per_ampere?: number;
  currency: string;
  sample_size: number;
}

/**
 * Vendor Preference Pattern Data
 */
export interface VendorPreferencePatternData {
  component_category: string;
  preferred_vendors: Array<{
    vendor: string;
    selection_frequency: number;
    average_price_competitiveness: number; // Compared to market average
  }>;
  manufacturer_vendor_mapping: Record<string, string>;
}

// ============================================
// AI SERVICE INTERFACES
// ============================================

/**
 * AI Service Request
 */
export interface AIServiceRequest {
  type: RecommendationType;
  input: ComponentRecommendationInput;
  user_id?: string;
  quote_id?: string;
}

/**
 * AI Service Response
 */
export interface AIServiceResponse {
  recommendation_id: string;
  type: RecommendationType;
  output: ComponentRecommendationOutput | ComponentPairingRecommendation | PricingOptimizationRecommendation;
  confidence: number;
  timestamp: string;
}

/**
 * Feedback Submission
 */
export interface AIFeedback {
  recommendation_id: string;
  was_accepted: boolean;
  feedback_text?: string;
  actual_components_selected?: string[];
  user_id: string;
}

// ============================================
// LEARNING ANALYTICS
// ============================================

/**
 * Recommendation Performance
 */
export interface RecommendationPerformance {
  total_recommendations: number;
  accepted_recommendations: number;
  acceptance_rate: number;
  by_type: Record<RecommendationType | string, {
    total: number;
    accepted: number;
    acceptance_rate: number;
  }>;
  average_confidence: number;
  period: {
    from: string;
    to: string;
  };
}

/**
 * Pattern Effectiveness
 */
export interface PatternEffectiveness {
  pattern_id: string;
  pattern_type: PatternType | string;
  confidence_score: number;
  usage_count: number;
  success_rate: number; // When pattern-based recommendations are accepted
  last_updated: string;
  effectiveness_trend: 'improving' | 'stable' | 'declining';
}

/**
 * Learning Insights
 */
export interface LearningInsights {
  top_performing_patterns: PatternEffectiveness[];
  most_accepted_recommendations: Array<{
    type: RecommendationType;
    acceptance_rate: number;
    avg_confidence: number;
  }>;
  user_feedback_summary: {
    total_feedback: number;
    positive_feedback: number;
    negative_feedback: number;
    common_feedback_themes: string[];
  };
  suggested_improvements: string[];
}

// ============================================
// DTOs
// ============================================

/**
 * Create AI Recommendation DTO
 */
export interface CreateAIRecommendationDTO {
  recommendation_type: RecommendationType | string;
  input_data: Json;
  recommendation_data: Json;
  user_id?: string;
}

/**
 * Update AI Recommendation with Feedback DTO
 */
export interface UpdateAIRecommendationDTO {
  was_accepted: boolean;
  feedback_text?: string;
}

/**
 * Create Quote Pattern DTO
 */
export interface CreateQuotePatternDTO {
  pattern_type: PatternType | string;
  pattern_data: Json;
  confidence_score?: number;
}

/**
 * Record Metric DTO
 */
export interface RecordMetricDTO {
  metric_type: MetricType | string;
  metric_value: number;
  metadata?: Json;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Confidence Thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
  MINIMUM: 0.3, // Don't show recommendations below this
} as const;

/**
 * Pattern Minimum Usage
 */
export const PATTERN_MIN_USAGE = {
  RELIABLE: 10, // Pattern seen 10+ times is reliable
  EMERGING: 5,  // Pattern seen 5-9 times is emerging
  NEW: 1,       // Pattern seen 1-4 times is new
} as const;

/**
 * Recommendation Labels
 */
export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType | string, string> = {
  component_suggestion: 'Component Suggestion',
  component_pairing: 'Component Pairing',
  pricing_optimization: 'Pricing Optimization',
  panel_configuration: 'Panel Configuration',
  vendor_preference: 'Vendor Preference',
  amperage_suggestion: 'Amperage Suggestion',
};

/**
 * Pattern Type Labels
 */
export const PATTERN_TYPE_LABELS: Record<PatternType | string, string> = {
  component_pairing: 'Component Pairing',
  client_preference: 'Client Preference',
  panel_configuration: 'Panel Configuration',
  pricing: 'Pricing Patterns',
  vendor_preference: 'Vendor Preference',
  seasonal: 'Seasonal Trends',
  project_type: 'Project Type Patterns',
};

/**
 * Metric Type Labels
 */
export const METRIC_TYPE_LABELS: Record<MetricType | string, string> = {
  recommendation_accuracy: 'Recommendation Accuracy',
  acceptance_rate: 'User Acceptance Rate',
  pattern_confidence: 'Pattern Confidence',
  user_satisfaction: 'User Satisfaction',
  prediction_error: 'Prediction Error',
  learning_rate: 'Learning Rate',
};
