import {
  GoogleBusinessProfileProvider,
  NormalizedReview,
  NormalizedMediaAsset,
} from "./gbp-interface";
import { NormalizedBusinessProfile } from "../types/contracts";

export interface GoogleAccountSummary {
  name: string; // e.g., "accounts/12345678"
  accountName: string;
  type: string;
}

export interface GoogleLocationSummary {
  locationId: string; // e.g., "locations/87654321" or "accounts/123/locations/456"
  name: string;
  title: string;
  address?: string;
  primaryCategory?: string;
}

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

  /**
   * Test basic connectivity and permissions against Google Account Management API.
   */
  async testConnection(sessionToken?: string): Promise<{ ok: boolean; message: string }> {
    try {
      const token = this.getAccessToken(sessionToken);
      const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401) {
          return { ok: false, message: "Google OAuth session expired or was revoked. Please reconnect." };
        }
        if (res.status === 403) {
          return {
            ok: false,
            message:
              "Google Business Profile API access denied. Ensure the Google Business Profile APIs are enabled in your Google Cloud Console and your account has managerial access.",
          };
        }
        return {
          ok: false,
          message: `Google API returned HTTP ${res.status}: ${errorText.slice(0, 150)}`,
        };
      }

      return { ok: true, message: "Google API connection verified successfully." };
    } catch (err: any) {
      return { ok: false, message: err?.message || "Connection to Google APIs failed." };
    }
  }

  /**
   * Retrieve all accessible Google Business Profile accounts.
   */
  async listAccounts(sessionToken?: string): Promise<GoogleAccountSummary[]> {
    const token = this.getAccessToken(sessionToken);
    const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401) throw new Error("UNAUTHORIZED: Google session token expired.");
      if (res.status === 403) {
        throw new Error(
          "FORBIDDEN: Google Business Profile API access denied. Ensure API is enabled in your Google Cloud Project."
        );
      }
      throw new Error(`Google Accounts API error (${res.status}): ${err.slice(0, 150)}`);
    }

    const data = await res.json();
    return (data.accounts || []).map((acc: any) => ({
      name: acc.name,
      accountName: acc.accountName || "Google Business Account",
      type: acc.type || "PERSONAL",
    }));
  }

  /**
   * Retrieve all locations accessible under the given account (or the primary account).
   */
  async listLocations(
    accountName?: string,
    sessionToken?: string
  ): Promise<GoogleLocationSummary[]> {
    const token = this.getAccessToken(sessionToken);

    let targetAccount = accountName;
    if (!targetAccount) {
      const accounts = await this.listAccounts(sessionToken);
      if (!accounts.length) {
        throw new Error("NO_GBP_ACCOUNTS: No Google Business Profile accounts found under this Google user.");
      }
      targetAccount = accounts[0].name;
    }

    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${targetAccount}/locations?readMask=name,title,primaryCategory,storefrontAddress`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!locRes.ok) {
      const err = await locRes.text();
      throw new Error(`Google Business Information API error (${locRes.status}): ${err.slice(0, 150)}`);
    }

    const locData = await locRes.json();
    return (locData.locations || []).map((loc: any) => ({
      locationId: loc.name,
      name: loc.name,
      title: loc.title || "Business Location",
      primaryCategory: loc.primaryCategory?.displayName,
      address: loc.storefrontAddress?.locality
        ? `${loc.storefrontAddress.addressLines?.join(", ") || ""}, ${loc.storefrontAddress.locality}, ${loc.storefrontAddress.administrativeArea || ""}`
        : undefined,
    }));
  }

  /**
   * Fetch full profile for a specific location (or primary location).
   */
  async getProfile(
    sessionToken?: string,
    targetLocationId?: string
  ): Promise<NormalizedBusinessProfile> {
    const token = this.getAccessToken(sessionToken);

    let locationPath = targetLocationId;

    if (!locationPath) {
      // 1. Fetch Accounts
      const accounts = await this.listAccounts(sessionToken);
      if (!accounts.length) {
        throw new Error(
          "NO_GBP_ACCOUNTS: No Google Business Profile accounts found associated with this Google credential."
        );
      }

      // 2. Fetch Locations under primary account
      const locations = await this.listLocations(accounts[0].name, sessionToken);
      if (!locations.length) {
        throw new Error(
          "NO_GBP_LOCATIONS: No Google Business Profile locations found under this account. The business may be unverified or in pending status."
        );
      }
      locationPath = locations[0].locationId;
    }

    // 3. Fetch specific location details
    const res = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationPath}?readMask=name,title,primaryCategory,additionalCategories,storefrontAddress,websiteUri,phoneNumbers,regularHours,profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Business Information API error (${res.status}): ${err.slice(0, 150)}`);
    }

    const location = await res.json();

    // Determine missing profile gaps
    const missing: string[] = [];
    if (!location.websiteUri) missing.push("websiteUrl (Missing Website)");
    if (!location.profile?.description) missing.push("description (Missing Description)");
    if (!location.phoneNumbers?.primaryPhone) missing.push("phoneNumber (Missing Primary Phone)");
    if (!location.regularHours) missing.push("regularHours (Missing Business Hours)");

    // Retrieve live reviews and media to compute genuine metrics (avoiding hardcoded zeros)
    let fetchedReviews: NormalizedReview[] = [];
    let fetchedMedia: NormalizedMediaAsset[] = [];

    try {
      fetchedReviews = await this.getReviews(location.name || locationPath, sessionToken);
    } catch (reviewErr) {
      console.warn("[gbp-live-adapter] Could not retrieve reviews:", reviewErr);
    }

    try {
      fetchedMedia = await this.getMedia(location.name || locationPath, sessionToken);
    } catch (mediaErr) {
      console.warn("[gbp-live-adapter] Could not retrieve media:", mediaErr);
    }

    const totalReviews = fetchedReviews.length;
    const totalStars = fetchedReviews.reduce((sum, r) => sum + r.starRating, 0);
    const averageRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 0;
    const repliedCount = fetchedReviews.filter((r) => Boolean(r.reviewReply)).length;
    const responseRate = totalReviews > 0 ? Number(((repliedCount / totalReviews) * 100).toFixed(1)) : 0;

    return {
      dataSource: "LIVE_GOOGLE",
      locationId: location.name || locationPath,
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
        reviewCount: totalReviews,
        averageRating,
        photosCount: fetchedMedia.length,
        responseRatePercent: responseRate,
      },
      missingFields: missing,
      reviewSource: totalReviews > 0 ? "live" : "none",
    };
  }

  /**
   * Retrieve live reviews for a location with pagination support.
   */
  async getReviews(locationId: string, sessionToken?: string): Promise<NormalizedReview[]> {
    const token = this.getAccessToken(sessionToken);
    const allReviews: NormalizedReview[] = [];
    let pageToken: string | undefined = undefined;
    let pagesFetched = 0;
    const maxPages = 2; // Up to 100 reviews to respect rate limits

    do {
      const url = new URL(`https://mybusiness.googleapis.com/v4/${locationId}/reviews`);
      url.searchParams.set("pageSize", "50");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // If Reviews API is restricted or location has no review capability, return whatever we have
        if (res.status === 404 || res.status === 403) {
          console.warn(`[gbp-live-adapter] Reviews API returned HTTP ${res.status}`);
          break;
        }
        const err = await res.text();
        throw new Error(`Google Reviews API error (${res.status}): ${err.slice(0, 150)}`);
      }

      const data = await res.json();
      const pageReviews = (data.reviews || []).map((r: any) => ({
        reviewId: r.reviewId || String(Math.random()),
        authorName: r.reviewer?.displayName || "Google User",
        authorPhotoUrl: r.reviewer?.profilePhotoUrl,
        starRating:
          r.starRating === "FIVE"
            ? 5
            : r.starRating === "FOUR"
            ? 4
            : r.starRating === "THREE"
            ? 3
            : r.starRating === "TWO"
            ? 2
            : 1,
        comment: r.comment || "",
        createTime: r.createTime || new Date().toISOString(),
        updateTime: r.updateTime,
        reviewReply: r.reviewReply
          ? {
              comment: r.reviewReply.comment,
              updateTime: r.reviewReply.updateTime,
            }
          : undefined,
        source: "LIVE_GOOGLE" as const,
      }));

      allReviews.push(...pageReviews);
      pageToken = data.nextPageToken;
      pagesFetched++;
    } while (pageToken && pagesFetched < maxPages);

    return allReviews;
  }

  /**
   * Retrieve media items for a location with pagination support.
   */
  async getMedia(locationId: string, sessionToken?: string): Promise<NormalizedMediaAsset[]> {
    const token = this.getAccessToken(sessionToken);
    const allMedia: NormalizedMediaAsset[] = [];
    let pageToken: string | undefined = undefined;
    let pagesFetched = 0;
    const maxPages = 2; // Up to 100 media assets

    do {
      const url = new URL(`https://mybusiness.googleapis.com/v4/${locationId}/media`);
      url.searchParams.set("pageSize", "50");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          console.warn(`[gbp-live-adapter] Media API returned HTTP ${res.status}`);
          break;
        }
        const err = await res.text();
        throw new Error(`Google Media API error (${res.status}): ${err.slice(0, 150)}`);
      }

      const data = await res.json();
      const pageMedia = (data.mediaItems || []).map((m: any) => {
        let rawCat = m.locationAssociation?.category || "ADDITIONAL";
        if (rawCat === "LOGO") rawCat = "PROFILE";

        return {
          mediaId: m.name || String(Math.random()),
          mediaFormat: (m.mediaFormat === "VIDEO" ? "VIDEO" : "PHOTO") as "PHOTO" | "VIDEO",
          category: rawCat as any,
          googleUrl: m.googleUrl || "",
          thumbnailUrl: m.thumbnailUrl || m.googleUrl,
          createTime: m.createTime || new Date().toISOString(),
          dimensions: m.dimensions,
          description: m.description,
          source: "LIVE_GOOGLE" as const,
        };
      });

      allMedia.push(...pageMedia);
      pageToken = data.nextPageToken;
      pagesFetched++;
    } while (pageToken && pagesFetched < maxPages);

    return allMedia;
  }
}
