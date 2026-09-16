/**
 * Conservative, provider-agnostic limits for free-tier operation.
 * Values can be overridden in Vercel environment variables, but invalid or
 * missing values always fall back to safe defaults.
 */

const DEFAULTS = Object.freeze({
  maxAttempts: 5,
  maxRequestsPerDay: 250,
  maxVisionRequestsPerDay: 100,
  maxOutputTokens: 2200,
  maxImageBytes: 6_000_000,
  requestTimeoutMs: 25_000,
});

function positiveInt(name, fallback, max = Number.MAX_SAFE_INTEGER) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;
}

export function getFreeTierPolicy() {
  return {
    maxAttempts: positiveInt("AI_MAX_ATTEMPTS", DEFAULTS.maxAttempts, 10),
    maxRequestsPerDay: positiveInt("AI_MAX_REQUESTS_PER_DAY", DEFAULTS.maxRequestsPerDay, 10_000),
    maxVisionRequestsPerDay: positiveInt("AI_MAX_VISION_REQUESTS_PER_DAY", DEFAULTS.maxVisionRequestsPerDay, 10_000),
    maxOutputTokens: positiveInt("AI_MAX_OUTPUT_TOKENS", DEFAULTS.maxOutputTokens, 4_000),
    maxImageBytes: positiveInt("AI_MAX_IMAGE_BYTES", DEFAULTS.maxImageBytes, 12_000_000),
    requestTimeoutMs: positiveInt("AI_REQUEST_TIMEOUT_MS", DEFAULTS.requestTimeoutMs, 30_000),
  };
}

const dailyUsage = new Map();

function usageKey(day = new Date().toISOString().slice(0, 10)) {
  return day;
}

export function reserveRequest({ hasImage = false } = {}) {
  const policy = getFreeTierPolicy();
  const key = usageKey();
  const current = dailyUsage.get(key) || { requests: 0, visionRequests: 0 };

  if (current.requests >= policy.maxRequestsPerDay) {
    return { allowed: false, reason: "daily_request_cap", policy };
  }
  if (hasImage && current.visionRequests >= policy.maxVisionRequestsPerDay) {
    return { allowed: false, reason: "daily_vision_cap", policy };
  }

  current.requests += 1;
  if (hasImage) current.visionRequests += 1;
  dailyUsage.set(key, current);

  // Keep the serverless-instance cache bounded.
  for (const day of dailyUsage.keys()) {
    if (day !== key) dailyUsage.delete(day);
  }

  return { allowed: true, reason: null, policy, usage: { ...current } };
}

export function getPolicyUsage() {
  return { ...getFreeTierPolicy(), usage: dailyUsage.get(usageKey()) || { requests: 0, visionRequests: 0 } };
}
