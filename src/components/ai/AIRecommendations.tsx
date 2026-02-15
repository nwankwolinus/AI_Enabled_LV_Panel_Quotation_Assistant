// ============================================
// AI RECOMMENDATIONS COMPONENT
// File: src/components/ai/AIRecommendations.tsx
// ============================================

'use client';

import { useState } from 'react';
import { useComponentRecommendations, useSubmitFeedback } from '@/hooks/useAILearning';
import { ComponentRecommendationInput } from '@/types/ai-learning.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Package,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface AIRecommendationsProps {
  input: ComponentRecommendationInput;
  onAcceptRecommendation?: (componentId: string) => void;
}

export default function AIRecommendations({
  input,
  onAcceptRecommendation,
}: AIRecommendationsProps) {
  const { data: recommendations, isLoading, error } = useComponentRecommendations(input);
  const submitFeedback = useSubmitFeedback();
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-500 animate-pulse" />
          <p className="text-sm text-gray-600">Analyzing patterns and generating recommendations...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">Unable to load recommendations</p>
        </div>
      </Card>
    );
  }

  if (!recommendations || recommendations.recommended_components.length === 0) {
    return (
      <Card className="p-6 border-gray-200">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-gray-400" />
          <p className="text-sm text-gray-600">
            No recommendations available yet. Add components to get AI suggestions.
          </p>
        </div>
      </Card>
    );
  }

  const handleAccept = (componentId: string, recommendation_id: string) => {
    submitFeedback.mutate({
      recommendation_id,
      was_accepted: true,
      user_id: '', // Get from auth context
    });
    onAcceptRecommendation?.(componentId);
  };

  const handleReject = (recommendation_id: string) => {
    submitFeedback.mutate({
      recommendation_id,
      was_accepted: false,
      user_id: '', // Get from auth context
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-lg">AI Recommendations</h3>
          <Badge variant="secondary" className="ml-2">
            {recommendations.recommended_components.length} suggestions
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          Based on historical data and patterns
        </div>
      </div>

      {/* Main Recommendations */}
      <div className="grid gap-4">
        {recommendations.recommended_components.slice(0, 5).map((rec, index) => (
          <Card
            key={rec.component.id}
            className={`p-4 border-l-4 ${
              rec.confidence >= 0.8
                ? 'border-l-green-500'
                : rec.confidence >= 0.6
                ? 'border-l-yellow-500'
                : 'border-l-gray-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Component Info */}
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <h4 className="font-medium">{rec.component.item}</h4>
                  <ConfidenceBadge confidence={rec.confidence} />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-medium">Manufacturer:</span> {rec.component.manufacturer}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {rec.component.model}
                  </div>
                  {rec.component.amperage && (
                    <div>
                      <span className="font-medium">Amperage:</span> {rec.component.amperage}
                    </div>
                  )}
                  {rec.suggested_quantity && (
                    <div>
                      <span className="font-medium">Suggested Qty:</span> {rec.suggested_quantity}
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                  <p className="text-sm text-blue-800">{rec.reason}</p>
                </div>

                {/* Price */}
                {rec.estimated_price && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      Estimated: ₦{rec.estimated_price.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Alternatives */}
                {rec.alternatives && rec.alternatives.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedRecommendation(
                          expandedRecommendation === rec.component.id ? null : rec.component.id
                        )
                      }
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {expandedRecommendation === rec.component.id ? 'Hide' : 'View'}{' '}
                      {rec.alternatives.length} alternative(s)
                    </button>
                    {expandedRecommendation === rec.component.id && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-200">
                        {rec.alternatives.map(alt => (
                          <div key={alt.id} className="text-sm text-gray-600 py-1">
                            • {alt.item} - {alt.manufacturer} ({alt.model})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleAccept(rec.component.id, '')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject('')}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Related Accessories */}
      {recommendations.related_accessories.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Recommended Accessories
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {recommendations.related_accessories.map(acc => (
              <Card key={acc.component.id} className="p-3 text-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{acc.component.item}</div>
                    <div className="text-gray-500 text-xs mt-1">{acc.reason}</div>
                    {acc.is_required && (
                      <Badge variant="destructive" className="mt-2">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Total */}
      {recommendations.total_estimated_price > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                Total Estimated Price (with recommendations)
              </span>
            </div>
            <span className="text-xl font-bold text-green-600">
              ₦{recommendations.total_estimated_price.toLocaleString()}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Confidence Badge Component
 */
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return { label: 'High Confidence', color: 'bg-green-100 text-green-800' };
    if (conf >= 0.6) return { label: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low Confidence', color: 'bg-gray-100 text-gray-800' };
  };

  const { label, color } = getConfidenceLabel(confidence);

  return (
    <Badge className={`${color} text-xs`}>
      {label} ({Math.round(confidence * 100)}%)
    </Badge>
  );
}
