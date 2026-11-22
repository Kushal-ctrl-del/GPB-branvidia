import { NextRequest, NextResponse } from "next/server";
import {
  generateOAuthState,
  generateCodeVerifier,
  generateCodeChallenge,
  getSessionSecret,
} from "@/lib/security/oauth-state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // 1. Fail closed if SESSION_SECRET is missing or insufficiently long
  try {
    getSessionSecret();
  } catch (secErr: any) {
    console.error("[auth/google/start] Security configuration error: SESSION_SECRET is missing or invalid.");
    return NextResponse.json(
      {
        error: "SECURITY_CONFIGURATION_ERROR",
        message:
          "The authentication service is temporarily unavailable due to a server security configuration issue. Please ensure SESSION_SECRET is configured.",
      },
      { status: 500 }
    );
  }

  // 2. Validate Google OAuth Client ID
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

  // 3. Generate CSRF State & PKCE Code Verifier / Challenge
  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/business.manage openid email profile"
  );

  // 4. Construct RFC 7636 compliant Google Authorization URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${encodeURIComponent(
    state
  )}&code_challenge=${encodeURIComponent(
    codeChallenge
  )}&code_challenge_method=S256&access_type=offline&prompt=consent`;

  const response = NextResponse.redirect(googleAuthUrl);

  const isProduction = process.env.NODE_ENV === "production";

  // 5. Store CSRF state in secure HttpOnly cookie
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  // 6. Store PKCE code verifier in secure HttpOnly cookie
  response.cookies.set("oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  return response;
}
