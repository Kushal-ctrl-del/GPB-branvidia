import { NextRequest, NextResponse } from "next/server";
import { generateOAuthState } from "@/lib/security/oauth-state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/google/callback";

  if (!clientId) {
    return NextResponse.json(
      {
        error: "GOOGLE_OAUTH_NOT_CONFIGURED",
        message:
          "Google Client ID is not configured in environment variables. Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or use Demo Profile.",
      },
      { status: 400 }
    );
  }

  const state = generateOAuthState();
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/business.manage openid email profile"
  );

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;

  const response = NextResponse.redirect(googleAuthUrl);

  // Set secure state cookie
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  return response;
}
