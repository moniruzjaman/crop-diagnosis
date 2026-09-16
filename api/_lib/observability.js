/**
 * Privacy-preserving diagnosis telemetry.
 * Raw prompts, provider payloads, and image data are intentionally excluded.
 */

const IMAGE_KEYS = /image|base64|dataurl|url/i;
const eventStats = { total: 0, success: 0, failures: 0, degraded: 0, byRoute: {} };

export function summarizeMessages(messages = []) {
  let imageCount = 0;
  let imageBytes = 0;
  for (const message of messages) {
    if (!Array.isArray(message?.content)) continue;
    for (const block of message.content) {
      if (block?.type === "image") {
        imageCount += 1;
        imageBytes += Buffer.byteLength(String(block.source?.data || ""), "utf8");
      }
    }
  }
  return { imageCount, imageBytes };
}

function redactText(value) {
  return String(value)
    .replace(/bearer\s+[a-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/(key|token|secret)[=:]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 180);
}

export function createDiagnosisEvent(event = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(event)) {
    if (IMAGE_KEYS.test(key) || key === "prompt" || key === "messages" || key === "body") continue;
    if (typeof value === "string") safe[key] = redactText(value);
    else if (typeof value === "number" || typeof value === "boolean") safe[key] = value;
  }
  return {
    ...safe,
    timestamp: new Date().toISOString(),
  };
}

export function recordDiagnosisEvent(event) {
  const safeEvent = createDiagnosisEvent(event);
  eventStats.total += 1;
  if (safeEvent.success === true) eventStats.success += 1;
  if (safeEvent.success === false) eventStats.failures += 1;
  if (safeEvent.degraded === true) eventStats.degraded += 1;
  if (safeEvent.route) eventStats.byRoute[safeEvent.route] = (eventStats.byRoute[safeEvent.route] || 0) + 1;
  // Structured logs are available in Vercel without introducing a paid vendor.
  console.info(JSON.stringify({ type: "diagnosis_event", ...safeEvent }));
  return safeEvent;
}

export function getTelemetrySnapshot() {
  return {
    total: eventStats.total,
    success: eventStats.success,
    failures: eventStats.failures,
    degraded: eventStats.degraded,
    byRoute: { ...eventStats.byRoute },
  };
}
