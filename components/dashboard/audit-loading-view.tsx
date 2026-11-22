'use client'

import { useEffect, useState } from 'react'
import type { BusinessIntake } from '@/lib/types/contracts'
import type { AIReportOutput } from '@/lib/ai/schemas'

interface AuditLoadingViewProps {
  businessName: string
  reviewCount: number
  photoCount: number
  onComplete?: (report: AIReportOutput) => void
  intake: BusinessIntake
  mode?: "demo" | "live" | "customer"
}

interface AuditStep {
  id: string
  label: string
  detail: string
  durationMs: number
}

const STEP_SEQUENCE: AuditStep[] = [
  {
    id: 'metadata',
    label: 'Auditing GBP metadata',
    detail: 'Reviewing profile completeness, categories, hours and contact information',
    durationMs: 1200,
  },
  {
    id: 'reviews',
    label: 'Analysing customer reviews',
    detail: 'Evaluating sentiment, response rate, and rating distribution',
    durationMs: 1600,
  },
  {
    id: 'photos',
    label: 'Evaluating photo assets',
    detail: 'Auditing category coverage, counts and metadata (Tier 1)',
    durationMs: 1000,
  },
  {
    id: 'scoring',
    label: 'Calculating optimization score',
    detail: 'Running deterministic 100-point audit across 4 dimensions',
    durationMs: 800,
  },
  {
    id: 'ai',
    label: 'Generating AI recommendations',
    detail: 'Producing evidence-based suggestions and review responses',
    durationMs: 3000,
  },
]

export function AuditLoadingView({
  businessName,
  reviewCount,
  photoCount,
  onComplete,
  intake,
  mode = "demo",
}: AuditLoadingViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Animate through steps while API call runs in background
  useEffect(() => {
    let stepIdx = 0
    let timer: ReturnType<typeof setTimeout>

    const advanceStep = () => {
      if (stepIdx >= STEP_SEQUENCE.length - 1) return // stop at last step — wait for API
      setCompletedSteps((prev) => new Set([...prev, STEP_SEQUENCE[stepIdx].id]))
      stepIdx += 1
      setCurrentStepIndex(stepIdx)
      timer = setTimeout(advanceStep, STEP_SEQUENCE[stepIdx].durationMs)
    }

    timer = setTimeout(advanceStep, STEP_SEQUENCE[0].durationMs)
    return () => clearTimeout(timer)
  }, [])

  // Fire API call
  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intake, mode }),
        })

        if (response.status === 429) {
          setError('Rate limit reached. Please wait a moment and try again.')
          return
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setError((data as { error?: string }).error ?? 'Analysis failed. Please try again.')
          return
        }

        const report = await response.json()
        setCompletedSteps(new Set(STEP_SEQUENCE.map((s) => s.id)))
        setCurrentStepIndex(STEP_SEQUENCE.length)
        setIsComplete(true)
        setTimeout(() => onComplete?.(report), 600)
      } catch {
        setError('Network error. Please check your connection and try again.')
      }
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSteps = STEP_SEQUENCE.length
  const doneCount = completedSteps.size
  const progressPct = Math.round((doneCount / totalSteps) * 100)

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Header */}
      <div className="mb-10 max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-branvidia-100 border border-branvidia-200 mb-5">
          <span className="w-2 h-2 rounded-full bg-branvidia-500 animate-pulse" />
          <span className="text-xs font-medium text-branvidia-700 tracking-wide uppercase">
            AI Analysis Running
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-charcoal-900 font-serif mb-2">
          Analysing {businessName}
        </h2>
        <p className="text-sm text-charcoal-500">
          Reviewing {reviewCount} customer reviews and {photoCount} photos
        </p>
      </div>

      {/* Step list */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {STEP_SEQUENCE.map((step, i) => {
          const isDone = completedSteps.has(step.id)
          const isCurrent = currentStepIndex === i && !isDone
          const isPending = i > currentStepIndex

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 text-left transition-all duration-300 ${
                isPending ? 'opacity-35' : 'opacity-100'
              }`}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <svg
                    className="w-5 h-5 text-branvidia-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <svg
                    className="w-5 h-5 text-branvidia-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-charcoal-200" />
                )}
              </div>

              {/* Label */}
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDone
                      ? 'text-charcoal-700'
                      : isCurrent
                      ? 'text-charcoal-900'
                      : 'text-charcoal-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-charcoal-400 mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-3">
        <div className="h-1 w-full bg-paper-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-branvidia-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-charcoal-400 font-mono">
        {isComplete ? 'Analysis complete' : `${progressPct}% complete`}
      </p>

      {/* Error state */}
      {error && (
        <div className="mt-8 w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-left">
          <p className="text-sm font-medium text-red-800 mb-1">Analysis failed</p>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium text-red-800 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
