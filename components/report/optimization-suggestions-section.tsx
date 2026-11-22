'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, CheckSquare, Zap, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import type { OptimizationSuggestions } from '@/lib/ai/schemas'

interface OptimizationSuggestionsSectionProps {
  suggestions: OptimizationSuggestions
}

export function OptimizationSuggestionsSection({ suggestions }: OptimizationSuggestionsSectionProps) {
  const [activePriority, setActivePriority] = useState<'ALL' | 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM'>('ALL')

  const filtered = suggestions.suggestions.filter((s) => {
    if (activePriority === 'ALL') return true
    return s.priority === activePriority
  })

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 6 • Strategic AI Optimization Recommendations
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            {suggestions.immediateActions} Immediate Actions
          </Badge>
          <Badge variant="neutral" size="sm">
            {suggestions.shortTermActions} Short-Term
          </Badge>
          <Badge variant="outline" size="sm">
            {suggestions.longTermActions} Long-Term
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Priority Filter Navigation */}
        <div className="flex items-center gap-2 border-b border-paper-200 pb-3">
          {(['ALL', 'IMMEDIATE', 'SHORT_TERM', 'LONG_TERM'] as const).map((prio) => (
            <button
              key={prio}
              type="button"
              onClick={() => setActivePriority(prio)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activePriority === prio
                  ? 'bg-branvidia-900 text-white shadow-xs'
                  : 'text-charcoal-600 hover:bg-paper-200'
              }`}
            >
              {prio.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {filtered.map((sug) => {
            const isImm = sug.priority === 'IMMEDIATE'

            return (
              <div
                key={sug.id}
                className="p-4 rounded-xl border border-paper-200 bg-white hover:border-branvidia-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isImm ? 'bg-branvidia-600' : 'bg-charcoal-400'}`} />
                      <h5 className="text-sm font-semibold text-charcoal-950">
                        {sug.title}
                      </h5>
                    </div>
                    <p className="text-xs text-charcoal-700 leading-relaxed pl-4">
                      {sug.rationale}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={isImm ? 'brand' : 'neutral'} size="sm">
                      {sug.priority.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      Effort: {sug.estimatedEffort}
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      Impact: {sug.estimatedImpact}
                    </Badge>
                  </div>
                </div>

                {/* Step-by-Step Actions */}
                <div className="pl-4 pt-1 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 block">
                    Execution Steps:
                  </span>
                  {sug.actionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-charcoal-800">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Evidence Source Footer */}
                <div className="pl-4 pt-2 border-t border-paper-100 flex items-center justify-between text-[11px] font-mono text-charcoal-500">
                  <span className="truncate">Source Citation: {sug.evidenceSource}</span>
                  <span className="text-[10px] text-emerald-700 font-sans font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Grounded in Profile Data
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
