import crypto from "crypto";

/**
 * Validates and retrieves the required SESSION_SECRET from the server environment.
 * FAILS CLOSED: Never falls back to hardcoded keys.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "SESSION_SECRET_INVALID: Environment variable SESSION_SECRET must be configured and at least 32 characters long."
    );
  }
  return secret.trim();
}

export interface OAuthStatePayload {
  nonce: string;
  createdAt: number;
}

/**
 * Generate a signed OAuth state token containing a random nonce and timestamp.
 * Used strictly for CSRF protection during OAuth flows.
 */
export function generateOAuthState(): string {
  const secret = getSessionSecret();
  const nonce = crypto.randomBytes(16).toString("hex");
  const createdAt = Date.now();
  const payload = JSON.stringify({ nonce, createdAt });
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hmac })).toString("base64url");
}

/**
 * Verify a received OAuth state token against cryptographic signature and expiration.
 * Fails closed if the secret is missing/invalid, signature mismatch, or expired (>15 min).
 */
export function verifyOAuthState(stateToken: string): boolean {
  try {
    const secret = getSessionSecret();
    const raw = Buffer.from(stateToken, "base64url").toString("utf-8");
    const { payload, hmac } = JSON.parse(raw);

    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return false;
    }

    const { createdAt } = JSON.parse(payload) as OAuthStatePayload;
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    // Reject expired state (older than 15 minutes)
    if (now - createdAt > fifteenMinutes) {
      return false;
    }

    return true;
  } catch (e) {
    // Fail closed on any decryption, parsing, or configuration error
    return false;
  }
}

// ============================================================================
// OAUTH PKCE (RFC 7636) IMPLEMENTATION
// ============================================================================

/**
 * Generates a high-entropy cryptographic code verifier.
 * Complies with RFC 7636: unreserved URL characters, length between 43 and 128 chars.
 */
export function generateCodeVerifier(): string {
  // 32 random bytes converted to base64url yields 43 characters
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generates the SHA-256 code challenge for a given code verifier.
 * Method: S256 (Base64URL-encoded SHA-256 hash)
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Validates a code verifier against an expected code challenge using timing-safe comparison.
 */
export function verifyCodeChallenge(verifier: string, expectedChallenge: string): boolean {
  try {
    const actualChallenge = generateCodeChallenge(verifier);
    return crypto.timingSafeEqual(
      Buffer.from(actualChallenge),
      Buffer.from(expectedChallenge)
    );
  } catch {
    return false;
  }
}

// ============================================================================
// ENCRYPTED SESSION STORAGE (AES-256-GCM)
// Used for server-side encrypted cookies (e.g., refresh tokens at rest)
// ============================================================================

export interface GoogleSessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in ms
  scope?: string;
  selectedLocationId?: string;
}

/**
 * Encrypt a session payload using AES-256-GCM with a key derived from SESSION_SECRET.
 * Tokens are NEVER stored as plain text, even in HttpOnly cookies.
 */
export function encryptSessionPayload(data: GoogleSessionData): string {
  const secret = getSessionSecret();
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const plaintext = JSON.stringify(data);
  let ciphertext = cipher.update(plaintext, "utf8", "base64url");
  ciphertext += cipher.final("base64url");
  const authTag = cipher.getAuthTag().toString("base64url");

  // Format: iv.authTag.ciphertext
  return `${iv.toString("base64url")}.${authTag}.${ciphertext}`;
}

/**
 * Decrypt an AES-256-GCM encrypted session payload.
 * Returns null if authentication tag check fails or data is invalid.
 */
export function decryptSessionPayload(encryptedToken: string): GoogleSessionData | null {
  try {
    const secret = getSessionSecret();
    const key = crypto.createHash("sha256").update(secret).digest();
    const parts = encryptedToken.split(".");
    if (parts.length !== 3) return null;

    const [ivB64, tagB64, cipherB64] = parts;
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(cipherB64, "base64url", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as GoogleSessionData;
  } catch (err) {
    return null;
  }
}
