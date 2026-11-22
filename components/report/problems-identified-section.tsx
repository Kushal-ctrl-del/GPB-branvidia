'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info, Check, Filter } from 'lucide-react'
import type { ProblemsIdentified } from '@/lib/ai/schemas'

interface ProblemsIdentifiedSectionProps {
  problems: ProblemsIdentified
}

export function ProblemsIdentifiedSection({ problems }: ProblemsIdentifiedSectionProps) {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'OPTIMIZATION'>('ALL')

  const filteredProblems = problems.problems.filter((p) => {
    if (filter === 'ALL') return true
    return p.severity === filter
  })

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 5 • Problems Identified & Friction Analysis
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="critical" size="sm">
            {problems.criticalCount} Critical
          </Badge>
          <Badge variant="warning" size="sm">
            {problems.warningCount} Warnings
          </Badge>
          <Badge variant="neutral" size="sm">
            {problems.optimizationCount} Minor
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-paper-200 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['ALL', 'CRITICAL', 'WARNING', 'OPTIMIZATION'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter === lvl
                  ? 'bg-charcoal-900 text-white'
                  : 'text-charcoal-600 hover:bg-paper-200'
              }`}
            >
              {lvl === 'ALL' ? `All (${problems.problems.length})` : lvl}
            </button>
          ))}
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.map((prob) => {
            const isCrit = prob.severity === 'CRITICAL'
            const isWarn = prob.severity === 'WARNING'

            return (
              <div
                key={prob.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCrit
                    ? 'border-rose-200 bg-rose-50/30'
                    : isWarn
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-paper-200 bg-paper-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isCrit ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-charcoal-500 flex-shrink-0" />
                    )}
                    <h5 className="text-sm font-semibold text-charcoal-900">
                      {prob.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isCrit ? 'critical' : isWarn ? 'warning' : 'neutral'}
                      size="sm"
                    >
                      {prob.severity}
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      {prob.dimension}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-charcoal-700 leading-relaxed mb-3">
                  {prob.description}
                </p>

                <div className="pt-2 border-t border-paper-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="font-mono text-charcoal-500 bg-white/70 px-2 py-0.5 rounded border border-paper-200/60 inline-flex items-center gap-1.5">
                    <span className="font-semibold text-charcoal-700">Source:</span>
                    <span>{prob.evidenceSource}</span>
                  </div>
                  <span className="text-charcoal-600 font-medium">
                    Impact: {prob.estimatedImpact}
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
