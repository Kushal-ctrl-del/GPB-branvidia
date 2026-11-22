/**
 * AI Report Output Schema — Zod definitions for all 8 mandatory report sections.
 *
 * CRITICAL: Schema compliance does not guarantee factual accuracy.
 * Every recommendation must cite `evidenceSource` from actual observed data.
 * The LLM must not invent reviews, ratings, photos, or business facts.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Section 1: Business Overview
// ---------------------------------------------------------------------------
export const BusinessOverviewSchema = z.object({
  summary: z
    .string()
    .min(50)
    .describe('1–3 sentence factual summary of the business based only on provided data'),
  sector: z.string().describe('Business sector derived from primary category'),
  operationalStatus: z.enum(['OPEN', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY', 'UNKNOWN']),
  keyStrengths: z
    .array(z.string().min(5))
    .min(1)
    .max(5)
    .describe('Observed strengths — must cite evidenceSource'),
  dataLimitations: z
    .array(z.string())
    .describe('Fields that were NOT_PROVIDED and could not be analysed'),
})

// ---------------------------------------------------------------------------
// Section 2: Google Business Profile Review
// ---------------------------------------------------------------------------
export const ProfileReviewSchema = z.object({
  overallHealthAssessment: z
    .string()
    .min(30)
    .describe('Qualitative assessment of the profile completeness and health'),
  completenessScore: z
    .number()
    .min(0)
    .max(35)
    .describe('Completeness dimension score — must match the deterministic score passed in'),
  missingCriticalFields: z.array(
    z.object({
      field: z.string(),
      impact: z.string().describe('Why this missing field matters for GBP visibility'),
    }),
  ),
  descriptionAnalysis: z.object({
    currentLength: z.number().describe('Character count of the current description'),
    maximumLength: z.number().default(750),
    assessment: z.string().describe('Quality assessment of the description content and length'),
    recommendation: z.string().describe('Specific guidance for improving the description'),
  }),
})

// ---------------------------------------------------------------------------
// Section 3: Customer Review Insights
// ---------------------------------------------------------------------------
export const ReviewInsightsSchema = z.object({
  sentimentSummary: z
    .string()
    .min(10)
    .describe('Overall sentiment analysis based only on the actual reviews provided'),
  averageRating: z.number().min(0).max(5).describe('Must match the calculated average (0 if no reviews)'),
  totalReviews: z.number().int().min(0),
  responseRate: z
    .number()
    .min(0)
    .max(100)
    .describe('Percentage of reviews with an owner reply'),
  responseRateBenchmark: z.number().default(80).describe('Industry benchmark %'),
  topPraisedAspects: z
    .array(
      z.object({
        aspect: z.string(),
        frequency: z.enum(['mentioned_once', 'mentioned_a_few_times', 'frequently_mentioned']),
        exampleQuote: z.string().optional().describe('Direct quote from an actual review if available'),
      }),
    )
    .max(5),
  topComplainedAspects: z
    .array(
      z.object({
        aspect: z.string(),
        severity: z.enum(['minor', 'moderate', 'critical']),
        exampleQuote: z.string().optional(),
      }),
    )
    .max(5),
  unrepliedReviewCount: z.number().int().min(0),
})

// ---------------------------------------------------------------------------
// Section 4: Photo Insights
// ---------------------------------------------------------------------------
export const PhotoInsightsSchema = z.object({
  auditTier: z
    .enum(['TIER_1_METADATA', 'TIER_2_VISUAL_AI'])
    .describe('TIER_1_METADATA = category/count/recency only. TIER_2_VISUAL_AI = image content inspected.'),
  auditTierExplanation: z.string().describe('Plain-language explanation of what was and was not analysed'),
  totalPhotos: z.number().int().min(0),
  coverageByCategory: z.record(z.string(), z.number().int().min(0)),
  gapsIdentified: z.array(
    z.object({
      category: z.string(),
      currentCount: z.number().int().min(0),
      recommendedMinimum: z.number().int(),
      impact: z.string(),
    }),
  ),
  overallAssessment: z.string(),
})

// ---------------------------------------------------------------------------
// Section 5: Problems Identified
// ---------------------------------------------------------------------------
export const ProblemSchema = z.object({
  id: z.string().describe('Stable identifier like "MISSING_WEBSITE" or "LOW_RESPONSE_RATE"'),
  severity: z.enum(['CRITICAL', 'WARNING', 'OPTIMIZATION']),
  title: z.string().min(5).max(80),
  description: z.string().min(20),
  evidenceSource: z
    .string()
    .describe('The specific data point observed that identifies this problem'),
  dimension: z.enum(['Completeness', 'Reviews & Reputation', 'Media Distribution', 'Local SEO']),
  estimatedImpact: z.string().describe('What fixing this problem would improve'),
})

export const ProblemsIdentifiedSchema = z.object({
  problems: z.array(ProblemSchema).max(15),
  criticalCount: z.number().int().min(0).default(0),
  warningCount: z.number().int().min(0).default(0),
  optimizationCount: z.number().int().min(0).default(0),
})

// ---------------------------------------------------------------------------
// Section 6: AI Optimization Suggestions
// ---------------------------------------------------------------------------
export const SuggestionSchema = z.object({
  id: z.string(),
  priority: z.enum(['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM']),
  title: z.string().min(5).max(100),
  rationale: z
    .string()
    .min(20)
    .describe('Why this suggestion matters — must reference evidenceSource'),
  evidenceSource: z.string().describe('The observed data that supports this suggestion'),
  actionSteps: z
    .array(z.string().min(5))
    .min(1)
    .max(5)
    .describe('Concrete steps the business can take'),
  estimatedEffort: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedImpact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  relatedProblemId: z.string().optional(),
})

export const OptimizationSuggestionsSchema = z.object({
  suggestions: z.array(SuggestionSchema).min(1).max(10),
  immediateActions: z.number().int().min(0).default(0),
  shortTermActions: z.number().int().min(0).default(0),
  longTermActions: z.number().int().min(0).default(0),
})

// ---------------------------------------------------------------------------
// Section 7: Suggested Review Responses
// ---------------------------------------------------------------------------
export const ReviewResponseSchema = z.object({
  reviewId: z.string().describe('Must match an actual review ID from the input data'),
  reviewerDisplayName: z.string(),
  originalRating: z.number().int().min(1).max(5),
  originalSnippet: z.string().describe('First 120 chars of the actual review text'),
  suggestedReply: z.string().min(30).max(500),
  replyTone: z.enum(['GRATEFUL', 'EMPATHETIC', 'PROFESSIONAL', 'APOLOGETIC']),
  rationale: z.string().describe('Why this tone and approach was chosen'),
})

export const ReviewResponsesSchema = z.object({
  responses: z.array(ReviewResponseSchema).max(10),
  toneGuidelines: z
    .string()
    .describe('General tone guidance for responding to reviews for this business'),
})

// ---------------------------------------------------------------------------
// Section 8: Suggested Next Steps
// ---------------------------------------------------------------------------
export const NextStepSchema = z.object({
  step: z.number().int().min(1),
  timeframe: z.enum(['THIS_WEEK', 'THIS_MONTH', 'NEXT_QUARTER']),
  action: z.string().min(10).max(150),
  owner: z.enum(['BUSINESS_OWNER', 'MARKETING_TEAM', 'CUSTOMER_SERVICE']),
  priority: z.enum(['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM']),
  relatedSuggestionId: z.string().optional(),
})

export const NextStepsSchema = z.object({
  steps: z.array(NextStepSchema).min(3).max(10),
  thirtyDayFocus: z.string().min(20).describe('The single most impactful focus area for the next 30 days'),
})

// ---------------------------------------------------------------------------
// Master Report Schema
// ---------------------------------------------------------------------------
export const AIReportOutputSchema = z.object({
  // Metadata
  reportVersion: z.literal('1.0'),
  generatedAt: z.string().datetime(),
  providerLabel: z
    .enum(['GROQ_AI', 'DETERMINISTIC_FALLBACK'])
    .describe('Must be DETERMINISTIC_FALLBACK if the LLM was not used'),
  modelUsed: z.string().describe('Model identifier or "DETERMINISTIC_FALLBACK"'),
  isFallback: z.boolean(),
  fallbackReason: z.string().optional().describe('Required when isFallback is true'),

  // Score (passed through — LLM must not change this)
  optimizationScore: z.number().min(0).max(100).describe('Deterministic score — do not change'),
  scoreGrade: z.enum(['A', 'B', 'C', 'D', 'F']),
  scoreGradeLabel: z.string(),
  scoreDimensions: z
    .object({
      completeness: z.number(),
      reviewsReputation: z.number(),
      mediaDistribution: z.number(),
      localSEO: z.number(),
    })
    .optional(),
  reviewDataStatus: z.enum(['EVALUATED', 'DATA_UNAVAILABLE']).optional(),
  scoringMethodology: z.string().optional(),
  isReviewDataUnavailable: z.boolean().optional(),
  reviewSource: z.enum(['live', 'customer_provided', 'demo', 'none']).optional(),

  // The 8 mandatory sections
  businessOverview: BusinessOverviewSchema,
  profileReview: ProfileReviewSchema,
  reviewInsights: ReviewInsightsSchema,
  photoInsights: PhotoInsightsSchema,
  problemsIdentified: ProblemsIdentifiedSchema,
  optimizationSuggestions: OptimizationSuggestionsSchema,
  reviewResponses: ReviewResponsesSchema,
  nextSteps: NextStepsSchema,
})

export type AIReportOutput = z.infer<typeof AIReportOutputSchema>
export type BusinessOverview = z.infer<typeof BusinessOverviewSchema>
export type ProfileReview = z.infer<typeof ProfileReviewSchema>
export type ReviewInsights = z.infer<typeof ReviewInsightsSchema>
export type PhotoInsights = z.infer<typeof PhotoInsightsSchema>
export type ProblemsIdentified = z.infer<typeof ProblemsIdentifiedSchema>
export type OptimizationSuggestions = z.infer<typeof OptimizationSuggestionsSchema>
export type ReviewResponses = z.infer<typeof ReviewResponsesSchema>
export type NextSteps = z.infer<typeof NextStepsSchema>
