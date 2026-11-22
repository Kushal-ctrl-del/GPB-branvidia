import {
  GoogleBusinessProfileProvider,
  NormalizedReview,
  NormalizedMediaAsset,
} from "./gbp-interface";
import { NormalizedBusinessProfile } from "../types/contracts";

export class LiveGoogleBusinessProfileAdapter implements GoogleBusinessProfileProvider {
  name: "live" = "live";
  displayName = "Live Google Business Profile API (OAuth 2.0)";

  private getAccessToken(token?: string): string {
    const accessToken = token || process.env.GOOGLE_ACCESS_TOKEN || "";
    if (!accessToken) {
      throw new Error(
        "NO_LIVE_TOKEN: No active Google OAuth access token found in session. Please connect your Google account."
      );
    }
    return accessToken;
  }

  async testConnection(sessionToken?: string): Promise<{ ok: boolean; message: string }> {
    try {
      const token = this.getAccessToken(sessionToken);
      // Query Google Account Management API
      const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          ok: false,
          message: `Google API returned ${res.status}: ${errorText}`,
        };
      }

      return { ok: true, message: "Google API connection verified." };
    } catch (err: any) {
      return { ok: false, message: err.message || "Connection failed." };
    }
  }

  async getProfile(sessionToken?: string): Promise<NormalizedBusinessProfile> {
    const token = this.getAccessToken(sessionToken);

    // 1. Fetch Accounts
    const accRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!accRes.ok) {
      const err = await accRes.text();
      throw new Error(`Google Account Management API error (${accRes.status}): ${err}`);
    }

    const accData = await accRes.json();
    const account = accData.accounts?.[0];
    if (!account) {
      throw new Error("No Google Business accounts found associated with this Google credential.");
    }

    // 2. Fetch Locations
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,primaryCategory,additionalCategories,storefrontAddress,websiteUri,phoneNumbers,regularHours,profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!locRes.ok) {
      const err = await locRes.text();
      throw new Error(`Google Business Information API error (${locRes.status}): ${err}`);
    }

    const locData = await locRes.json();
    const location = locData.locations?.[0];
    if (!location) {
      throw new Error("No Google Business Profile locations found under this account.");
    }

    // Determine missing fields
    const missing: string[] = [];
    if (!location.websiteUri) missing.push("websiteUrl");
    if (!location.profile?.description) missing.push("description");
    if (!location.phoneNumbers?.primaryPhone) missing.push("phoneNumber");
    if (!location.regularHours) missing.push("regularHours");

    return {
      dataSource: "LIVE_GOOGLE",
      locationId: location.name || "live_loc_unknown",
      name: location.title || "Business Profile",
      primaryCategory: location.primaryCategory?.displayName || "Uncategorized",
      additionalCategories:
        location.additionalCategories?.map((c: any) => c.displayName) || [],
      address: {
        street: location.storefrontAddress?.addressLines?.join(", ") || "",
        city: location.storefrontAddress?.locality || "",
        state: location.storefrontAddress?.administrativeArea || "",
        postalCode: location.storefrontAddress?.postalCode || "",
        country: location.storefrontAddress?.regionCode || "US",
      },
      phoneNumber: location.phoneNumbers?.primaryPhone || null,
      websiteUrl: location.websiteUri || null,
      description: location.profile?.description || null,
      metrics: {
        reviewCount: 0,
        averageRating: 0,
        photosCount: 0,
        responseRatePercent: 0,
      },
      missingFields: missing,
    };
  }

  async getReviews(locationId: string, sessionToken?: string): Promise<NormalizedReview[]> {
    const token = this.getAccessToken(sessionToken);
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews?pageSize=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Reviews API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const reviews: NormalizedReview[] = (data.reviews || []).map((r: any) => ({
      reviewId: r.reviewId || String(Math.random()),
      authorName: r.reviewer?.displayName || "Google Reviewer",
      authorPhotoUrl: r.reviewer?.profilePhotoUrl,
      starRating: r.starRating === "FIVE" ? 5 : r.starRating === "FOUR" ? 4 : r.starRating === "THREE" ? 3 : r.starRating === "TWO" ? 2 : 1,
      comment: r.comment || "",
      createTime: r.createTime || new Date().toISOString(),
      updateTime: r.updateTime,
      reviewReply: r.reviewReply
        ? {
            comment: r.reviewReply.comment,
            updateTime: r.reviewReply.updateTime,
          }
        : undefined,
    }));

    return reviews;
  }

  async getMedia(locationId: string, sessionToken?: string): Promise<NormalizedMediaAsset[]> {
    const token = this.getAccessToken(sessionToken);
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/media?pageSize=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Media API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const media: NormalizedMediaAsset[] = (data.mediaItems || []).map((m: any) => ({
      mediaId: m.name || String(Math.random()),
      mediaFormat: m.mediaFormat || "PHOTO",
      category: m.locationAssociation?.category || "ADDITIONAL",
      googleUrl: m.googleUrl || "",
      thumbnailUrl: m.thumbnailUrl || m.googleUrl,
      createTime: m.createTime || new Date().toISOString(),
      dimensions: m.dimensions,
      description: m.description,
    }));

    return media;
  }
}
