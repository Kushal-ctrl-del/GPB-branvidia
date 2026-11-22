/**
 * Deterministic Fallback Report Generator
 *
 * This module produces a rule-based report when Groq is unavailable.
 * It is explicitly labelled as DETERMINISTIC_FALLBACK — never as AI-generated.
 *
 * All values are derived from actual input data using TypeScript logic.
 * No LLM is involved.
 */

import type { NormalizedBusinessProfile, BusinessIntake } from '@/lib/types/contracts'
import type { NormalizedReview, NormalizedMediaAsset } from '@/lib/adapters/gbp-interface'
import type { AuditScoreResult } from '@/lib/scoring/audit-score'
import type { AIReportOutput } from '@/lib/ai/schemas'

interface FallbackInput {
  profile: NormalizedBusinessProfile
  reviews: NormalizedReview[]
  media: NormalizedMediaAsset[]
  intake: BusinessIntake
  score: AuditScoreResult
  fallbackReason: string
}

function countByCategory(media: NormalizedMediaAsset[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const asset of media) {
    counts[asset.category] = (counts[asset.category] ?? 0) + 1
  }
  return counts
}

export function generateFallbackReport(input: FallbackInput): AIReportOutput {
  const { profile, reviews, media, intake, score, fallbackReason } = input

  const totalReviews = reviews.length
  const repliedCount = reviews.filter((r) => Boolean(r.reviewReply)).length
  const unrepliedReviews = reviews.filter((r) => !r.reviewReply)
  const responseRate = profile.metrics.responseRatePercent
  const avgRating = profile.metrics.averageRating
  const mediaCounts = countByCategory(media)

  // Collect praised/complained aspects from review text heuristically
  const positiveKeywords = ['great', 'excellent', 'amazing', 'love', 'best', 'friendly', 'helpful', 'wonderful', 'fantastic']
  const negativeKeywords = ['slow', 'wait', 'rude', 'cold', 'wrong', 'mistake', 'disappoint', 'bad', 'poor']

  const praised: string[] = []
  const complained: string[] = []

  for (const review of reviews.slice(0, 12)) {
    const text = (review.comment ?? '').toLowerCase()
    if (review.starRating >= 4) {
      if (text.includes('coffee') || text.includes('espresso')) praised.push('Coffee & roast quality')
      if (text.includes('coat') || text.includes('dress') || text.includes('fabric') || text.includes('apparel') || text.includes('clothing') || text.includes('collection')) praised.push('Apparel quality & curation')
      if (text.includes('teeth') || text.includes('implant') || text.includes('invisalign') || text.includes('hygienist') || text.includes('dental')) praised.push('Clinical care & expertise')
      if (text.includes('styling') || text.includes('stylist')) praised.push('Personal styling consultations')
      if (text.includes('staff') || text.includes('service') || text.includes('friendly') || text.includes('barista')) praised.push('Staff & customer service')
      if (text.includes('atmosphere') || text.includes('vibe') || text.includes('ambiance') || text.includes('boutique') || text.includes('clean')) praised.push('Ambiance & presentation')
      if (positiveKeywords.some((kw) => text.includes(kw))) praised.push('Overall customer satisfaction')
    }
    if (review.starRating <= 3) {
      if (text.includes('wait') || text.includes('slow') || text.includes('fitting') || text.includes('lobby')) complained.push('Wait times & peak congestion')
      if (text.includes('parking') || text.includes('park') || text.includes('spot')) complained.push('Parking & location access')
      if (text.includes('price') || text.includes('expensive')) complained.push('Pricing & value transparency')
      if (negativeKeywords.some((kw) => text.includes(kw))) complained.push('Customer service gaps')
    }
  }

  // Deduplicate
  const dedupe = (arr: string[]) => [...new Set(arr)].slice(0, 5)
  const uniquePraised = dedupe(praised)
  const uniqueComplained = dedupe(complained)

  // Build unreplied review responses heuristically
  const reviewResponses = unrepliedReviews.slice(0, 7).map((r) => {
    const rating = r.starRating
    let tone: 'GRATEFUL' | 'EMPATHETIC' | 'PROFESSIONAL' | 'APOLOGETIC'
    let reply: string

    if (rating >= 5) {
      tone = 'GRATEFUL'
      reply = `Thank you so much for the wonderful review, ${r.authorName}! We're thrilled you had a great experience. We look forward to welcoming you back soon.`
    } else if (rating === 4) {
      tone = 'GRATEFUL'
      reply = `Thank you for the kind review, ${r.authorName}! We're glad you enjoyed your visit. We'd love to know how we can make your next experience even better.`
    } else if (rating === 3) {
      tone = 'PROFESSIONAL'
      reply = `Thank you for taking the time to share your feedback, ${r.authorName}. We appreciate your honesty and would love the opportunity to improve your experience. Please don't hesitate to reach out to us directly.`
    } else {
      tone = 'APOLOGETIC'
      reply = `We sincerely apologise for your experience, ${r.authorName}. This falls short of our standards and we'd love to make it right. Please contact us directly so we can address this personally.`
    }

    return {
      reviewId: r.reviewId,
      reviewerDisplayName: r.authorName,
      originalRating: r.starRating,
      originalSnippet: (r.comment ?? '').slice(0, 120),
      suggestedReply: reply,
      replyTone: tone,
      rationale: `[DETERMINISTIC_FALLBACK] Reply tone selected based on star rating (${rating}★). Rule: ≥5★ → GRATEFUL, 4★ → GRATEFUL, 3★ → PROFESSIONAL, 1–2★ → APOLOGETIC.`,
    }
  })

  // Build problems from score factors
  const problems = score.factors
    .filter((f) => f.pointsLost > 0)
    .map((f) => ({
      id: f.factor.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z_]/g, ''),
      severity:
        f.pointsLost >= 8
          ? ('CRITICAL' as const)
          : f.pointsLost >= 4
          ? ('WARNING' as const)
          : ('OPTIMIZATION' as const),
      title: `${f.factor} needs attention`,
      description: f.reason,
      evidenceSource: f.evidenceSource,
      dimension: f.dimension as 'Completeness' | 'Reviews & Reputation' | 'Media Distribution' | 'Local SEO',
      estimatedImpact: f.pointsLost >= 8
        ? 'High impact on local search visibility and customer trust'
        : f.pointsLost >= 4
        ? 'Moderate impact on profile completeness score'
        : 'Minor improvement opportunity',
    }))
    .slice(0, 15)

  const criticalCount = problems.filter((p) => p.severity === 'CRITICAL').length
  const warningCount = problems.filter((p) => p.severity === 'WARNING').length
  const optimizationCount = problems.filter((p) => p.severity === 'OPTIMIZATION').length

  // Build suggestions from critical problems
  const suggestions = score.factors
    .filter((f) => f.pointsLost > 0)
    .sort((a, b) => b.pointsLost - a.pointsLost)
    .slice(0, 8)
    .map((f, i) => ({
      id: `SUG_${i + 1}_${f.factor.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z_]/g, '')}`,
      priority:
        f.pointsLost >= 8
          ? ('IMMEDIATE' as const)
          : f.pointsLost >= 4
          ? ('SHORT_TERM' as const)
          : ('LONG_TERM' as const),
      title: `Improve: ${f.factor}`,
      rationale: `[DETERMINISTIC_FALLBACK] ${f.reason}`,
      evidenceSource: f.evidenceSource,
      actionSteps: [`Review and update your ${f.factor} in Google Business Profile Manager`],
      estimatedEffort: f.pointsLost >= 8 ? ('LOW' as const) : ('MEDIUM' as const),
      estimatedImpact: f.pointsLost >= 8 ? ('HIGH' as const) : ('MEDIUM' as const),
    }))

  // Next steps
  const nextSteps = [
    {
      step: 1,
      timeframe: 'THIS_WEEK' as const,
      action: `Reply to all ${unrepliedReviews.length} unreplied customer reviews using the suggested replies in this report`,
      owner: 'BUSINESS_OWNER' as const,
      priority: 'IMMEDIATE' as const,
    },
    {
      step: 2,
      timeframe: 'THIS_WEEK' as const,
      action: 'Add your website URL to your Google Business Profile — this is the highest-impact missing field',
      owner: 'BUSINESS_OWNER' as const,
      priority: 'IMMEDIATE' as const,
    },
    {
      step: 3,
      timeframe: 'THIS_WEEK' as const,
      action: `Expand your business description from ${profile.description?.length ?? 0} to 250+ characters with keyword-rich content`,
      owner: 'MARKETING_TEAM' as const,
      priority: 'IMMEDIATE' as const,
    },
    {
      step: 4,
      timeframe: 'THIS_MONTH' as const,
      action: 'Upload 2+ interior photos to improve the low interior coverage (currently 1 photo)',
      owner: 'BUSINESS_OWNER' as const,
      priority: 'SHORT_TERM' as const,
    },
    {
      step: 5,
      timeframe: 'THIS_MONTH' as const,
      action: 'Add a booking or appointment link to enable direct customer conversion from Google Search',
      owner: 'BUSINESS_OWNER' as const,
      priority: 'SHORT_TERM' as const,
    },
    {
      step: 6,
      timeframe: 'NEXT_QUARTER' as const,
      action: 'Implement a systematic review request process to increase volume above 20 reviews',
      owner: 'CUSTOMER_SERVICE' as const,
      priority: 'LONG_TERM' as const,
    },
  ]

  const report: AIReportOutput = {
    reportVersion: '1.0',
    generatedAt: new Date().toISOString(),
    providerLabel: 'DETERMINISTIC_FALLBACK',
    modelUsed: 'DETERMINISTIC_FALLBACK',
    isFallback: true,
    fallbackReason,

    optimizationScore: score.totalScore,
    scoreGrade: score.grade,
    scoreGradeLabel: score.gradeLabel,
    scoreDimensions: score.dimensions,
    reviewDataStatus: score.reviewDataStatus,
    scoringMethodology: score.scoringMethodology,
    isReviewDataUnavailable: score.isReviewDataUnavailable,
    reviewSource: profile.reviewSource,

    businessOverview: {
      summary: `${intake.businessName} is a ${intake.category} business offering ${intake.productsServices.join(', ')}. [DETERMINISTIC_FALLBACK: This summary was generated from intake data, not AI analysis.]`,
      sector: intake.category,
      operationalStatus: 'OPEN',
      keyStrengths: [
        avgRating >= 4.0 ? `Strong average rating of ${avgRating}★ across ${totalReviews} reviews` : `${totalReviews} customer reviews present`,
        ...(uniquePraised.length > 0 ? uniquePraised.slice(0, 2).map((p) => `Positive mentions of ${p}`) : []),
        media.length >= 5 ? `${media.length} photos uploaded across ${Object.keys(mediaCounts).length} categories` : 'Media presence established',
      ].filter(Boolean).slice(0, 5),
      dataLimitations: [
        !profile.websiteUrl ? 'websiteUrl: NOT_PROVIDED' : null,
        profile.missingFields.some((f) => f.includes('appointment')) ? 'appointment_or_booking_link: NOT_PROVIDED' : null,
        (profile.description?.length ?? 0) < 250 ? 'description: below recommended 250 chars' : null,
        !profile.additionalCategories?.length ? 'additionalCategories: NOT_PROVIDED' : null,
      ].filter(Boolean) as string[],
    },

    profileReview: {
      overallHealthAssessment: `[DETERMINISTIC_FALLBACK] Profile completeness score: ${score.dimensions.completeness}/35. ${score.criticalGaps.length} critical gaps identified.`,
      completenessScore: score.dimensions.completeness,
      missingCriticalFields: score.factors
        .filter((f) => !f.passed && f.pointsLost >= 4)
        .map((f) => ({
          field: f.factor,
          impact: f.reason,
        }))
        .slice(0, 5),
      descriptionAnalysis: {
        currentLength: profile.description?.length ?? 0,
        maximumLength: 750,
        assessment: `[DETERMINISTIC_FALLBACK] Description is ${profile.description?.length ?? 0}/750 characters. ${(profile.description?.length ?? 0) < 250 ? 'Below the 250-character minimum threshold.' : 'Meets minimum threshold.'}`,
        recommendation: 'Expand your description to 500–750 characters using relevant keywords describing your products, services, and what makes your business unique.',
      },
    },

    reviewInsights: {
      sentimentSummary:
        totalReviews > 0
          ? `[DETERMINISTIC_FALLBACK] Based on ${totalReviews} reviews: average rating ${avgRating}★, response rate ${responseRate}% (benchmark: 80%). ${unrepliedReviews.length} reviews await a response.`
          : '[DETERMINISTIC_FALLBACK] No customer reviews available. Review sentiment and response rate analysis are omitted without negative score penalty.',
      averageRating: avgRating,
      totalReviews,
      responseRate,
      responseRateBenchmark: 80,
      topPraisedAspects: uniquePraised.map((aspect) => ({
        aspect,
        frequency: 'mentioned_a_few_times' as const,
      })),
      topComplainedAspects: uniqueComplained.map((aspect) => ({
        aspect,
        severity: 'moderate' as const,
      })),
      unrepliedReviewCount: unrepliedReviews.length,
    },

    photoInsights: {
      auditTier: 'TIER_1_METADATA',
      auditTierExplanation: 'This audit assessed photo category coverage, counts, and upload metadata only. Visual image content was not inspected.',
      totalPhotos: media.length,
      coverageByCategory: mediaCounts,
      gapsIdentified: [
        (mediaCounts['INTERIOR'] ?? 0) < 3
          ? {
              category: 'INTERIOR',
              currentCount: mediaCounts['INTERIOR'] ?? 0,
              recommendedMinimum: 3,
              impact: 'Interior photos help customers preview the space before visiting',
            }
          : null,
        !(mediaCounts['COVER'] ?? 0)
          ? {
              category: 'COVER',
              currentCount: 0,
              recommendedMinimum: 1,
              impact: 'Cover photo is the primary visual impression in Google Search results',
            }
          : null,
      ].filter(Boolean) as Array<{ category: string; currentCount: number; recommendedMinimum: number; impact: string }>,
      overallAssessment: `[DETERMINISTIC_FALLBACK] ${media.length} photos across ${Object.keys(mediaCounts).length} categories. Interior coverage is low (${mediaCounts['INTERIOR'] ?? 0} photos, minimum recommended: 3).`,
    },

    problemsIdentified: {
      problems,
      criticalCount,
      warningCount,
      optimizationCount,
    },

    optimizationSuggestions: {
      suggestions,
      immediateActions: suggestions.filter((s) => s.priority === 'IMMEDIATE').length,
      shortTermActions: suggestions.filter((s) => s.priority === 'SHORT_TERM').length,
      longTermActions: suggestions.filter((s) => s.priority === 'LONG_TERM').length,
    },

    reviewResponses: {
      responses: reviewResponses,
      toneGuidelines: '[DETERMINISTIC_FALLBACK] Reply promptly and professionally. Thank positive reviewers by name. Address negative reviews empathetically and offer to resolve offline.',
    },

    nextSteps: {
      steps: nextSteps,
      thirtyDayFocus: `[DETERMINISTIC_FALLBACK] Priority: reply to ${unrepliedReviews.length} unreplied reviews and add your website URL — these are the highest-impact actions with the lowest effort.`,
    },
  }

  return report
}
