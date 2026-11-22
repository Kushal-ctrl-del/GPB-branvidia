'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import type { ProfileReview } from '@/lib/ai/schemas'

interface ProfileReviewSectionProps {
  review: ProfileReview
}

export function ProfileReviewSection({ review }: ProfileReviewSectionProps) {
  const descPct = Math.round((review.descriptionAnalysis.currentLength / review.descriptionAnalysis.maximumLength) * 100)
  const isDescShort = review.descriptionAnalysis.currentLength < 250

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 2 • Google Business Profile Audit & Health Review
          </CardTitle>
        </div>
        <Badge variant={review.completenessScore >= 30 ? 'live' : 'warning'} size="sm">
          Completeness: {review.completenessScore} / 35 pts
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Health Assessment */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
            Profile Health Evaluation
          </h4>
          <p className="text-sm text-charcoal-800 leading-relaxed font-sans bg-paper-50 p-4 rounded-lg border border-paper-200">
            {review.overallHealthAssessment}
          </p>
        </div>

        {/* Description Analysis Detailed Audit */}
        <div className="p-4 rounded-lg border border-paper-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-branvidia-600" />
              GBP Description Length Audit
            </span>
            <span className="text-xs font-mono text-charcoal-600">
              {review.descriptionAnalysis.currentLength} / {review.descriptionAnalysis.maximumLength} chars ({descPct}%)
            </span>
          </div>

          {/* Character Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-paper-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isDescShort ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, descPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-charcoal-400">
              <span>0 chars</span>
              <span className="font-semibold text-charcoal-600">250 chars (Minimum Benchmark)</span>
              <span>750 chars (Maximum Allowed)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-paper-50 rounded border border-paper-200">
              <span className="font-semibold text-charcoal-900 block mb-1">Assessment:</span>
              <p className="text-charcoal-700 leading-relaxed">{review.descriptionAnalysis.assessment}</p>
            </div>
            <div className="p-3 bg-paper-50 rounded border border-paper-200">
              <span className="font-semibold text-charcoal-900 block mb-1">Recommendation:</span>
              <p className="text-charcoal-700 leading-relaxed">{review.descriptionAnalysis.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Missing Critical Fields Table */}
        {review.missingCriticalFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
              Missing Critical Fields & Ranking Impact
            </h4>
            <div className="border border-paper-200 rounded-lg overflow-hidden divide-y divide-paper-200">
              {review.missingCriticalFields.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-mono text-charcoal-900 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    {item.field}
                  </div>
                  <span className="text-charcoal-600 sm:text-right max-w-md">
                    {item.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
