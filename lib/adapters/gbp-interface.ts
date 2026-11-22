import { z } from "zod";
import { NormalizedBusinessProfile } from "../types/contracts";

// Review schema
export const NormalizedReviewSchema = z.object({
  reviewId: z.string(),
  authorName: z.string(),
  authorPhotoUrl: z.string().optional(),
  starRating: z.number().min(1).max(5),
  comment: z.string(),
  createTime: z.string(),
  updateTime: z.string().optional(),
  reviewReply: z
    .object({
      comment: z.string(),
      updateTime: z.string(),
    })
    .optional(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).optional(),
  source: z.enum(["LIVE_GOOGLE", "CUSTOMER_PROVIDED", "SIMULATED_DEMO"]).optional(),
  isDemo: z.boolean().optional(),
});
export type NormalizedReview = z.infer<typeof NormalizedReviewSchema>;

// Photo / Media asset schema
export const NormalizedMediaAssetSchema = z.object({
  mediaId: z.string(),
  mediaFormat: z.enum(["PHOTO", "VIDEO"]),
  category: z.enum([
    "COVER",
    "PROFILE", // Logo
    "INTERIOR",
    "EXTERIOR",
    "PRODUCT",
    "FOOD_AND_DRINK",
    "AT_WORK", // Team
    "ADDITIONAL",
  ]),
  googleUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  createTime: z.string(),
  dimensions: z
    .object({
      widthPixels: z.number(),
      heightPixels: z.number(),
    })
    .optional(),
  description: z.string().optional(),
  source: z.enum(["LIVE_GOOGLE", "CUSTOMER_UPLOADED", "SIMULATED_DEMO"]).optional(),
});
export type NormalizedMediaAsset = z.infer<typeof NormalizedMediaAssetSchema>;

// Common Provider Interface
export interface GoogleBusinessProfileProvider {
  name: "live" | "demo" | "customer";
  displayName: string;
  getProfile(sessionToken?: string): Promise<NormalizedBusinessProfile>;
  getReviews(locationId: string, sessionToken?: string): Promise<NormalizedReview[]>;
  getMedia(locationId: string, sessionToken?: string): Promise<NormalizedMediaAsset[]>;
  testConnection(sessionToken?: string): Promise<{ ok: boolean; message: string }>;
}
