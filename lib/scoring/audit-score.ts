/**
 * Deterministic 100-point GBP Audit Scoring Engine
 *
 * IMPORTANT: This module contains NO LLM calls.
 * All calculations are pure TypeScript arithmetic.
 * The score is computed before any AI call and passed
 * to the LLM as a fixed reference — the LLM must NOT change it.
 */

import type { NormalizedBusinessProfile } from '@/lib/types/contracts'
import type { NormalizedReview, NormalizedMediaAsset } from '@/lib/adapters/gbp-interface'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ScoreFactorSchema = z.object({
  dimension: z.string(),
  factor: z.string(),
  pointsAvailable: z.number(),
  pointsEarned: z.number(),
  pointsLost: z.number(),
  passed: z.boolean(),
  reason: z.string(),
  evidenceSource: z.string(),
})
export type ScoreFactor = z.infer<typeof ScoreFactorSchema>

export const AuditScoreResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  gradeLabel: z.string(),
  dimensions: z.object({
    completeness: z.number(),
    reviewsReputation: z.number(),
    mediaDistribution: z.number(),
    localSEO: z.number(),
  }),
  factors: z.array(ScoreFactorSchema),
  criticalGaps: z.array(z.string()),
  calculatedAt: z.string().datetime(),
  reviewDataStatus: z.enum(['EVALUATED', 'DATA_UNAVAILABLE']).default('EVALUATED'),
  scoringMethodology: z.string().optional(),
  isReviewDataUnavailable: z.boolean().default(false),
})
export type AuditScoreResult = z.infer<typeof AuditScoreResultSchema>

export interface ScoringInput {
  profile: NormalizedBusinessProfile
  reviews: NormalizedReview[]
  media: NormalizedMediaAsset[]
  isReviewDataUnavailable?: boolean
}

// ---------------------------------------------------------------------------
// Scoring constants
// ---------------------------------------------------------------------------

const THRESHOLDS = {
  DESCRIPTION_MIN_CHARS: 250,
  DESCRIPTION_MAX_CHARS: 750,
  REVIEW_RESPONSE_RATE_BENCHMARK: 0.80, // 80%
  REVIEW_RESPONSE_RATE_GOOD: 0.60, // partial credit threshold
  AVERAGE_RATING_EXCELLENT: 4.5,
  AVERAGE_RATING_GOOD: 4.0,
  AVERAGE_RATING_FAIR: 3.5,
  REVIEW_VOLUME_GOOD: 20,
  REVIEW_VOLUME_FAIR: 10,
  INTERIOR_PHOTOS_MIN: 3,
  FOOD_PRODUCT_PHOTOS_MIN: 2,
} as const

// ---------------------------------------------------------------------------
// Helper: count photos by category
// ---------------------------------------------------------------------------
function countByCategory(media: NormalizedMediaAsset[]) {
  const counts: Record<string, number> = {}
  for (const asset of media) {
    counts[asset.category] = (counts[asset.category] ?? 0) + 1
  }
  return counts
}

// ---------------------------------------------------------------------------
// Scoring dimensions
// ---------------------------------------------------------------------------

function scoreCompleteness(
  profile: NormalizedBusinessProfile,
  factors: ScoreFactor[],
): number {
  let earned = 0

  // 1. Business name (5 pts)
  {
    const passed = Boolean(profile.name && profile.name.trim().length > 0)
    const pts = 5
    factors.push({
      dimension: 'Completeness',
      factor: 'Business Name',
      pointsAvailable: pts,
      pointsEarned: passed ? pts : 0,
      pointsLost: passed ? 0 : pts,
      passed,
      reason: passed ? 'Business name is present' : 'Business name is missing',
      evidenceSource: `profile.name = "${profile.name ?? 'NOT_PROVIDED'}"`,
    })
    if (passed) earned += pts
  }

  // 2. Primary category (5 pts)
  {
    const passed = Boolean(profile.primaryCategory && profile.primaryCategory.trim().length > 0)
    const pts = 5
    factors.push({
      dimension: 'Completeness',
      factor: 'Primary Category',
      pointsAvailable: pts,
      pointsEarned: passed ? pts : 0,
      pointsLost: passed ? 0 : pts,
      passed,
      reason: passed ? 'Primary category is set' : 'Primary category is not configured',
      evidenceSource: `profile.primaryCategory = "${profile.primaryCategory ?? 'NOT_PROVIDED'}"`,
    })
    if (passed) earned += pts
  }

  // 3. Hours configured (5 pts)
  {
    const hasHours =
      profile.regularHours != null &&
      Array.isArray(profile.regularHours) &&
      profile.regularHours.length > 0
    const pts = 5
    factors.push({
      dimension: 'Completeness',
      factor: 'Business Hours',
      pointsAvailable: pts,
      pointsEarned: hasHours ? pts : 0,
      pointsLost: hasHours ? 0 : pts,
      passed: hasHours,
      reason: hasHours
        ? `Hours configured for ${profile.regularHours?.length ?? 0} day(s)`
        : 'Business hours not configured',
      evidenceSource: `profile.regularHours.length = ${profile.regularHours?.length ?? 0}`,
    })
    if (hasHours) earned += pts
  }

  // 4. Phone number (5 pts)
  {
    const passed = Boolean(profile.phoneNumber && profile.phoneNumber.trim().length > 0)
    const pts = 5
    factors.push({
      dimension: 'Completeness',
      factor: 'Phone Number',
      pointsAvailable: pts,
      pointsEarned: passed ? pts : 0,
      pointsLost: passed ? 0 : pts,
      passed,
      reason: passed ? 'Phone number is listed' : 'Phone number is not provided',
      evidenceSource: `profile.phoneNumber = "${profile.phoneNumber ?? 'NOT_PROVIDED'}"`,
    })
    if (passed) earned += pts
  }

  // 5. Description length (10 pts, graduated)
  {
    const descLen = profile.description?.length ?? 0
    let pts = 0
    let reason = ''
    if (descLen >= THRESHOLDS.DESCRIPTION_MIN_CHARS) {
      pts = 10
      reason = `Description is ${descLen} characters (meets 250+ threshold)`
    } else if (descLen >= 100) {
      pts = 5
      reason = `Description is ${descLen} characters (too short — needs ${THRESHOLDS.DESCRIPTION_MIN_CHARS}+ chars for full credit)`
    } else {
      pts = 0
      reason = `Description is ${descLen} characters (critically short or missing — needs ${THRESHOLDS.DESCRIPTION_MIN_CHARS}+ chars)`
    }
    factors.push({
      dimension: 'Completeness',
      factor: 'Business Description',
      pointsAvailable: 10,
      pointsEarned: pts,
      pointsLost: 10 - pts,
      passed: pts === 10,
      reason,
      evidenceSource: `profile.description.length = ${descLen}`,
    })
    earned += pts
  }

  // 6. Address (5 pts)
  {
    const passed = Boolean(
      profile.address?.city && profile.address.country,
    )
    const pts = 5
    factors.push({
      dimension: 'Completeness',
      factor: 'Business Address',
      pointsAvailable: pts,
      pointsEarned: passed ? pts : 0,
      pointsLost: passed ? 0 : pts,
      passed,
      reason: passed
        ? `Address present: ${profile.address?.street ? profile.address.street + ', ' : ''}${profile.address?.city}`
        : 'Business address is incomplete or missing',
      evidenceSource: `profile.address = ${JSON.stringify(profile.address ?? null)}`,
    })
    if (passed) earned += pts
  }

  return Math.min(35, earned)
}

function scoreReviews(reviews: NormalizedReview[], factors: ScoreFactor[]): number {
  let earned = 0
  const totalReviews = reviews.length

  // 1. Average rating (12 pts, graduated)
  {
    const ratings = reviews.map((r) => r.starRating)
    const avgRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const roundedAvg = Math.round(avgRating * 10) / 10

    let pts = 0
    let reason = ''
    if (roundedAvg >= THRESHOLDS.AVERAGE_RATING_EXCELLENT) {
      pts = 12
      reason = `Excellent average rating of ${roundedAvg}★ (≥${THRESHOLDS.AVERAGE_RATING_EXCELLENT})`
    } else if (roundedAvg >= THRESHOLDS.AVERAGE_RATING_GOOD) {
      pts = 8
      reason = `Good average rating of ${roundedAvg}★ (${THRESHOLDS.AVERAGE_RATING_GOOD}–${THRESHOLDS.AVERAGE_RATING_EXCELLENT - 0.1})`
    } else if (roundedAvg >= THRESHOLDS.AVERAGE_RATING_FAIR) {
      pts = 4
      reason = `Fair average rating of ${roundedAvg}★ (${THRESHOLDS.AVERAGE_RATING_FAIR}–${THRESHOLDS.AVERAGE_RATING_GOOD - 0.1})`
    } else if (roundedAvg > 0) {
      pts = 0
      reason = `Poor average rating of ${roundedAvg}★ (below ${THRESHOLDS.AVERAGE_RATING_FAIR})`
    } else {
      pts = 0
      reason = 'No reviews available to calculate average rating'
    }

    factors.push({
      dimension: 'Reviews & Reputation',
      factor: 'Average Star Rating',
      pointsAvailable: 12,
      pointsEarned: pts,
      pointsLost: 12 - pts,
      passed: pts >= 8,
      reason,
      evidenceSource: `${totalReviews} reviews; calculated avg = ${roundedAvg}★`,
    })
    earned += pts
  }

  // 2. Review volume and recency (8 pts)
  {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const recentReviews = reviews.filter((r) => {
      const d = new Date(r.createTime)
      return !isNaN(d.getTime()) && d >= ninetyDaysAgo
    })

    let pts = 0
    let reason = ''
    if (totalReviews >= THRESHOLDS.REVIEW_VOLUME_GOOD) {
      pts = recentReviews.length >= 3 ? 8 : 5
      reason =
        pts === 8
          ? `${totalReviews} total reviews, ${recentReviews.length} in last 90 days (healthy volume and recency)`
          : `${totalReviews} total reviews but only ${recentReviews.length} in last 90 days (recency gap)`
    } else if (totalReviews >= THRESHOLDS.REVIEW_VOLUME_FAIR) {
      pts = 4
      reason = `${totalReviews} total reviews (moderate volume — benchmark is ${THRESHOLDS.REVIEW_VOLUME_GOOD}+)`
    } else {
      pts = totalReviews > 0 ? 2 : 0
      reason =
        totalReviews > 0
          ? `Only ${totalReviews} reviews (low volume — needs active review acquisition strategy)`
          : 'No reviews found'
    }

    factors.push({
      dimension: 'Reviews & Reputation',
      factor: 'Review Volume & Recency',
      pointsAvailable: 8,
      pointsEarned: pts,
      pointsLost: 8 - pts,
      passed: pts >= 5,
      reason,
      evidenceSource: `totalReviews = ${totalReviews}, recentReviews (90d) = ${recentReviews.length}`,
    })
    earned += pts
  }

  // 3. Response rate (10 pts)
  {
    const repliedCount = reviews.filter((r) => Boolean(r.reviewReply)).length
    const responseRate = totalReviews > 0 ? repliedCount / totalReviews : 0
    const responseRatePct = Math.round(responseRate * 100)

    let pts = 0
    let reason = ''
    if (responseRate >= THRESHOLDS.REVIEW_RESPONSE_RATE_BENCHMARK) {
      pts = 10
      reason = `Response rate ${responseRatePct}% meets the 80% benchmark`
    } else if (responseRate >= THRESHOLDS.REVIEW_RESPONSE_RATE_GOOD) {
      pts = 5
      reason = `Response rate ${responseRatePct}% (needs improvement — benchmark is 80%+)`
    } else {
      pts = 0
      reason = `Response rate ${responseRatePct}% is critically below the 80% benchmark (${repliedCount}/${totalReviews} reviews replied)`
    }

    factors.push({
      dimension: 'Reviews & Reputation',
      factor: 'Review Response Rate',
      pointsAvailable: 10,
      pointsEarned: pts,
      pointsLost: 10 - pts,
      passed: pts === 10,
      reason,
      evidenceSource: `repliedCount = ${repliedCount}, totalReviews = ${totalReviews}, responseRate = ${responseRatePct}%`,
    })
    earned += pts
  }

  return Math.min(30, earned)
}

function scoreMedia(media: NormalizedMediaAsset[], factors: ScoreFactor[]): number {
  let earned = 0
  const counts = countByCategory(media)

  // Helper
  const get = (cat: string) => counts[cat] ?? 0

  // 1. Cover photo (4 pts)
  {
    const n = get('COVER')
    const passed = n >= 1
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Cover Photo',
      pointsAvailable: 4,
      pointsEarned: passed ? 4 : 0,
      pointsLost: passed ? 0 : 4,
      passed,
      reason: passed ? `Cover photo present (${n} found)` : 'No cover photo uploaded',
      evidenceSource: `media[category=COVER].length = ${n}`,
    })
    if (passed) earned += 4
  }

  // 2. Logo / Profile photo (3 pts) — in GBP API 'PROFILE' is the business logo
  {
    const n = get('PROFILE')
    const passed = n >= 1
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Logo / Profile Photo',
      pointsAvailable: 3,
      pointsEarned: passed ? 3 : 0,
      pointsLost: passed ? 0 : 3,
      passed,
      reason: passed ? `Profile/Logo present (${n} found)` : 'No logo/profile image uploaded',
      evidenceSource: `media[category=PROFILE].length = ${n}`,
    })
    if (passed) earned += 3
  }

  // 3. Interior photos (5 pts, needs ≥3)
  {
    const n = get('INTERIOR')
    let pts = 0
    let reason = ''
    if (n >= THRESHOLDS.INTERIOR_PHOTOS_MIN) {
      pts = 5
      reason = `${n} interior photos (meets minimum of ${THRESHOLDS.INTERIOR_PHOTOS_MIN})`
    } else if (n >= 1) {
      pts = 2
      reason = `Only ${n} interior photo(s) — needs at least ${THRESHOLDS.INTERIOR_PHOTOS_MIN} for full credit`
    } else {
      pts = 0
      reason = 'No interior photos uploaded'
    }
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Interior Photos',
      pointsAvailable: 5,
      pointsEarned: pts,
      pointsLost: 5 - pts,
      passed: pts === 5,
      reason,
      evidenceSource: `media[category=INTERIOR].length = ${n}`,
    })
    earned += pts
  }

  // 4. Exterior photos (3 pts)
  {
    const n = get('EXTERIOR')
    const passed = n >= 1
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Exterior Photos',
      pointsAvailable: 3,
      pointsEarned: passed ? 3 : 0,
      pointsLost: passed ? 0 : 3,
      passed,
      reason: passed ? `${n} exterior photo(s) present` : 'No exterior photos uploaded',
      evidenceSource: `media[category=EXTERIOR].length = ${n}`,
    })
    if (passed) earned += 3
  }

  // 5. Team photos (AT_WORK category in GBP) (3 pts)
  {
    const n = get('AT_WORK')
    const passed = n >= 1
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Team / At Work Photos',
      pointsAvailable: 3,
      pointsEarned: passed ? 3 : 0,
      pointsLost: passed ? 0 : 3,
      passed,
      reason: passed ? `${n} team/work photo(s) present` : 'No team/staff photos uploaded',
      evidenceSource: `media[category=AT_WORK].length = ${n}`,
    })
    if (passed) earned += 3
  }

  // 6. Product / food photos (2 pts, needs ≥2)
  {
    const n = get('FOOD_AND_DRINK') + get('PRODUCT')
    const passed = n >= THRESHOLDS.FOOD_PRODUCT_PHOTOS_MIN
    factors.push({
      dimension: 'Media Distribution',
      factor: 'Product / Food Photos',
      pointsAvailable: 2,
      pointsEarned: passed ? 2 : 0,
      pointsLost: passed ? 0 : 2,
      passed,
      reason: passed
        ? `${n} product/food photo(s) (meets minimum of ${THRESHOLDS.FOOD_PRODUCT_PHOTOS_MIN})`
        : `Only ${n} product/food photo(s) — needs at least ${THRESHOLDS.FOOD_PRODUCT_PHOTOS_MIN}`,
      evidenceSource: `media[category=FOOD_AND_DRINK].length = ${get('FOOD_AND_DRINK')}, media[category=PRODUCT].length = ${get('PRODUCT')}`,
    })
    if (passed) earned += 2
  }

  return Math.min(20, earned)
}

function scoreLocalSEO(
  profile: NormalizedBusinessProfile,
  factors: ScoreFactor[],
): number {
  let earned = 0

  // 1. Website URL (8 pts)
  {
    const passed = Boolean(profile.websiteUrl && profile.websiteUrl.trim().length > 0)
    factors.push({
      dimension: 'Local SEO',
      factor: 'Website URL',
      pointsAvailable: 8,
      pointsEarned: passed ? 8 : 0,
      pointsLost: passed ? 0 : 8,
      passed,
      reason: passed
        ? `Website URL is set: ${profile.websiteUrl}`
        : 'No website URL configured — significant local SEO gap',
      evidenceSource: `profile.websiteUrl = "${profile.websiteUrl ?? 'NOT_PROVIDED'}"`,
    })
    if (passed) earned += 8
  }

  // 2. Appointment / booking link (4 pts) — detected via missingFields audit
  {
    const hasBookingGap = profile.missingFields.some((f) =>
      f.toLowerCase().includes('appointment') || f.toLowerCase().includes('booking'),
    )
    const passed = !hasBookingGap
    factors.push({
      dimension: 'Local SEO',
      factor: 'Appointment / Booking Link',
      pointsAvailable: 4,
      pointsEarned: passed ? 4 : 0,
      pointsLost: passed ? 0 : 4,
      passed,
      reason: passed
        ? 'Appointment / booking link configured'
        : 'No appointment or booking link set in GBP profile',
      evidenceSource: `profile.missingFields includes appointment link gap = ${hasBookingGap}`,
    })
    if (passed) earned += 4
  }

  // 3. Secondary categories (3 pts)
  {
    const count = profile.additionalCategories?.length ?? 0
    const passed = count >= 1
    factors.push({
      dimension: 'Local SEO',
      factor: 'Secondary Categories',
      pointsAvailable: 3,
      pointsEarned: passed ? 3 : 0,
      pointsLost: passed ? 0 : 3,
      passed,
      reason: passed
        ? `${count} additional categor${count === 1 ? 'y' : 'ies'} configured`
        : 'No secondary categories set — reduces keyword coverage',
      evidenceSource: `profile.additionalCategories.length = ${count}`,
    })
    if (passed) earned += 3
  }

  return Math.min(15, earned)
}

// ---------------------------------------------------------------------------
// Grade mapping
// ---------------------------------------------------------------------------
function gradeFromScore(score: number): { grade: AuditScoreResult['grade']; gradeLabel: string } {
  if (score >= 90) return { grade: 'A', gradeLabel: 'Excellent' }
  if (score >= 75) return { grade: 'B', gradeLabel: 'Good' }
  if (score >= 60) return { grade: 'C', gradeLabel: 'Needs Improvement' }
  if (score >= 45) return { grade: 'D', gradeLabel: 'Poor' }
  return { grade: 'F', gradeLabel: 'Critical' }
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------
export function calculateAuditScore(input: ScoringInput): AuditScoreResult {
  const factors: ScoreFactor[] = []

  const isReviewsUnavailable =
    input.isReviewDataUnavailable ||
    (input.reviews.length === 0 && input.profile.dataSource !== 'SIMULATED_DEMO' && input.profile.dataSource !== 'VERIFIED_DEMO')

  const completeness = scoreCompleteness(input.profile, factors)
  let reviewsReputation = 0

  if (isReviewsUnavailable) {
    factors.push({
      dimension: 'Reviews & Reputation',
      factor: 'Review Data Status',
      pointsAvailable: 0,
      pointsEarned: 0,
      pointsLost: 0,
      passed: true,
      reason: 'No customer review records available. Reviews omitted from audit without negative penalty.',
      evidenceSource: `reviews.length = 0 (reviewSource = ${input.profile.reviewSource || 'none'})`,
    })
  } else {
    reviewsReputation = scoreReviews(input.reviews, factors)
  }

  const mediaDistribution = scoreMedia(input.media, factors)
  const localSEO = scoreLocalSEO(input.profile, factors)

  let totalScore: number
  let reviewDataStatus: 'EVALUATED' | 'DATA_UNAVAILABLE' = 'EVALUATED'
  let scoringMethodology: string

  if (isReviewsUnavailable) {
    reviewDataStatus = 'DATA_UNAVAILABLE'
    // 70 points available across Completeness (35), Media (20), and Local SEO (15)
    const earnedNonReviewPoints = completeness + mediaDistribution + localSEO
    totalScore = Math.min(100, Math.round((earnedNonReviewPoints / 70) * 100))
    scoringMethodology =
      'Normalized 100-point score across 3 active dimensions (Completeness 35 pts, Media 20 pts, Local SEO 15 pts = 70 pts total). Customer reviews omitted without penalty due to no review records provided.'
  } else {
    totalScore = Math.round(completeness + reviewsReputation + mediaDistribution + localSEO)
    scoringMethodology =
      'Standard 100-point 4-dimension audit: Profile Completeness (35%), Reviews & Reputation (30%), Media Distribution (20%), Local SEO (15%).'
  }

  const { grade, gradeLabel } = gradeFromScore(totalScore)

  // Critical gaps: factors that lost ≥5 points
  const criticalGaps = factors
    .filter((f) => f.pointsLost >= 5)
    .map((f) => `${f.factor}: ${f.reason}`)

  const result: AuditScoreResult = {
    totalScore,
    grade,
    gradeLabel,
    dimensions: {
      completeness,
      reviewsReputation,
      mediaDistribution,
      localSEO,
    },
    factors,
    criticalGaps,
    calculatedAt: new Date().toISOString(),
    reviewDataStatus,
    scoringMethodology,
    isReviewDataUnavailable: isReviewsUnavailable,
  }

  // Validate our own output before returning
  return AuditScoreResultSchema.parse(result)
}
