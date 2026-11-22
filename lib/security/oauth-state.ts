import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "branvidia_production_session_secret_min_32_bytes_long_key";

export interface OAuthStatePayload {
  nonce: string;
  createdAt: number;
}

/**
 * Generate a signed OAuth state token containing a random nonce and timestamp.
 */
export function generateOAuthState(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const createdAt = Date.now();
  const payload = JSON.stringify({ nonce, createdAt });
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const token = Buffer.from(JSON.stringify({ payload, hmac })).toString("base64url");
  return token;
}

/**
 * Verify a received OAuth state token against cryptographic signature and expiration.
 */
export function verifyOAuthState(stateToken: string): boolean {
  try {
    const raw = Buffer.from(stateToken, "base64url").toString("utf-8");
    const { payload, hmac } = JSON.parse(raw);

    const expectedHmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
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
    return false;
  }
}
