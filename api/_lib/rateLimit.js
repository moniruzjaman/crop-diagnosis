/**
 * Simple IP-based rate limiter for Vercel Serverless Functions.
 *
 * Uses an in-memory Map that persists within a single serverless instance.
 * For true distributed rate limiting across instances, use @upstash/ratelimit
 * with Redis. This implementation provides basic protection within a cold-start
 * lifecycle and is better than no rate limiting at all.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 10 });
 *   if (limiter(req, res)) return; // rate limited — response already sent
 */

const stores = new Map();

function getStore(key) {
  if (!stores.has(key)) {
    stores.set(key, { count: 0, resetAt: 0 });
  }
  return stores.get(key);
}

/**
 * Creates a rate limiter middleware function.
 * @param {Object} opts
 * @param {number} opts.windowMs  - Time window in milliseconds (default: 60_000)
 * @param {number} opts.maxRequests - Max requests per window per IP (default: 10)
 * @returns {function} - Returns true if rate limited (429 sent), false otherwise
 */
export function createRateLimiter({ windowMs = 60_000, maxRequests = 10 } = {}) {
  return function checkRateLimit(req, res) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const store = getStore(ip);

    // Reset window if expired
    if (now > store.resetAt) {
      store.count = 0;
      store.resetAt = now + windowMs;
    }

    store.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - store.count));
    res.setHeader("X-RateLimit-Reset", new Date(store.resetAt).toISOString());

    if (store.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((store.resetAt - now) / 1000));
      res.status(429).json({
        error: "খুব বেশি অনুরোধ হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
        errorEn: "Too many requests. Please try again shortly.",
        retryAfter: Math.ceil((store.resetAt - now) / 1000),
      });
      return true;
    }

    return false;
  };
}

// Pre-configured limiters for common use cases
export const diagnoseLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
export const feedbackLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
export const analyticsLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });
export const presenceLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });
