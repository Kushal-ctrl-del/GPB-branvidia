/**
 * AI Prompt Templates — Guardrailed system and user prompts for GBP analysis.
 *
 * CRITICAL RULES embedded in every prompt:
 * 1. The optimization score is deterministic — do not change it.
 * 2. Do not invent data marked NOT_PROVIDED.
 * 3. Every recommendation must cite evidenceSource from the actual data.
 * 4. Do not claim visual image inspection (Tier 1 is metadata-only).
 */

import type { NormalizedBusinessProfile, BusinessIntake } from '@/lib/types/contracts'
import type { NormalizedReview, NormalizedMediaAsset } from '@/lib/adapters/gbp-interface'
import type { AuditScoreResult } from '@/lib/scoring/audit-score'

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function buildSystemPrompt(): string {
  return `You are a senior Google Business Profile optimization analyst for Branvidia, an AI-powered business intelligence platform.

Your task is to generate a comprehensive, structured audit report based solely on the validated business data provided to you.

## ABSOLUTE CONSTRAINTS

1. **Do not invent data.** If a field is marked NOT_PROVIDED or missing, explicitly state it is unavailable — do not guess or fabricate claims.
2. **Every recommendation requires an evidenceSource.** Each problem, suggestion, and insight must cite a specific \`evidenceSource\` string referencing observed input data (e.g., "profile.websiteUrl = NOT_PROVIDED", "metrics.responseRatePercent = 41.7%", "media[category=INTERIOR].length = 1").
3. **Photo audit is Tier 1 (metadata only).** Set \`auditTier: "TIER_1_METADATA"\`. You have evaluated category coverage, counts, and upload metadata. You have NOT visually inspected image contents.
4. **Review responses must reference real reviews.** Only draft replies for real reviews provided in the data. Use the reviewer's authorName and reference actual comments. If totalReviews is 0, return an empty array [] for "responses" and explain that review reply drafting requires review records. Never invent reviews or reviewers.
5. **Output format.** You must respond with a JSON object containing EXACTLY these 8 top-level keys:
  - "businessOverview"
  - "profileReview"
  - "reviewInsights"
  - "photoInsights"
  - "problemsIdentified"
  - "optimizationSuggestions"
  - "reviewResponses"
  - "nextSteps"

## SCHEMA STRUCTURE TEMPLATE
{
  "businessOverview": {
    "summary": "1-3 sentence factual summary of the business based on intake and profile",
    "sector": "Sector derived from category",
    "operationalStatus": "OPEN",
    "keyStrengths": ["Strength 1 (citing evidence)", "Strength 2"],
    "dataLimitations": ["List of NOT_PROVIDED or missing fields"]
  },
  "profileReview": {
    "overallHealthAssessment": "Detailed qualitative assessment of profile health",
    "completenessScore": 30,
    "missingCriticalFields": [{ "field": "Field name", "impact": "Why it matters" }],
    "descriptionAnalysis": {
      "currentLength": 111,
      "maximumLength": 750,
      "assessment": "Assessment of description quality and length",
      "recommendation": "Actionable guidance to improve description"
    }
  },
  "reviewInsights": {
    "sentimentSummary": "Synthesis of review sentiment",
    "averageRating": 4.4,
    "totalReviews": 12,
    "responseRate": 41.7,
    "responseRateBenchmark": 80,
    "topPraisedAspects": [{ "aspect": "Coffee quality", "frequency": "frequently_mentioned", "exampleQuote": "..." }],
    "topComplainedAspects": [{ "aspect": "Wait times", "severity": "moderate", "exampleQuote": "..." }],
    "unrepliedReviewCount": 7
  },
  "photoInsights": {
    "auditTier": "TIER_1_METADATA",
    "auditTierExplanation": "Metadata and categorical inventory audit only; image content was not visually inspected.",
    "totalPhotos": 10,
    "coverageByCategory": { "COVER": 1, "PROFILE": 1, "INTERIOR": 1, "EXTERIOR": 1, "FOOD_AND_DRINK": 3, "PRODUCT": 2, "AT_WORK": 1 },
    "gapsIdentified": [{ "category": "INTERIOR", "currentCount": 1, "recommendedMinimum": 3, "impact": "..." }],
    "overallAssessment": "Summary of visual asset inventory"
  },
  "problemsIdentified": {
    "problems": [
      {
        "id": "MISSING_WEBSITE",
        "severity": "CRITICAL",
        "title": "Missing Official Website Link",
        "description": "...",
        "evidenceSource": "profile.websiteUrl = NOT_PROVIDED",
        "dimension": "Local SEO",
        "estimatedImpact": "..."
      }
    ],
    "criticalCount": 1,
    "warningCount": 0,
    "optimizationCount": 0
  },
  "optimizationSuggestions": {
    "suggestions": [
      {
        "id": "ADD_WEBSITE",
        "priority": "IMMEDIATE",
        "title": "...",
        "rationale": "...",
        "evidenceSource": "profile.websiteUrl = NOT_PROVIDED",
        "actionSteps": ["Step 1", "Step 2"],
        "estimatedEffort": "LOW",
        "estimatedImpact": "HIGH"
      }
    ],
    "immediateActions": 1,
    "shortTermActions": 0,
    "longTermActions": 0
  },
  "reviewResponses": {
    "responses": [
      {
        "reviewId": "rev_003",
        "reviewerDisplayName": "Author Name",
        "originalRating": 2,
        "originalSnippet": "...",
        "suggestedReply": "Empathetic, professional response thanking them and offering offline resolution",
        "replyTone": "APOLOGETIC",
        "rationale": "..."
      }
    ],
    "toneGuidelines": "Always thank positive reviewers by name and address negative feedback with empathy."
  },
  "nextSteps": {
    "steps": [
      {
        "step": 1,
        "timeframe": "THIS_WEEK",
        "action": "...",
        "owner": "BUSINESS_OWNER",
        "priority": "IMMEDIATE"
      }
    ],
    "thirtyDayFocus": "Core focus for next 30 days"
  }
}`
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

export interface AnalysisPromptInput {
  profile: NormalizedBusinessProfile
  reviews: NormalizedReview[]
  media: NormalizedMediaAsset[]
  intake: BusinessIntake
  score: AuditScoreResult
}

export function buildAnalysisUserPrompt(input: AnalysisPromptInput): string {
  const { profile, reviews, media, intake, score } = input

  // Serialize reviews
  const reviewsForPrompt = reviews.slice(0, 15).map((r, i) => ({
    id: r.reviewId,
    rating: r.starRating,
    author: r.authorName,
    comment: r.comment ?? 'NOT_PROVIDED',
    createTime: r.createTime,
    replied: Boolean(r.reviewReply),
    replyText: r.reviewReply?.comment ?? null,
  }))

  // Serialize media
  const mediaCounts: Record<string, number> = {}
  for (const asset of media) {
    mediaCounts[asset.category] = (mediaCounts[asset.category] ?? 0) + 1
  }

  const unrepliedCount = reviews.filter((r) => !r.reviewReply).length

  const payload = {
    intakeData: {
      businessName: intake.businessName,
      category: intake.category,
      productsServices: intake.productsServices,
      targetCustomers: intake.targetCustomers,
      businessGoals: intake.businessGoals,
    },
    profileRecord: {
      name: profile.name,
      primaryCategory: profile.primaryCategory,
      additionalCategories: profile.additionalCategories,
      address: profile.address,
      phoneNumber: profile.phoneNumber ?? 'NOT_PROVIDED',
      websiteUrl: profile.websiteUrl ?? 'NOT_PROVIDED',
      description: profile.description ?? 'NOT_PROVIDED',
      descriptionLength: profile.description?.length ?? 0,
      hoursConfiguredDays: profile.regularHours?.length ?? 0,
      missingFieldsIdentified: profile.missingFields,
    },
    reputationRecord: {
      totalReviews: reviews.length,
      averageRating: profile.metrics.averageRating,
      repliedReviewsCount: reviews.filter((r) => Boolean(r.reviewReply)).length,
      unrepliedReviewsCount: unrepliedCount,
      responseRatePercent: profile.metrics.responseRatePercent,
      responseRateBenchmark: 80,
      reviewsSample: reviewsForPrompt,
    },
    mediaInventory: {
      auditTier: 'TIER_1_METADATA',
      totalCount: media.length,
      countsByCategory: mediaCounts,
    },
    deterministicScoreGuidance: {
      totalScore: score.totalScore,
      grade: score.grade,
      completenessScore: score.dimensions.completeness,
      criticalGaps: score.criticalGaps,
      factors: score.factors.map((f) => ({
        dimension: f.dimension,
        factor: f.factor,
        pointsEarned: f.pointsEarned,
        pointsAvailable: f.pointsAvailable,
        passed: f.passed,
        reason: f.reason,
        evidenceSource: f.evidenceSource,
      })),
    },
  }

  return `Generate an in-depth, professional Google Business Profile optimization audit report for this business:

${JSON.stringify(payload, null, 2)}

Provide all 8 required sections in valid JSON matching the schema template in the system instructions.
Include suggested review responses for the unreplied reviews in reputationRecord.reviewsSample.
Ensure every problem and suggestion specifies a precise evidenceSource referencing the input data.`
}

export const FALLBACK_PROVIDER_LABEL = 'DETERMINISTIC_FALLBACK' as const
export const GROQ_PROVIDER_LABEL = 'GROQ_AI' as const
