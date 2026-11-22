'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, Info, ShieldCheck } from 'lucide-react'

interface ExecutiveScoreGaugeProps {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  gradeLabel: string
  completenessScore: number
  reviewsScore: number
  mediaScore: number
  localSEOScore: number
  providerLabel: 'GROQ_AI' | 'DETERMINISTIC_FALLBACK'
  modelUsed: string
  isFallback: boolean
  fallbackReason?: string
  isReviewDataUnavailable?: boolean
  scoringMethodology?: string
}

export function ExecutiveScoreGauge({
  score,
  grade,
  gradeLabel,
  completenessScore,
  reviewsScore,
  mediaScore,
  localSEOScore,
  providerLabel,
  modelUsed,
  isFallback,
  fallbackReason,
  isReviewDataUnavailable = false,
  scoringMethodology,
}: ExecutiveScoreGaugeProps) {
  const [showFormula, setShowFormula] = useState(false)

  // Grade color map
  const gradeColors = {
    A: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    B: 'text-blue-700 bg-blue-50 border-blue-300',
    C: 'text-amber-700 bg-amber-50 border-amber-300',
    D: 'text-orange-700 bg-orange-50 border-orange-300',
    F: 'text-rose-700 bg-rose-50 border-rose-300',
  }

  const dimensions = [
    {
      label: 'Profile Completeness',
      score: completenessScore,
      max: 35,
      weight: isReviewDataUnavailable ? '50.0% normalized weight' : '35% standard weight',
      detail: 'Core name, categories, address, hours, description length',
      isUnavailable: false,
    },
    {
      label: 'Reviews & Reputation',
      score: reviewsScore,
      max: 30,
      weight: isReviewDataUnavailable ? 'Omitted (no penalty)' : '30% standard weight',
      detail: isReviewDataUnavailable
        ? 'No review records provided — omitted from evaluation without penalty'
        : 'Star rating, review volume, recency, 80%+ response rate',
      isUnavailable: isReviewDataUnavailable,
    },
    {
      label: 'Media Distribution',
      score: mediaScore,
      max: 20,
      weight: isReviewDataUnavailable ? '28.6% normalized weight' : '20% standard weight',
      detail: 'Cover, profile/logo, interior, exterior, team, product photos',
      isUnavailable: false,
    },
    {
      label: 'Local SEO Discoverability',
      score: localSEOScore,
      max: 15,
      weight: isReviewDataUnavailable ? '21.4% normalized weight' : '15% standard weight',
      detail: 'Website URL, appointment link, secondary categories',
      isUnavailable: false,
    },
  ]

  return (
    <Card className="border-paper-300 bg-white shadow-editorial overflow-hidden">
      <CardHeader className="bg-paper-50/70 border-b border-paper-200 py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 font-mono">
              Deterministic Scoring Engine
            </span>
            <Badge variant={isFallback ? 'warning' : 'brand'} size="sm">
              {isFallback ? 'Deterministic Rule Engine' : 'Groq AI Synthesized'}
            </Badge>
            {isReviewDataUnavailable && (
              <Badge variant="outline" size="sm" className="bg-amber-50 text-amber-800 border-amber-300">
                Normalized Score (Zero Reviews Not Penalized)
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl font-serif font-bold text-charcoal-950 mt-0.5">
            Deterministic Optimization Audit
          </CardTitle>
          <CardDescription className="text-xs text-charcoal-500">
            Calculated via verified deterministic multi-factor scoring engine (not LLM-invented).
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-xs">
            {providerLabel === 'GROQ_AI' ? `Model: ${modelUsed}` : 'Deterministic Rule Engine'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Score Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Score Dial */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-paper-50 rounded-xl border border-paper-200 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
              Aggregate Health Score
            </span>
            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-6xl font-serif font-bold text-charcoal-950 tracking-tight">
                {score}
              </span>
              <span className="text-xl font-sans text-charcoal-400 font-medium">/100</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${gradeColors[grade]}`}>
              Grade {grade} • {gradeLabel}
            </div>

            <p className="text-xs text-charcoal-500 mt-3 max-w-xs leading-relaxed">
              {isReviewDataUnavailable
                ? 'Computed deterministically from Profile Completeness, Media Distribution, and Local SEO dimensions. Missing review data is not penalized.'
                : 'Based on Google Local Ranking factors: profile completeness, review volume, owner responsiveness, and media coverage.'}
            </p>
          </div>

          {/* Dimension Breakdown Bars */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                Four Scoring Dimensions & Weights
              </h4>
              <span className="text-[11px] text-charcoal-500 font-mono">
                {isReviewDataUnavailable ? '3 of 4 active' : '4 of 4 active'}
              </span>
            </div>

            {dimensions.map((dim) => {
              const pct = dim.isUnavailable ? 0 : Math.round((dim.score / dim.max) * 100)
              return (
                <div key={dim.label} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-medium text-charcoal-800 flex items-center gap-1.5">
                      {dim.label}
                      <span className="text-[10px] text-charcoal-400 font-mono">({dim.weight})</span>
                    </span>
                    <span className="font-mono text-charcoal-600">
                      {dim.isUnavailable ? (
                        <span className="text-amber-700 italic font-sans font-medium">Data Unavailable (Not Penalized)</span>
                      ) : (
                        <>
                          <strong className="text-charcoal-900">{dim.score}</strong> / {dim.max} pts ({pct}%)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-paper-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dim.isUnavailable
                          ? 'bg-paper-300'
                          : pct >= 80
                          ? 'bg-emerald-600'
                          : pct >= 50
                          ? 'bg-branvidia-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${dim.isUnavailable ? 100 : pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500">{dim.detail}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Methodology Toggle */}
        <div className="border-t border-paper-200 pt-4">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 font-medium transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-branvidia-600" />
            <span>How is this score calculated?</span>
            {showFormula ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showFormula && (
            <div className="mt-3 p-4 bg-paper-50 rounded-xl border border-paper-200 text-xs text-charcoal-700 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-semibold text-charcoal-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Scoring Engine Architecture</span>
              </div>
              <p className="leading-relaxed">
                {scoringMethodology ||
                  'The Branvidia Optimization Score is computed purely through deterministic TypeScript arithmetic prior to any AI model inference. The score is permanently passed to the LLM as immutable ground truth.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 bg-white rounded border border-paper-200 space-y-0.5">
                  <strong>1. Profile Completeness (35 pts max):</strong>
                  <p className="text-charcoal-500">Business name (5), Category (5), Address (5), Hours (5), Description length ≥250 chars (10), Phone (5).</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-paper-200 space-y-0.5">
                  <strong>2. Reviews & Reputation (30 pts max):</strong>
                  <p className="text-charcoal-500">Average star rating ≥4.5★ (12), Total volume & 90-day recency (8), Owner response rate ≥80% (10).</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-paper-200 space-y-0.5">
                  <strong>3. Media Distribution (20 pts max):</strong>
                  <p className="text-charcoal-500">Cover photo (4), Logo (3), Interior ≥3 (5), Exterior (3), Team/Staff (3), Products/Food ≥2 (2).</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-paper-200 space-y-0.5">
                  <strong>4. Local SEO Discoverability (15 pts max):</strong>
                  <p className="text-charcoal-500">Website URL (8), Booking/Appointment link (4), Secondary categories (3).</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
