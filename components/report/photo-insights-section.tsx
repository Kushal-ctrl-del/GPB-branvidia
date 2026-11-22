'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Image as ImageIcon, AlertTriangle, ShieldAlert, CheckCircle2, Sparkles, Lightbulb } from 'lucide-react'
import type { PhotoInsights } from '@/lib/ai/schemas'

interface PhotoInsightsSectionProps {
  insights: PhotoInsights
}

export function PhotoInsightsSection({ insights }: PhotoInsightsSectionProps) {
  const categories = Object.entries(insights.coverageByCategory)

  // Identify which key categories are completely missing
  const missingCategories = categories.filter(([_, count]) => count === 0).map(([cat]) => cat)

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 4 • Photo Inventory & Categorical Distribution
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-xs border-amber-300 bg-amber-50 text-amber-800">
            Tier 1: Metadata Audit
          </Badge>
          <Badge variant="neutral" size="sm">
            {insights.totalPhotos} Assets Audited
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Mandatory Transparency Callout on Audit Tier */}
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block uppercase tracking-wider text-[11px] text-amber-800">
              Audit Scope Guarantee: Deterministic Metadata Only
            </span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              {insights.auditTierExplanation} No visual aesthetic claims or image content hallucination is made without verified vision-capable model integration.
            </p>
          </div>
        </div>

        {/* Overall Assessment */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
            Coverage Synthesis
          </h4>
          <p className="text-sm text-charcoal-800 leading-relaxed font-sans bg-paper-50 p-4 rounded-lg border border-paper-200">
            {insights.overallAssessment}
          </p>
        </div>

        {/* Categorical Breakdown Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
            Asset Count by Official Google Category
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map(([category, count]) => (
              <div
                key={category}
                className="p-3 bg-paper-50 rounded-lg border border-paper-200 flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono font-medium text-charcoal-500 uppercase">
                  {category.replace(/_/g, ' ')}
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-serif font-bold text-charcoal-950">
                    {count}
                  </span>
                  <span className="text-[10px] text-charcoal-500 font-sans">
                    {count === 1 ? 'asset' : 'assets'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Gaps Identified */}
        {insights.gapsIdentified.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
              Media Coverage Gaps Identified
            </h4>
            <div className="border border-paper-200 rounded-lg divide-y divide-paper-200 overflow-hidden">
              {insights.gapsIdentified.map((gap, idx) => (
                <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="font-medium text-charcoal-900 uppercase font-mono">
                      {gap.category}
                    </span>
                    <Badge variant="warning" size="sm" className="text-[10px]">
                      {gap.currentCount} / {gap.recommendedMinimum} minimum
                    </Badge>
                  </div>
                  <span className="text-charcoal-600 sm:text-right max-w-md">
                    {gap.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tailored Industry Visual Content Strategy Recommendations */}
        <div className="p-4 bg-paper-50 rounded-xl border border-paper-200 space-y-3">
          <div className="flex items-center gap-2 text-charcoal-900 font-semibold text-xs">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Category-Specific Visual Content Recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="p-3 bg-white rounded-lg border border-paper-200 space-y-1">
              <span className="font-semibold text-charcoal-900 block">Retail / Boutique Stores</span>
              <p className="text-charcoal-600 leading-relaxed">
                Add 3+ seasonal rack shots, well-lit mannequin displays, fitting room cleanliness, and entrance curb views to eliminate customer hesitation.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-paper-200 space-y-1">
              <span className="font-semibold text-charcoal-900 block">Cafés & Specialty Coffee</span>
              <p className="text-charcoal-600 leading-relaxed">
                Add pour-over brewing in action, whole-bean retail bags, fresh pastry cases, and natural light seating areas for remote workers.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-paper-200 space-y-1">
              <span className="font-semibold text-charcoal-900 block">Healthcare & Dental Clinics</span>
              <p className="text-charcoal-600 leading-relaxed">
                Add modern reception check-in, sterile treatment rooms, advanced scanning equipment, and smiling team portraits to build patient comfort.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
