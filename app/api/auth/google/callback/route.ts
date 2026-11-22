import { NextRequest, NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/security/oauth-state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle Google OAuth error
  if (error) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(`Google authorization error: ${error}`)}`
    );
  }

  // Validate state
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!state || !stateCookie || state !== stateCookie || !verifyOAuthState(state)) {
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(
        "CSRF validation failed: Invalid or expired OAuth state parameter."
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
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
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

    // Redirect to app with live connection confirmed
    const response = NextResponse.redirect(`${appUrl}/?connection=live_success`);

    // Store access token in HttpOnly secure session cookie
    response.cookies.set("gbp_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    // Clear state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (err: any) {
    const message = err?.message || "Internal server error during OAuth token exchange";
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(`Authentication failed: ${message}`)}`
    );
  }
}
