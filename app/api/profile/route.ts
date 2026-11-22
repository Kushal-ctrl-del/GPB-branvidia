import { NextRequest, NextResponse } from "next/server";
import { getGBPProvider } from "@/lib/adapters/provider-factory";
import { PartialBusinessIntake } from "@/lib/types/contracts";
import { resolveGoogleAccessToken } from "@/lib/security/token-manager";
import { LiveGoogleBusinessProfileAdapter } from "@/lib/adapters/gbp-live-adapter";

export const runtime = "nodejs";

async function handleProfileRequest(
  req: NextRequest,
  mode: "demo" | "live" | "customer",
  intake?: PartialBusinessIntake,
  targetLocationId?: string,
  action?: string
) {
  // Resolve Google OAuth access token with automatic lifecycle & refresh
  const sessionCookie = req.cookies.get("gbp_session")?.value;
  const tokenCookie = req.cookies.get("gbp_token")?.value;

  let activeToken: string | undefined = undefined;
  let refreshedSessionData: { newEncryptedSession?: string; newExpiresIn?: number } | null = null;

  if (mode === "live") {
    const resolution = await resolveGoogleAccessToken(sessionCookie, tokenCookie);
    if (!resolution.accessToken) {
      return NextResponse.json(
        {
          error: resolution.error || "UNAUTHENTICATED",
          message:
            resolution.errorMessage ||
            "No active Google OAuth session found. Please authenticate via Google OAuth or switch to Demo Profile.",
          dataSource: "LIVE_GOOGLE",
        },
        { status: 401 }
      );
    }
    activeToken = resolution.accessToken;
    if (resolution.refreshed && resolution.newEncryptedSession) {
      refreshedSessionData = {
        newEncryptedSession: resolution.newEncryptedSession,
        newExpiresIn: resolution.newExpiresIn,
      };
    }
  }

  // Handle location listing action
  if (mode === "live" && action === "locations") {
    try {
      const liveAdapter = new LiveGoogleBusinessProfileAdapter();
      const locations = await liveAdapter.listLocations(undefined, activeToken);
      const res = NextResponse.json({ ok: true, locations });
      if (refreshedSessionData?.newEncryptedSession) {
        res.cookies.set("gbp_session", refreshedSessionData.newEncryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
      return res;
    } catch (locErr: any) {
      return NextResponse.json(
        { error: "LOCATION_FETCH_FAILED", message: locErr?.message || "Failed to list Google locations." },
        { status: 502 }
      );
    }
  }

  const provider = getGBPProvider(mode, intake);

  try {
    const profile =
      provider instanceof LiveGoogleBusinessProfileAdapter
        ? await provider.getProfile(activeToken, targetLocationId)
        : await provider.getProfile(activeToken);

    const reviews = await provider.getReviews(profile.locationId, activeToken);
    const media = await provider.getMedia(profile.locationId, activeToken);

    const response = NextResponse.json({
      dataSource: profile.dataSource,
      providerName: provider.displayName,
      profile,
      reviews,
      media,
    });

    // If token was refreshed during resolution, persist updated session in cookies
    if (refreshedSessionData?.newEncryptedSession) {
      response.cookies.set("gbp_session", refreshedSessionData.newEncryptedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      if (activeToken) {
        response.cookies.set("gbp_token", activeToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: refreshedSessionData.newExpiresIn || 3600,
        });
      }
    }

    return response;
  } catch (providerError: any) {
    console.error(`Provider error (${mode}):`, providerError);

    return NextResponse.json(
      {
        error: "PROVIDER_ACCESS_ERROR",
        message: providerError?.message || "Failed to retrieve profile data from provider.",
        mode,
        canFallbackToDemo: mode === "live",
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") as "demo" | "live" | "customer") || "demo";
    const name = searchParams.get("name") || undefined;
    const category = searchParams.get("category") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const action = searchParams.get("action") || undefined;

    const intake: PartialBusinessIntake | undefined =
      name || category ? { businessName: name, category: category } : undefined;

    return await handleProfileRequest(req, mode, intake, locationId, action);
  } catch (error: any) {
    console.error("Unhandled error in GET /api/profile:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = (body.mode as "demo" | "live" | "customer") || "demo";
    const intake: PartialBusinessIntake | undefined = body.intake || undefined;
    const locationId = body.locationId || undefined;
    const action = body.action || undefined;

    return await handleProfileRequest(req, mode, intake, locationId, action);
  } catch (error: any) {
    console.error("Unhandled error in POST /api/profile:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
