'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Building2, Target, ShieldCheck } from 'lucide-react'
import type { BusinessOverview } from '@/lib/ai/schemas'

interface BusinessOverviewSectionProps {
  overview: BusinessOverview
  businessName: string
}

export function BusinessOverviewSection({ overview, businessName }: BusinessOverviewSectionProps) {
  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 1 • Business Profile Overview
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            Sector: {overview.sector}
          </Badge>
          <Badge
            variant={overview.operationalStatus === 'OPEN' ? 'live' : 'warning'}
            size="sm"
          >
            {overview.operationalStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
            Executive Summary
          </h4>
          <p className="text-sm text-charcoal-800 leading-relaxed font-sans bg-paper-50 p-4 rounded-lg border border-paper-200">
            {overview.summary}
          </p>
        </div>

        {/* Strengths & Limitations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Strengths */}
          <div className="p-4 rounded-lg border border-paper-200 bg-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Observed Strengths (Evidence-Backed)
            </div>
            <ul className="space-y-1.5 text-xs text-charcoal-700">
              {overview.keyStrengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Data Limitations */}
          <div className="p-4 rounded-lg border border-paper-200 bg-paper-50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Audited Data Limitations
            </div>
            {overview.dataLimitations.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-charcoal-600">
                {overview.dataLimitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-charcoal-500 italic">
                All expected business profile fields were provided and analysed.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
