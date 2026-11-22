/**
 * POST /api/analyze
 *
 * Runs the full GBP analysis pipeline:
 * 1. Validate input
 * 2. Load profile/review/media data
 * 3. Run deterministic scoring (no LLM)
 * 4. Call Groq with structured JSON output
 * 5. Normalize enums and backfill any incomplete sections from deterministic engine
 * 6. Zod-validate the response
 * 7. Fall back to 100% deterministic report if Groq fails completely
 *
 * Rate limit: 5 requests per minute per IP (in-memory).
 *
 * SECURITY:
 * - All API calls are server-side only
 * - GROQ_API_KEY never exposed to client
 * - Input validated with Zod before any processing
 * - Groq response validated with Zod before returning
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateAuditScore, AuditScoreResult } from '@/lib/scoring/audit-score'
import { buildSystemPrompt, buildAnalysisUserPrompt, FALLBACK_PROVIDER_LABEL } from '@/lib/ai/prompts'
import { AIReportOutputSchema, AIReportOutput } from '@/lib/ai/schemas'
import { generateFallbackReport } from '@/lib/ai/fallback-report'
import { getGBPProvider } from '@/lib/adapters/provider-factory'
import { BusinessIntakeSchema, BusinessIntake, NormalizedBusinessProfile } from '@/lib/types/contracts'
import { NormalizedReview, NormalizedMediaAsset } from '@/lib/adapters/gbp-interface'

// ---------------------------------------------------------------------------
// In-memory rate limiter (per-IP, 5 requests/minute)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const existing = rateLimitMap.get(ip)

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetMs: RATE_LIMIT_WINDOW_MS }
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    const resetMs = RATE_LIMIT_WINDOW_MS - (now - existing.windowStart)
    return { allowed: false, remaining: 0, resetMs }
  }

  existing.count += 1
  const resetMs = RATE_LIMIT_WINDOW_MS - (now - existing.windowStart)
  return { allowed: true, remaining: RATE_LIMIT_MAX - existing.count, resetMs }
}

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------
const AnalyzeRequestSchema = z.object({
  intake: BusinessIntakeSchema,
  mode: z.enum(['demo', 'live', 'customer']).default('demo'),
})

// ---------------------------------------------------------------------------
// Groq analysis call with defensive normalization
// ---------------------------------------------------------------------------
async function callGroqAnalysis(
  systemPrompt: string,
  userPrompt: string,
  score: AuditScoreResult,
  fallbackReport: AIReportOutput,
): Promise<{ success: true; data: AIReportOutput } | { success: false; error: string }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { success: false, error: 'GROQ_API_KEY not configured' }
  }

  const model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 35_000)
  const startTime = Date.now()

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 4096,
        stream: false,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    clearTimeout(timeout)
    const latencyMs = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      const sanitized =
        response.status === 429
          ? 'Groq rate limit reached'
          : response.status === 401
          ? 'Groq authentication failed'
          : response.status >= 500
          ? 'Groq service temporarily unavailable'
          : 'Groq API error'
      console.error(`[analyze] Groq API error (${response.status}) in ${latencyMs}ms:`, errorText.slice(0, 300))
      return { success: false, error: sanitized }
    }

    const json = await response.json()
    console.log(`[analyze] Groq API success: model=${model}, latency=${latencyMs}ms, tokens=${json.usage?.completion_tokens ?? 'unknown'}`)

    const content = json.choices?.[0]?.message?.content
    if (!content) {
      return { success: false, error: 'Empty response from Groq' }
    }

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      return { success: false, error: 'Groq returned non-JSON content' }
    }

    // Defensive normalization of Groq output
    // 1. Normalize problems dimension enums and clamp array length
    if (parsed.problemsIdentified?.problems && Array.isArray(parsed.problemsIdentified.problems)) {
      if (parsed.problemsIdentified.problems.length > 15) {
        parsed.problemsIdentified.problems = parsed.problemsIdentified.problems.slice(0, 15)
      }
      for (const p of parsed.problemsIdentified.problems) {
        const dimStr = String(p.dimension || '').toLowerCase()
        if (dimStr.includes('reputation') || dimStr.includes('review')) {
          p.dimension = 'Reviews & Reputation'
        } else if (dimStr.includes('media') || dimStr.includes('photo')) {
          p.dimension = 'Media Distribution'
        } else if (dimStr.includes('seo') || dimStr.includes('local') || dimStr.includes('website')) {
          p.dimension = 'Local SEO'
        } else {
          p.dimension = 'Completeness'
        }

        const sevStr = String(p.severity || '').toUpperCase()
        if (!['CRITICAL', 'WARNING', 'OPTIMIZATION'].includes(sevStr)) {
          p.severity = 'WARNING'
        }
      }

      parsed.problemsIdentified.criticalCount = parsed.problemsIdentified.problems.filter((p: any) => p.severity === 'CRITICAL').length
      parsed.problemsIdentified.warningCount = parsed.problemsIdentified.problems.filter((p: any) => p.severity === 'WARNING').length
      parsed.problemsIdentified.optimizationCount = parsed.problemsIdentified.problems.filter((p: any) => p.severity === 'OPTIMIZATION').length
    }

    // 2. Wrap optimizationSuggestions if bare array, clamp to max 10 & normalize counts
    if (Array.isArray(parsed.optimizationSuggestions)) {
      parsed.optimizationSuggestions = {
        suggestions: parsed.optimizationSuggestions,
      }
    }

    if (parsed.optimizationSuggestions?.suggestions && Array.isArray(parsed.optimizationSuggestions.suggestions)) {
      if (parsed.optimizationSuggestions.suggestions.length > 10) {
        parsed.optimizationSuggestions.suggestions = parsed.optimizationSuggestions.suggestions.slice(0, 10)
      }
      for (const s of parsed.optimizationSuggestions.suggestions) {
        const prioStr = String(s.priority || '').toUpperCase()
        if (prioStr.includes('IMMED') || prioStr.includes('HIGH')) {
          s.priority = 'IMMEDIATE'
        } else if (prioStr.includes('SHORT') || prioStr.includes('MED')) {
          s.priority = 'SHORT_TERM'
        } else {
          s.priority = 'LONG_TERM'
        }
        const effStr = String(s.estimatedEffort || '').toUpperCase()
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(effStr)) s.estimatedEffort = 'LOW'
        const impStr = String(s.estimatedImpact || '').toUpperCase()
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(impStr)) s.estimatedImpact = 'HIGH'
      }

      parsed.optimizationSuggestions.immediateActions = parsed.optimizationSuggestions.suggestions.filter((s: any) => s.priority === 'IMMEDIATE').length
      parsed.optimizationSuggestions.shortTermActions = parsed.optimizationSuggestions.suggestions.filter((s: any) => s.priority === 'SHORT_TERM').length
      parsed.optimizationSuggestions.longTermActions = parsed.optimizationSuggestions.suggestions.filter((s: any) => s.priority === 'LONG_TERM').length
    }

    // 3. Zero-review defensive guard
    if (fallbackReport.reviewInsights.totalReviews === 0) {
      if (!parsed.reviewInsights) parsed.reviewInsights = {} as any
      parsed.reviewInsights.totalReviews = 0
      parsed.reviewInsights.averageRating = 0
      parsed.reviewInsights.responseRate = 0
      parsed.reviewInsights.unrepliedReviewCount = 0
      parsed.reviewInsights.sentimentSummary =
        'No customer review records are currently available for this business. Sentiment analysis and owner response rate evaluation are omitted without negative score penalty.'
      parsed.reviewResponses = {
        responses: [],
        toneGuidelines:
          'When customer reviews are received on Google, respond within 24–48 hours thanking positive reviewers and addressing any concerns with empathy.',
      }
    }

    // 4. Wrap reviewResponses if bare array & normalize tone enums
    if (Array.isArray(parsed.reviewResponses)) {
      parsed.reviewResponses = {
        responses: parsed.reviewResponses,
        toneGuidelines: 'Always thank positive reviewers by name and address negative feedback with empathy.',
      }
    }

    if (parsed.reviewResponses?.responses && Array.isArray(parsed.reviewResponses.responses)) {
      for (const r of parsed.reviewResponses.responses) {
        const toneStr = String(r.replyTone || '').toUpperCase()
        if (toneStr.includes('THANK') || toneStr.includes('GRATE') || toneStr.includes('APPRECIAT')) {
          r.replyTone = 'GRATEFUL'
        } else if (toneStr.includes('EMPATH') || toneStr.includes('SYMPATH') || toneStr.includes('UNDERSTAND')) {
          r.replyTone = 'EMPATHETIC'
        } else if (toneStr.includes('APOLOG') || toneStr.includes('SORRY')) {
          r.replyTone = 'APOLOGETIC'
        } else {
          r.replyTone = 'PROFESSIONAL'
        }
      }
    }

    // 3. Normalize nextSteps timeframe, priority, owner enums and clamp length
    if (parsed.nextSteps?.steps && Array.isArray(parsed.nextSteps.steps)) {
      if (parsed.nextSteps.steps.length > 10) {
        parsed.nextSteps.steps = parsed.nextSteps.steps.slice(0, 10)
      }
      for (const s of parsed.nextSteps.steps) {
        const tfStr = String(s.timeframe || '').toUpperCase()
        if (tfStr.includes('WEEK') || tfStr.includes('DAY') || tfStr.includes('IMMED') || tfStr.includes('NOW')) {
          s.timeframe = 'THIS_WEEK'
        } else if (tfStr.includes('MONTH')) {
          s.timeframe = 'THIS_MONTH'
        } else {
          s.timeframe = 'NEXT_QUARTER'
        }

        const prioStr = String(s.priority || '').toUpperCase()
        if (!['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM'].includes(prioStr)) {
          s.priority = 'IMMEDIATE'
        }

        const ownerStr = String(s.owner || '').toUpperCase()
        if (!['BUSINESS_OWNER', 'MARKETING_TEAM', 'CUSTOMER_SERVICE'].includes(ownerStr)) {
          s.owner = 'BUSINESS_OWNER'
        }
      }

      // If fewer than 3 steps, backfill with remaining fallback steps
      if (parsed.nextSteps.steps.length < 3) {
        for (const fbStep of fallbackReport.nextSteps.steps) {
          if (parsed.nextSteps.steps.length >= 3) break
          parsed.nextSteps.steps.push({
            ...fbStep,
            step: parsed.nextSteps.steps.length + 1,
          })
        }
      }
    }

    // 4. Backfill any missing sections from verified deterministic engine
    const businessOverview = parsed.businessOverview?.summary ? parsed.businessOverview : fallbackReport.businessOverview
    const profileReview = parsed.profileReview?.overallHealthAssessment ? parsed.profileReview : fallbackReport.profileReview
    const reviewInsights = parsed.reviewInsights?.sentimentSummary ? parsed.reviewInsights : fallbackReport.reviewInsights
    const photoInsights = parsed.photoInsights?.auditTier ? parsed.photoInsights : fallbackReport.photoInsights
    const problemsIdentified = parsed.problemsIdentified?.problems?.length ? parsed.problemsIdentified : fallbackReport.problemsIdentified
    const optimizationSuggestions = parsed.optimizationSuggestions?.suggestions?.length ? parsed.optimizationSuggestions : fallbackReport.optimizationSuggestions
    const reviewResponses = parsed.reviewResponses?.responses?.length ? parsed.reviewResponses : fallbackReport.reviewResponses
    const nextSteps = parsed.nextSteps?.steps?.length ? parsed.nextSteps : fallbackReport.nextSteps

    // Ensure photo auditTier is strictly TIER_1_METADATA
    if (photoInsights) {
      photoInsights.auditTier = 'TIER_1_METADATA'
    }

    // Attach server-verified deterministic metadata and score
    const assembledReport: AIReportOutput = {
      reportVersion: '1.0',
      generatedAt: new Date().toISOString(),
      providerLabel: 'GROQ_AI',
      modelUsed: model,
      isFallback: false,
      optimizationScore: score.totalScore,
      scoreGrade: score.grade,
      scoreGradeLabel: score.gradeLabel,
      scoreDimensions: score.dimensions,
      reviewDataStatus: score.reviewDataStatus,
      scoringMethodology: score.scoringMethodology,
      isReviewDataUnavailable: score.isReviewDataUnavailable,
      reviewSource: fallbackReport.reviewSource,

      businessOverview,
      profileReview,
      reviewInsights,
      photoInsights,
      problemsIdentified,
      optimizationSuggestions,
      reviewResponses,
      nextSteps,
    }

    // Independent Zod validation against master schema
    const validated = AIReportOutputSchema.safeParse(assembledReport)
    if (!validated.success) {
      console.error('[analyze] Zod validation failed:', JSON.stringify(validated.error.flatten(), null, 2))
      return { success: false, error: 'Groq response failed schema validation' }
    }

    return { success: true, data: validated.data }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Groq request timed out after 35s' }
    }
    console.error('[analyze] Unexpected error:', err instanceof Error ? err.message : 'unknown')
    return { success: false, error: 'Groq request failed' }
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please wait before requesting another analysis.',
        retryAfterMs: rateCheck.resetMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
  }

  const parseResult = AnalyzeRequestSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: parseResult.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { intake, mode } = parseResult.data

  const sessionToken = request.cookies.get('gbp_token')?.value

  if (mode === 'live' && !sessionToken) {
    return NextResponse.json(
      {
        error: 'UNAUTHENTICATED',
        message: 'No active Google OAuth session found. Please authenticate via Google OAuth or switch to Demo Profile.',
      },
      { status: 401 }
    )
  }

  // Load business profile data
  try {
    const provider = getGBPProvider(mode, intake)
    const profile = await provider.getProfile(sessionToken)

    // Single source of truth: authoritative profile guarantees business identity across downstream engines
    intake.businessName = profile.name || intake.businessName
    intake.category = profile.primaryCategory || intake.category

    const [reviews, media] = await Promise.all([
      provider.getReviews(profile.locationId, sessionToken),
      provider.getMedia(profile.locationId, sessionToken),
    ])

    // Deterministic scoring (always runs, never uses LLM)
    const score = calculateAuditScore({ profile, reviews, media })

    // Generate verified deterministic fallback upfront as baseline
    const fallbackReport = generateFallbackReport({
      profile,
      reviews,
      media,
      intake,
      score,
      fallbackReason: 'Primary AI provider unreached',
    })

    // Build guardrailed prompts
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildAnalysisUserPrompt({ profile, reviews, media, intake, score })

    // Call Groq AI with fallback baseline for defensive fusion
    const groqResult = await callGroqAnalysis(systemPrompt, userPrompt, score, fallbackReport)

    if (groqResult.success) {
      return NextResponse.json(groqResult.data, {
        headers: {
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'X-Provider': 'groq',
        },
      })
    }

    // Deterministic fallback (clearly labelled as rule-based)
    console.warn('[analyze] Groq unavailable or rejected, using deterministic fallback:', groqResult.error)
    fallbackReport.fallbackReason = groqResult.error

    const fallbackValidated = AIReportOutputSchema.safeParse(fallbackReport)
    if (!fallbackValidated.success) {
      console.error('[analyze] Fallback report failed validation:', fallbackValidated.error.flatten())
      return NextResponse.json({ error: 'Analysis failed — please try again' }, { status: 500 })
    }

    return NextResponse.json(fallbackValidated.data, {
      headers: {
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-Provider': FALLBACK_PROVIDER_LABEL,
      },
    })
  } catch (err) {
    console.error('[analyze] Provider error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Failed to load business profile data' }, { status: 500 })
  }
}
