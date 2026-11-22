import { z } from "zod";

// =================================================================
// 1. DATA PROVENANCE LABELS
// =================================================================

export const ProvenanceLabelSchema = z.enum([
  "CUSTOMER_PROVIDED",
  "LIVE_GOOGLE",
  "CUSTOMER_UPLOADED",
  "LINK_RETRIEVED",
  "SIMULATED_DEMO",
  "DETERMINISTIC_CALCULATION",
  "AI_SYNTHESIZED",
]);

export type ProvenanceLabel = z.infer<typeof ProvenanceLabelSchema>;

// =================================================================
// 2. BUSINESS ADDRESS & SOCIAL LINKS
// =================================================================

export const BusinessAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().default("Local City"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("United States"),
});

export type BusinessAddress = z.infer<typeof BusinessAddressSchema>;

export const BusinessSocialLinksSchema = z.object({
  websiteUrl: z.string().optional(),
  googleBusinessProfileUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  otherUrl: z.string().optional(),
});

export type BusinessSocialLinks = z.infer<typeof BusinessSocialLinksSchema>;

// =================================================================
// 3. PHOTO UPLOAD SCHEMA
// =================================================================

export const PhotoCategorySchema = z.enum([
  "COVER",
  "PROFILE", // Logo
  "INTERIOR",
  "EXTERIOR",
  "PRODUCT",
  "FOOD_AND_DRINK",
  "AT_WORK", // Team
  "ADDITIONAL",
]);

export type PhotoCategory = z.infer<typeof PhotoCategorySchema>;

export const CustomerUploadedPhotoSchema = z.object({
  id: z.string(),
  previewUrl: z.string(),
  fileName: z.string(),
  fileSize: z.number(), // in bytes
  mimeType: z.string(),
  category: PhotoCategorySchema,
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  uploadedAt: z.string().datetime(),
  provenance: z.literal("CUSTOMER_UPLOADED").default("CUSTOMER_UPLOADED"),
});

export type CustomerUploadedPhoto = z.infer<typeof CustomerUploadedPhotoSchema>;

// =================================================================
// 4. CUSTOMER-PROVIDED REVIEW SCHEMA
// =================================================================

export const CustomerReviewInputSchema = z.object({
  reviewId: z.string(),
  authorName: z.string().min(1, "Author name is required"),
  starRating: z.number().min(1).max(5),
  comment: z.string(),
  createTime: z.string(),
  reviewReply: z
    .object({
      comment: z.string(),
      updateTime: z.string(),
    })
    .optional(),
  source: z.literal("CUSTOMER_PROVIDED").default("CUSTOMER_PROVIDED"),
});

export type CustomerReviewInput = z.infer<typeof CustomerReviewInputSchema>;

// =================================================================
// 5. BUSINESS INTAKE & ONBOARDING SCHEMAS
// =================================================================

export const BusinessIntakeSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  category: z.string().min(1, "Category is required"),
  productsServices: z.array(z.string()).min(1, "At least one product or service is required"),
  targetCustomers: z.string().min(1, "Target customers description is required"),
  businessGoals: z.array(z.string()).min(1, "At least one business goal is required"),
  description: z.string().optional(),
  address: BusinessAddressSchema.optional(),
  phoneNumber: z.string().optional(),
  websiteUrl: z.string().optional(),
  socialLinks: BusinessSocialLinksSchema.optional(),
  reviewSource: z.enum(["live", "customer_provided", "demo", "none"]).optional(),
  uploadedPhotos: z.array(CustomerUploadedPhotoSchema).optional(),
  customerReviews: z.array(CustomerReviewInputSchema).optional(),
});

export type BusinessIntake = z.infer<typeof BusinessIntakeSchema>;

// Partial intake during onboarding
export const PartialBusinessIntakeSchema = BusinessIntakeSchema.partial();
export type PartialBusinessIntake = z.infer<typeof PartialBusinessIntakeSchema>;

// =================================================================
// 6. CHAT & MESSAGE SCHEMAS
// =================================================================

export const ChatMessageRoleSchema = z.enum(["user", "assistant", "system"]);
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatMessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
  metadata: z.object({
    suggestedActions: z.array(z.string()).optional(),
    extractedIntake: PartialBusinessIntakeSchema.optional(),
    isComplete: z.boolean().optional(),
    isFallback: z.boolean().optional(),
  }).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: ChatMessageRoleSchema,
      content: z.string(),
    })
  ),
  currentIntake: PartialBusinessIntakeSchema.optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// =================================================================
// 7. NORMALIZED PROFILE SCHEMA
// =================================================================

export const NormalizedProfileSchema = z.object({
  dataSource: z.enum(["LIVE_GOOGLE", "VERIFIED_DEMO", "CUSTOMER_PROVIDED"]),
  locationId: z.string(),
  name: z.string(),
  primaryCategory: z.string(),
  additionalCategories: z.array(z.string()),
  address: z.object({
    street: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string(),
  }),
  phoneNumber: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  description: z.string().nullable(),
  regularHours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        isClosed: z.boolean(),
      })
    )
    .optional(),
  socialLinks: BusinessSocialLinksSchema.optional(),
  metrics: z.object({
    reviewCount: z.number(),
    averageRating: z.number(),
    photosCount: z.number(),
    responseRatePercent: z.number(),
  }),
  missingFields: z.array(z.string()),
  reviewSource: z.enum(["live", "customer_provided", "demo", "none"]).optional(),
});

export type NormalizedBusinessProfile = z.infer<typeof NormalizedProfileSchema>;
