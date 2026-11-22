import { NextRequest, NextResponse } from "next/server";
import {
  verifyOAuthState,
  encryptSessionPayload,
} from "@/lib/security/oauth-state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Handle Google OAuth error from URL
  if (error) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(`Google authorization error: ${error}`)}`
    );
  }

  // 2. Validate CSRF State Parameter
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!state || !stateCookie || state !== stateCookie || !verifyOAuthState(state)) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(
        "CSRF validation failed: Invalid, tampered, or expired OAuth state parameter."
      )}`
    );
  }

  // 3. Retrieve PKCE Code Verifier from Cookie
  const codeVerifier = req.cookies.get("oauth_code_verifier")?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(
        "PKCE verification failed: Missing PKCE code verifier cookie in OAuth callback."
      )}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent("Missing authorization code from Google.")}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/google/callback";

  try {
    // 4. Exchange authorization code with Google OAuth token endpoint (including PKCE code_verifier)
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      let cleanErrMsg = `Token exchange failed with HTTP status ${tokenRes.status}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error_description) {
          cleanErrMsg += `: ${parsed.error_description}`;
        } else if (parsed.error) {
          cleanErrMsg += `: ${parsed.error}`;
        }
      } catch {
        if (errBody && errBody.length < 150) {
          cleanErrMsg += `: ${errBody}`;
        }
      }
      return NextResponse.redirect(
        `${appUrl}/?auth_error=${encodeURIComponent(cleanErrMsg)}`
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token; // Returned if access_type=offline and prompt=consent
    const expiresIn = Number(tokenData.expires_in) || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // 5. Encrypt session data (access token, refresh token, expiry) using AES-256-GCM
    const encryptedSession = encryptSessionPayload({
      accessToken,
      refreshToken,
      expiresAt,
      scope: tokenData.scope,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(`${appUrl}/?connection=live_success`);

    // 6. Set encrypted session cookie (accessible only server-side)
    const sessionMaxAge = refreshToken ? 30 * 24 * 60 * 60 : expiresIn; // 30 days if refresh token present
    response.cookies.set("gbp_session", encryptedSession, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });

    // 7. Set active access token cookie for immediate provider calls
    response.cookies.set("gbp_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    // 8. Clean up one-time CSRF state and PKCE cookies
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_code_verifier");

    return response;
  } catch (err: any) {
    const message = err?.message || "Internal server error during OAuth token exchange";
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(`Authentication failed: ${message}`)}`
    );
  }
}
