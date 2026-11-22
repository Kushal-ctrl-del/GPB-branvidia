'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Target, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react'
import type { NextSteps } from '@/lib/ai/schemas'

interface NextStepsSectionProps {
  nextSteps: NextSteps
}

export function NextStepsSection({ nextSteps }: NextStepsSectionProps) {
  const timeframeColors = {
    THIS_WEEK: 'border-l-4 border-l-rose-500 bg-rose-50/20',
    THIS_MONTH: 'border-l-4 border-l-amber-500 bg-amber-50/20',
    NEXT_QUARTER: 'border-l-4 border-l-blue-500 bg-blue-50/20',
  }

  const timeframeLabels = {
    THIS_WEEK: 'Week 1 (Immediate Impact)',
    THIS_MONTH: 'Month 1 (Core Foundations)',
    NEXT_QUARTER: 'Quarter 1 (Velocity & Scaling)',
  }

  return (
    <Card className="border-paper-300 bg-white shadow-subtle overflow-hidden">
      <CardHeader className="bg-paper-50/50 border-b border-paper-200 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-branvidia-600" />
          <CardTitle className="text-base font-semibold text-charcoal-900">
            Section 8 • Actionable 30-Day Execution Roadmap
          </CardTitle>
        </div>
        <Badge variant="brand" size="sm">
          {nextSteps.steps.length} Sequenced Actions
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 30-Day Focus Banner */}
        <div className="p-4 rounded-xl border border-branvidia-200 bg-branvidia-50/60 flex items-start gap-3">
          <Target className="w-5 h-5 text-branvidia-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-branvidia-800 block mb-1">
              Primary 30-Day Growth Objective
            </span>
            <p className="text-sm font-serif font-medium text-charcoal-900 leading-relaxed">
              {nextSteps.thirtyDayFocus}
            </p>
          </div>
        </div>

        {/* Sequenced Next Steps List */}
        <div className="space-y-3">
          {nextSteps.steps.map((st) => (
            <div
              key={st.step}
              className={`p-4 rounded-lg border border-paper-200 ${
                timeframeColors[st.timeframe]
              } transition-all space-y-2`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                    {st.step}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                    {timeframeLabels[st.timeframe]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm" className="text-[10px] gap-1">
                    <UserCheck className="w-3 h-3 text-charcoal-500" />
                    {st.owner.replace(/_/g, ' ')}
                  </Badge>
                  <Badge
                    variant={st.priority === 'IMMEDIATE' ? 'brand' : 'neutral'}
                    size="sm"
                    className="text-[10px]"
                  >
                    {st.priority}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-charcoal-900 font-sans pl-7 font-medium">
                {st.action}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
