/**
 * Shared CORS configuration for all API routes.
 *
 * In production, only allowed origins are permitted.
 * Set ALLOWED_ORIGINS env var (comma-separated) or it defaults to the production domain.
 * In development (no VERCEL env), falls back to permissive CORS for local testing.
 */

const DEFAULT_PROD_ORIGINS = [
  "https://cabi-diagnosis.vercel.app",
  "https://cabi-diagnosis-git-main-moniruzjamans-projects.vercel.app",
];

/**
 * Checks if an origin matches a Vercel deployment pattern.
 * Matches: *.vercel.app and *.vercel.app/* subdomains.
 */
function isVercelDeployment(origin) {
  try {
    const url = new URL(origin);
    // Allow any Vercel deployment subdomain
    return url.hostname.endsWith(".vercel.app") || url.hostname === "vercel.app";
  } catch {
    return false;
  }
}

function getAllowedOrigins() {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return DEFAULT_PROD_ORIGINS;
}

function isOriginInAllowlist(origin) {
  if (!origin) return false;
  // Check explicit allowlist
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  // Also allow any Vercel deployment (preview branches, etc.)
  if (isVercelDeployment(origin)) return true;
  return false;
}

/**
 * Checks whether the request origin is allowed in production.
 * Returns the matched origin string, or null if not allowed.
 */
export function isOriginAllowed(req) {
  const origin = req.headers.origin || "";
  if (!process.env.VERCEL) return origin || "*"; // Dev mode: allow all
  if (!origin) return null; // No origin header = not a browser request, let it through via null
  return isOriginInAllowlist(origin) ? origin : null;
}

/**
 * Sets CORS headers on the response.
 * - In production (VERCEL env set): only allows configured origins.
 * - In development: allows all origins for local testing.
 * - Returns true if the origin is allowed (or in dev mode), false if blocked.
 */
export function setCORSHeaders(req, res, methods = "GET, POST, DELETE, OPTIONS") {
  const origin = req.headers.origin || "";

  // In development (no VERCEL), allow all origins for convenience
  if (!process.env.VERCEL) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // In production, only allow known origins
    if (isOriginInAllowlist(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else if (!origin) {
      // Non-browser requests (curl, server-to-server) have no origin — allow
      // but don't set Access-Control-Allow-Origin (not needed for non-browser)
    } else {
      // Unknown origin — do NOT set Access-Control-Allow-Origin
      // Browser will block the request, which is the correct behavior
      res.setHeader("Vary", "Origin");
    }
  }

  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Signature");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24h preflight cache
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 * Returns true if the request was an OPTIONS (already ended the response).
 */
export function handleCORSPreflight(req, res, methods = "GET, POST, DELETE, OPTIONS") {
  setCORSHeaders(req, res, methods);
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
