import { decryptSessionPayload, encryptSessionPayload, GoogleSessionData } from "./oauth-state";

export interface TokenResolutionResult {
  accessToken: string | null;
  error?: "NO_SESSION" | "SESSION_EXPIRED_NO_REFRESH" | "REFRESH_FAILED" | "SECURITY_ERROR";
  errorMessage?: string;
  refreshed?: boolean;
  newEncryptedSession?: string;
  newExpiresIn?: number;
}

/**
 * Resolves an active Google access token from encrypted session cookie or raw token.
 * Automatically refreshes the access token if it has expired (or will expire in <60 seconds)
 * using the securely stored refresh token.
 */
export async function resolveGoogleAccessToken(
  encryptedSessionCookie?: string,
  rawTokenCookie?: string
): Promise<TokenResolutionResult> {
  // 1. If encrypted session cookie exists, decrypt and evaluate lifecycle
  if (encryptedSessionCookie) {
    const session = decryptSessionPayload(encryptedSessionCookie);
    if (!session) {
      return {
        accessToken: null,
        error: "SECURITY_ERROR",
        errorMessage: "Failed to decrypt session cookie. Session may have been tampered with or key was rotated.",
      };
    }

    const now = Date.now();
    const isExpiredOrImminent = session.expiresAt - now < 60_000; // Less than 60s remaining

    // If still valid, return current access token
    if (!isExpiredOrImminent) {
      return { accessToken: session.accessToken };
    }

    // Access token is expired; attempt refresh if refresh token is available
    if (session.refreshToken) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          accessToken: null,
          error: "REFRESH_FAILED",
          errorMessage: "Google OAuth credentials not configured on server to perform token refresh.",
        };
      }

      try {
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: session.refreshToken,
          }),
        });

        if (!refreshRes.ok) {
          const errText = await refreshRes.text();
          console.warn("[token-manager] Refresh token exchange failed:", refreshRes.status, errText.slice(0, 150));
          return {
            accessToken: null,
            error: "REFRESH_FAILED",
            errorMessage: "Google refresh token is expired or has been revoked. Please reconnect your account.",
          };
        }

        const refreshedData = await refreshRes.json();
        const newAccessToken = refreshedData.access_token;
        const newExpiresIn = Number(refreshedData.expires_in) || 3600;
        const newExpiresAt = Date.now() + newExpiresIn * 1000;

        const updatedSession: GoogleSessionData = {
          ...session,
          accessToken: newAccessToken,
          expiresAt: newExpiresAt,
        };

        const newEncryptedSession = encryptSessionPayload(updatedSession);

        return {
          accessToken: newAccessToken,
          refreshed: true,
          newEncryptedSession,
          newExpiresIn,
        };
      } catch (refreshErr: any) {
        return {
          accessToken: null,
          error: "REFRESH_FAILED",
          errorMessage: `Token refresh network error: ${refreshErr?.message || "Unknown error"}`,
        };
      }
    }

    // No refresh token available and access token expired
    return {
      accessToken: null,
      error: "SESSION_EXPIRED_NO_REFRESH",
      errorMessage: "Google session has expired and no refresh token was granted. Please reconnect.",
    };
  }

  // 2. Fall back to raw access token cookie if encrypted session is not present
  if (rawTokenCookie) {
    return { accessToken: rawTokenCookie };
  }

  // 3. Fall back to GOOGLE_ACCESS_TOKEN env var (for local/testing overrides)
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return { accessToken: process.env.GOOGLE_ACCESS_TOKEN };
  }

  return {
    accessToken: null,
    error: "NO_SESSION",
    errorMessage: "No active Google OAuth session found.",
  };
}
