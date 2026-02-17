// ============================================
// AI INSIGHTS PAGE
// File: src/app/dashboard/ai-insights/page.tsx
// ============================================

'use client';

import { DashboardLayout, Card, CardHeader, CardTitle, CardContent } from '@/components';
import { Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';

export default function AIInsightsPage() {
  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-gray-600 mt-1">AI-powered recommendations and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Recommendation Accuracy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-ppl-navy mb-2">85%</div>
              <p className="text-gray-600">of recommendations were accepted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Pattern Confidence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-ppl-navy mb-2">92%</div>
              <p className="text-gray-600">average pattern confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Active Patterns</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-ppl-navy mb-2">47</div>
              <p className="text-gray-600">learned patterns being used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Time Saved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-ppl-navy mb-2">12hrs</div>
              <p className="text-gray-600">saved this month with AI</p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-8 text-center text-gray-500">
          <p>Detailed AI insights and analytics coming soon...</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
