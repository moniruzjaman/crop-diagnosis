/**
 * HMAC Request Signing — Server-side verification.
 *
 * Prevents external callers from abusing API endpoints.
 * The signing secret is automatically derived from the Turso
 * credentials that are already configured — NO extra env vars needed.
 *
 * Token design:
 *   - Tokens are NOT bound to origin (removes cross-request origin mismatch)
 *   - CORS already validates which origins can call our endpoints
 *   - Token proves: "I was issued by this server, within the last 2 hours"
 *   - This is sufficient to block drive-by abuse from external sites
 *
 * Flow:
 *   1. Frontend calls /api/signing-token to get a signed token
 *   2. Frontend includes this token in X-Request-Signature header
 *   3. API routes verify the token before processing
 */

import crypto from "crypto";

// Cached signing secret — derived once per cold start, then reused
let _cachedSecret = null;

/**
 * Derives a stable HMAC signing secret from existing environment variables.
 *
 * Priority: Turso → AI API keys → fixed dev salt.
 * All sources are stable across serverless cold starts.
 */
function getSigningSecret() {
  if (_cachedSecret) return _cachedSecret;

  // Primary: derive from Turso credentials
  const tursoUrl = process.env.TURSO_DATABASE_URL || "";
  const tursoToken = process.env.TURSO_AUTH_TOKEN || "";

  if (tursoUrl && tursoToken) {
    _cachedSecret = crypto
      .createHmac("sha256", "cabi-signing-v1")
      .update(`${tursoUrl}|${tursoToken}`)
      .digest("hex");
    return _cachedSecret;
  }

  // Fallback: derive from AI API keys
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GROQ_API_KEY,
    process.env.OPENROUTER_API_KEY,
  ].filter(Boolean);

  if (keys.length > 0) {
    _cachedSecret = crypto
      .createHmac("sha256", "cabi-signing-v1-fallback")
      .update(keys.join("|"))
      .digest("hex");
    return _cachedSecret;
  }

  // Dev-only: fixed salt
  _cachedSecret = crypto
    .createHash("sha256")
    .update("cabi-diagnosis-v4-dev-signing-key")
    .digest("hex");
  return _cachedSecret;
}

const TOKEN_VALIDITY_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Generates a signed token for the frontend.
 * Format: <timestamp>.<hmac_hex>
 *
 * The token signs ONLY the timestamp — no origin binding.
 * Origin validation is handled by CORS, not by the token.
 */
export function generateRequestToken() {
  const secret = getSigningSecret();
  const timestamp = Date.now();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}`)
    .digest("hex");

  return `${timestamp}.${signature}`;
}

/**
 * Verifies a request token from the frontend.
 * Returns true if valid, false otherwise.
 */
export function verifyRequestToken(token) {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Check expiry (2hr max, 1min clock skew)
  const age = Date.now() - timestamp;
  if (age > TOKEN_VALIDITY_MS || age < -60000) return false;

  // Verify HMAC
  const secret = getSigningSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Middleware: Verify X-Request-Signature header on API requests.
 * Returns true if the request should be REJECTED (invalid/missing signature).
 * Returns false if the request is ALLOWED.
 *
 * Production (VERCEL env): POST/DELETE must carry a valid signed token.
 * Development: Signing is optional for easier local testing.
 */
export function requireSignedRequest(req, res) {
  // In development, skip verification for convenience
  if (!process.env.VERCEL) return false;

  // Only verify on mutation endpoints (POST, DELETE)
  if (req.method === "GET" || req.method === "OPTIONS") return false;

  const token = req.headers["x-request-signature"] || "";

  // No token — reject
  if (!token) {
    res.status(403).json({
      error: "Invalid or missing request signature",
      errorBn: "অনুরোধ স্বাক্ষর অবৈধ — দয়া করে পাতাটি রিফ্রেশ করুন",
    });
    return true;
  }

  // Invalid token — reject
  if (!verifyRequestToken(token)) {
    res.status(403).json({
      error: "Invalid or missing request signature",
      errorBn: "অনুরোধ স্বাক্ষর অবৈধ — দয়া করে পাতাটি রিফ্রেশ করুন",
    });
    return true;
  }

  return false; // ALLOWED
}
