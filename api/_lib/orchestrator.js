/**
 * Sequential model orchestration. Providers are supplied as functions so the
 * routing policy is independent from vendor-specific request formatting.
 */

export async function runOrchestration({
  routes,
  hasImage,
  policy,
  timeoutMs,
  onAttempt,
  emergency,
}) {
  const attempts = [];
  const startedAt = Date.now();
  const deadline = startedAt + timeoutMs;

  for (const route of routes.slice(0, policy.maxAttempts)) {
    if (Date.now() >= deadline) {
      attempts.push("orchestrator: request deadline reached");
      break;
    }
    if (route.requiresVision && !hasImage) continue;
    if (route.textOnly && hasImage && route.allowWithImage !== true) continue;
    if (!route.enabled) {
      attempts.push(`${route.id}: not configured`);
      continue;
    }

    const attemptStarted = Date.now();
    try {
      const remainingMs = Math.max(1, deadline - Date.now());
      const result = await withTimeout(route.run(), remainingMs, route.id);
      await onAttempt?.({
        route,
        ok: true,
        latencyMs: Date.now() - attemptStarted,
        hasImage,
      });
      return {
        ...result,
        attempts,
        route: route.id,
        degraded: Boolean(route.degraded),
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      const message = sanitizeError(error);
      attempts.push(`${route.id}: ${message}`);
      await onAttempt?.({
        route,
        ok: false,
        error: message,
        latencyMs: Date.now() - attemptStarted,
        hasImage,
      });
    }
  }

  const fallback = await emergency();
  return {
    ...fallback,
    attempts,
    route: "emergency",
    degraded: true,
    latencyMs: Date.now() - startedAt,
  };
}

function withTimeout(promise, timeoutMs, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function sanitizeError(error) {
  const message = String(error?.message || error || "unknown provider error");
  return message.replace(/[\r\n]+/g, " ").slice(0, 180);
}
