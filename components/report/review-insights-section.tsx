'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, Info } from 'lucide-react'
import type { ReviewInsights } from '@/lib/ai/schemas'

interface ReviewInsightsSectionProps {
  insights: ReviewInsights
}

export function ReviewInsightsSection({ insights }: ReviewInsightsSectionProps) {
  if (insights.totalReviews === 0) {
    return (
      <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
        <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-branvidia-600" />
            <CardTitle className="text-base font-semibold text-charcoal-900">
              Section 3 • Customer Review Insights & Sentiment Intelligence
            </CardTitle>
          </div>
          <Badge variant="neutral" size="sm">
            0 Reviews Available
          </Badge>
        </CardHeader>

        <CardContent className="p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center mx-auto text-charcoal-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-base font-semibold text-charcoal-900">
              No Review Data Available
            </h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Review sentiment, average rating, and owner response rates require review data. Branvidia does not calculate false sentiment metrics or invent a response rate when no reviews exist.
            </p>
            <p className="text-[11px] text-charcoal-500 bg-paper-100 p-3 rounded-lg border border-paper-200">
              <strong>Audit Integrity Notice:</strong> Your 100-point optimization score was computed without docking points for missing reviews.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isResponseRateLow = insights.responseRate < insights.responseRateBenchmark

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 3 • Customer Review Insights & Sentiment Intelligence
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            {insights.totalReviews} Total Reviews
          </Badge>
          <Badge variant={insights.averageRating >= 4.0 ? 'live' : 'warning'} size="sm">
            ★ {insights.averageRating} Avg Rating
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Metric Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-paper-50 rounded-lg border border-paper-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block mb-1">
              Public Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-950">
                {insights.averageRating}
              </span>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(insights.averageRating)
                        ? 'fill-current text-amber-500'
                        : 'text-charcoal-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1">Based on {insights.totalReviews} authentic verified reviews</p>
          </div>

          <div className="p-4 bg-paper-50 rounded-lg border border-paper-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block mb-1">
              Owner Response Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-charcoal-950">
                {insights.responseRate}%
              </span>
              <span className="text-xs font-mono text-charcoal-500">
                Goal: ≥{insights.responseRateBenchmark}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-paper-200 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  insights.responseRate >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, insights.responseRate)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-paper-50 rounded-lg border border-paper-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block mb-1">
              Unanswered Feedback
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-serif font-bold ${insights.unrepliedReviewCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {insights.unrepliedReviewCount}
              </span>
              <span className="text-xs text-charcoal-500">pending response</span>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1">
              {insights.unrepliedReviewCount > 0 ? 'See Section 7 for suggested responses' : 'All reviews answered'}
            </p>
          </div>
        </div>

        {/* Sentiment Summary */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
            Sentiment Synthesis
          </h4>
          <p className="text-sm text-charcoal-800 leading-relaxed font-sans bg-paper-50 p-4 rounded-lg border border-paper-200">
            {insights.sentimentSummary}
          </p>
        </div>

        {/* Praised vs Complained Aspects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Praised */}
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Praised by Customers ({insights.topPraisedAspects.length})</span>
            </div>
            <div className="space-y-2">
              {insights.topPraisedAspects.map((aspect, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-emerald-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-charcoal-900">{aspect.aspect}</span>
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                      {aspect.frequency}
                    </span>
                  </div>
                  <p className="text-charcoal-600 italic text-[11px]">&ldquo;{aspect.exampleQuote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complained */}
          <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/40 space-y-3">
            <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs uppercase tracking-wider">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Pain Points & Friction ({insights.topComplainedAspects.length})</span>
            </div>
            <div className="space-y-2">
              {insights.topComplainedAspects.map((aspect, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-rose-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-charcoal-900">{aspect.aspect}</span>
                    <span className="text-[10px] text-rose-700 font-mono bg-rose-50 px-1.5 py-0.5 rounded">
                      {aspect.severity}
                    </span>
                  </div>
                  <p className="text-charcoal-600 italic text-[11px]">&ldquo;{aspect.exampleQuote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
