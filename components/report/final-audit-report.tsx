'use client'

import React, { useRef, useEffect } from 'react'
import { ExecutiveScoreGauge } from './executive-score-gauge'
import { BusinessOverviewSection } from './business-overview-section'
import { ProfileReviewSection } from './profile-review-section'
import { ReviewInsightsSection } from './review-insights-section'
import { PhotoInsightsSection } from './photo-insights-section'
import { ProblemsIdentifiedSection } from './problems-identified-section'
import { OptimizationSuggestionsSection } from './optimization-suggestions-section'
import { ReviewResponsesSection } from './review-responses-section'
import { NextStepsSection } from './next-steps-section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer, Download, RefreshCw, ShieldCheck, Sparkles, Building2, CheckCircle2, AlertCircle, History } from 'lucide-react'
import type { AIReportOutput } from '@/lib/ai/schemas'
import { saveReportToHistory } from '@/lib/storage/report-history'

interface FinalAuditReportProps {
  report: AIReportOutput
  businessName: string
  onReset: () => void
  onReRunAnalysis: () => void
  onOpenHistory?: () => void
  dataSource?: 'demo' | 'live' | 'customer'
}

export function FinalAuditReport({
  report,
  businessName,
  onReset,
  onReRunAnalysis,
  onOpenHistory,
  dataSource = 'demo',
}: FinalAuditReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  // Persist report to local history on render
  useEffect(() => {
    saveReportToHistory({
      generatedAt: report.generatedAt,
      businessName,
      category: report.businessOverview.sector,
      optimizationScore: report.optimizationScore,
      scoreGrade: report.scoreGrade,
      scoreGradeLabel: report.scoreGradeLabel,
      reviewCount: report.reviewInsights.totalReviews,
      photoCount: report.photoInsights.totalPhotos,
      dataSource,
      providerLabel: report.providerLabel,
      isFallback: report.isFallback,
      report,
    })
  }, [report, businessName, dataSource])

  const handlePrint = () => {
    window.print()
  }

  const isReviewsUnavailable =
    report.isReviewDataUnavailable ?? (report.reviewInsights.totalReviews === 0)

  return (
    <div ref={reportRef} className="space-y-8 print:p-0 print:space-y-6">
      {/* Editorial Report Header */}
      <div className="bg-white border border-paper-300 rounded-xl p-6 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 print:hidden" />
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Comprehensive AI Optimization Report • Step 10
            </span>
            <Badge variant={report.isFallback ? 'warning' : 'brand'} size="sm">
              {report.isFallback ? 'Deterministic Rule-Based Fallback' : `Groq AI Synthesized (${report.modelUsed})`}
            </Badge>
            <Badge variant={dataSource === 'live' ? 'live' : dataSource === 'customer' ? 'brand' : 'demo'} size="sm">
              {dataSource === 'live' ? 'Live Google Profile' : dataSource === 'customer' ? 'Customer-Provided Assets' : 'Demo Profile'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950 tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Report ID: <span className="font-mono">{report.generatedAt}</span> • Framework: Google Local Algorithm V2
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 print:hidden flex-wrap">
          {onOpenHistory && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenHistory}
              className="gap-1.5 text-xs h-9"
            >
              <History className="w-3.5 h-3.5 text-charcoal-600" />
              History
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-9"
          >
            <Printer className="w-3.5 h-3.5 text-charcoal-600" />
            Print / Save PDF
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onReRunAnalysis}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 text-charcoal-600" />
            Re-run Audit
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={onReset}
            className="gap-1.5 text-xs h-9"
          >
            Start New Audit
          </Button>
        </div>
      </div>

      {/* Explicit Fallback Notification Banner */}
      {report.isFallback && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-3 shadow-subtle print:hidden">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Deterministic Rule-Based Fallback Engine Active</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              This report was generated using our pure mathematical audit engine because the primary AI provider was unavailable ({report.fallbackReason || 'LLM unreached'}). All scores, calculations, and recommendations remain 100% grounded in your actual business records.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner: 100-Point Deterministic Score Gauge */}
      <div className="page-break-inside-avoid">
        <ExecutiveScoreGauge
          score={report.optimizationScore}
          grade={report.scoreGrade}
          gradeLabel={report.scoreGradeLabel}
          completenessScore={report.scoreDimensions?.completeness ?? report.profileReview.completenessScore}
          reviewsScore={report.scoreDimensions?.reviewsReputation ?? (report.reviewInsights.responseRate >= 80 ? 30 : Math.round(report.reviewInsights.responseRate * 0.3))}
          mediaScore={report.scoreDimensions?.mediaDistribution ?? Math.min(20, Object.values(report.photoInsights.coverageByCategory).reduce((a, b) => a + b, 0) * 2)}
          localSEOScore={report.scoreDimensions?.localSEO ?? 10}
          providerLabel={report.providerLabel}
          modelUsed={report.modelUsed}
          isFallback={report.isFallback}
          fallbackReason={report.fallbackReason}
          isReviewDataUnavailable={isReviewsUnavailable}
          scoringMethodology={report.scoringMethodology}
        />
      </div>

      {/* Section 1: Business Overview */}
      <section id="section-1" className="scroll-mt-20 page-break-inside-avoid">
        <BusinessOverviewSection
          overview={report.businessOverview}
          businessName={businessName}
        />
      </section>

      {/* Section 2: Google Business Profile Review */}
      <section id="section-2" className="scroll-mt-20 page-break-inside-avoid">
        <ProfileReviewSection review={report.profileReview} />
      </section>

      {/* Section 3: Customer Review Insights */}
      <section id="section-3" className="scroll-mt-20 page-break-inside-avoid">
        <ReviewInsightsSection insights={report.reviewInsights} />
      </section>

      {/* Section 4: Photo Insights */}
      <section id="section-4" className="scroll-mt-20 page-break-inside-avoid">
        <PhotoInsightsSection insights={report.photoInsights} />
      </section>

      {/* Section 5: Problems Identified */}
      <section id="section-5" className="scroll-mt-20 page-break-inside-avoid">
        <ProblemsIdentifiedSection problems={report.problemsIdentified} />
      </section>

      {/* Section 6: AI Optimization Suggestions */}
      <section id="section-6" className="scroll-mt-20 page-break-inside-avoid">
        <OptimizationSuggestionsSection suggestions={report.optimizationSuggestions} />
      </section>

      {/* Section 7: Suggested Review Responses */}
      <section id="section-7" className="scroll-mt-20 page-break-inside-avoid">
        <ReviewResponsesSection reviewResponses={report.reviewResponses} />
      </section>

      {/* Section 8: Suggested Next Steps */}
      <section id="section-8" className="scroll-mt-20 page-break-inside-avoid">
        <NextStepsSection nextSteps={report.nextSteps} />
      </section>

      {/* Trust & Methodology Footer */}
      <div className="p-4 bg-paper-50 rounded-xl border border-paper-200 text-center text-xs text-charcoal-500 space-y-1 page-break-inside-avoid">
        <div className="flex items-center justify-center gap-1.5 font-medium text-charcoal-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Branvidia Verified Audit Framework</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] leading-relaxed">
          Scores and factor deductions are calculated deterministically. Qualitative recommendations and review drafts are generated by Groq Cloud ({report.modelUsed}) using strict structured schema validation.
        </p>
      </div>
    </div>
  )
}
