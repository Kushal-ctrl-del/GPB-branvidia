import { NextRequest, NextResponse } from "next/server";
import { getGBPProvider } from "@/lib/adapters/provider-factory";
import { PartialBusinessIntake } from "@/lib/types/contracts";

export const runtime = "nodejs";

async function handleProfileRequest(
  mode: "demo" | "live" | "customer",
  intake: PartialBusinessIntake | undefined,
  sessionToken: string | undefined
) {
  const provider = getGBPProvider(mode, intake);

  // If live mode requested but no session token is present
  if (mode === "live" && !sessionToken) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message:
          "No active Google OAuth session found. Please authenticate via Google OAuth or switch to Demo Profile.",
        dataSource: "LIVE_GOOGLE",
      },
      { status: 401 }
    );
  }

  try {
    const profile = await provider.getProfile(sessionToken);
    const reviews = await provider.getReviews(profile.locationId, sessionToken);
    const media = await provider.getMedia(profile.locationId, sessionToken);

    return NextResponse.json({
      dataSource: profile.dataSource,
      providerName: provider.displayName,
      profile,
      reviews,
      media,
    });
  } catch (providerError: any) {
    console.error(`Provider error (${mode}):`, providerError);

    return NextResponse.json(
      {
        error: "PROVIDER_ACCESS_ERROR",
        message: providerError.message || "Failed to retrieve profile data from provider.",
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
    const sessionToken = req.cookies.get("gbp_token")?.value;

    const intake: PartialBusinessIntake | undefined =
      name || category ? { businessName: name, category: category } : undefined;

    return await handleProfileRequest(mode, intake, sessionToken);
  } catch (error: any) {
    console.error("Unhandled error in GET /api/profile:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = (body.mode as "demo" | "live" | "customer") || "demo";
    const intake: PartialBusinessIntake | undefined = body.intake || undefined;
    const sessionToken = req.cookies.get("gbp_token")?.value;

    return await handleProfileRequest(mode, intake, sessionToken);
  } catch (error: any) {
    console.error("Unhandled error in POST /api/profile:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
