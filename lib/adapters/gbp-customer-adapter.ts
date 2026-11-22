import {
  GoogleBusinessProfileProvider,
  NormalizedReview,
  NormalizedMediaAsset,
} from "./gbp-interface";
import {
  NormalizedBusinessProfile,
  PartialBusinessIntake,
  CustomerUploadedPhoto,
  CustomerReviewInput,
} from "../types/contracts";

export class CustomerDirectBusinessProfileAdapter implements GoogleBusinessProfileProvider {
  name: "customer" = "customer";
  displayName = "Customer-Provided Business Assets";
  private intake: PartialBusinessIntake;

  constructor(intake?: PartialBusinessIntake) {
    this.intake = intake || {
      businessName: "My Local Business",
      category: "Local Business",
      productsServices: ["Core Service"],
      targetCustomers: "Local community",
      businessGoals: ["Grow online presence"],
    };
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: "Customer assets loaded successfully." };
  }

  async getProfile(): Promise<NormalizedBusinessProfile> {
    const reviews = await this.getReviews();
    const media = await this.getMedia();

    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (reviews.reduce((acc, r) => acc + r.starRating, 0) / reviewCount) * 10
          ) / 10
        : 0;
    const repliedCount = reviews.filter((r) => Boolean(r.reviewReply)).length;
    const responseRatePercent =
      reviewCount > 0 ? Math.round((repliedCount / reviewCount) * 100) : 0;

    // Detect actual missing fields
    const missingFields: string[] = [];
    if (!this.intake.websiteUrl) missingFields.push("websiteUrl");
    if (!this.intake.description || this.intake.description.length < 250) {
      missingFields.push(
        `description_length_suboptimal (${this.intake.description?.length || 0}/750 chars)`
      );
    }
    if (!this.intake.socialLinks?.googleBusinessProfileUrl) {
      missingFields.push("appointment_or_booking_link");
    }
    const interiorPhotos = media.filter((m) => m.category === "INTERIOR").length;
    if (interiorPhotos < 3) {
      missingFields.push(`interior_photo_coverage_low (only ${interiorPhotos} interior shot)`);
    }

    const profile: NormalizedBusinessProfile = {
      dataSource: "CUSTOMER_PROVIDED",
      locationId: `loc_cust_${Date.now()}`,
      name: this.intake.businessName || "My Business",
      primaryCategory: this.intake.category || "General Business",
      additionalCategories: [],
      address: {
        street: this.intake.address?.street,
        city: this.intake.address?.city || "Local City",
        state: this.intake.address?.state,
        postalCode: this.intake.address?.postalCode,
        country: this.intake.address?.country || "United States",
      },
      phoneNumber: this.intake.phoneNumber || null,
      websiteUrl: this.intake.websiteUrl || null,
      description: this.intake.description || null,
      socialLinks: this.intake.socialLinks,
      regularHours: [
        { day: "MONDAY", open: "08:00", close: "18:00", isClosed: false },
        { day: "TUESDAY", open: "08:00", close: "18:00", isClosed: false },
        { day: "WEDNESDAY", open: "08:00", close: "18:00", isClosed: false },
        { day: "THURSDAY", open: "08:00", close: "18:00", isClosed: false },
        { day: "FRIDAY", open: "08:00", close: "18:00", isClosed: false },
        { day: "SATURDAY", open: "09:00", close: "17:00", isClosed: false },
        { day: "SUNDAY", open: "10:00", close: "15:00", isClosed: false },
      ],
      metrics: {
        reviewCount,
        averageRating: avgRating,
        photosCount: media.length,
        responseRatePercent,
      },
      missingFields,
      reviewSource: this.intake.reviewSource || (reviewCount > 0 ? "customer_provided" : "none"),
    };

    return profile;
  }

  async getReviews(): Promise<NormalizedReview[]> {
    const raw = this.intake.customerReviews || [];
    return raw.map((r) => ({
      reviewId: r.reviewId,
      authorName: r.authorName,
      starRating: r.starRating,
      comment: r.comment,
      createTime: r.createTime,
      reviewReply: r.reviewReply,
      sentiment: r.starRating >= 4 ? "POSITIVE" : r.starRating === 3 ? "NEUTRAL" : "NEGATIVE",
      source: "CUSTOMER_PROVIDED",
      isDemo: false,
    }));
  }

  async getMedia(): Promise<NormalizedMediaAsset[]> {
    const raw = this.intake.uploadedPhotos || [];
    return raw.map((p) => ({
      mediaId: p.id,
      mediaFormat: "PHOTO",
      category: p.category,
      googleUrl: p.previewUrl,
      thumbnailUrl: p.previewUrl,
      previewUrl: p.previewUrl,
      fileName: p.fileName,
      fileSize: p.fileSize,
      createTime: p.uploadedAt,
      dimensions: p.width && p.height ? { widthPixels: p.width, heightPixels: p.height } : undefined,
      description: p.description,
      source: "CUSTOMER_UPLOADED",
    }));
  }
}
