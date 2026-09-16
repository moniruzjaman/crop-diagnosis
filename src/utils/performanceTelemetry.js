// Client-side Performance & Telemetry Collector for CABI Diagnosis PWA
// Measures Web Vitals (LCP, FID/INP, CLS, TTFB) & ONNX ViT inference performance benchmarks.

let _metricsQueue = [];
let _flushTimer = null;
const QUEUE_FLUSH_INTERVAL = 15000; // 15s batch flush

/**
 * Record a performance telemetry metric event.
 * @param {string} category - 'vit_inference' | 'web_vital' | 'api_latency' | 'error'
 * @param {object} detail - metric payload (e.g. durationMs, label, status)
 */
export function recordTelemetry(category, detail = {}) {
  if (!category) return;

  const event = {
    category,
    timestamp: new Date().toISOString(),
    ...detail,
  };

  _metricsQueue.push(event);

  if (!_flushTimer) {
    _flushTimer = setTimeout(flushTelemetry, QUEUE_FLUSH_INTERVAL);
  }
}

/**
 * Measure execution time of an async function.
 * @param {string} metricName
 * @param {Function} fn
 * @returns {Promise<any>}
 */
export async function measureAsync(metricName, fn) {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const result = await fn();
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    recordTelemetry("benchmark", {
      name: metricName,
      durationMs: Math.round(end - start),
      success: true,
    });
    return result;
  } catch (err) {
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    recordTelemetry("benchmark", {
      name: metricName,
      durationMs: Math.round(end - start),
      success: false,
      error: err?.message || String(err),
    });
    throw err;
  }
}

/**
 * Flush performance metrics to /api/analytics
 */
export async function flushTelemetry() {
  if (_flushTimer) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }

  if (_metricsQueue.length === 0) return;

  const eventsToSend = [..._metricsQueue];
  _metricsQueue = [];

  try {
    const visitorId = getVisitorId();
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        section: "performance_telemetry",
        telemetry: eventsToSend,
      }),
    });
  } catch {
    // Re-queue un-sent metrics up to cap of 50
    _metricsQueue = [...eventsToSend.slice(-25), ..._metricsQueue].slice(0, 50);
  }
}

/**
 * Initialize Web Vitals observers if supported by browser.
 */
export function initPerformanceMonitoring() {
  if (typeof window === "undefined" || !("performance" in window) || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    // Observe LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        recordTelemetry("web_vital", {
          name: "LCP",
          valueMs: Math.round(lastEntry.startTime),
        });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    /* ignore unsupported observer */
  }

  // Record initial TTFB
  try {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      recordTelemetry("web_vital", {
        name: "TTFB",
        valueMs: Math.round(nav.responseStart),
      });
    }
  } catch {
    /* ignore */
  }

  // Flush on page unload / hide
  if (typeof window !== "undefined") {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushTelemetry();
      }
    });
  }
}

function getVisitorId() {
  try {
    let id = localStorage.getItem("cabi_visitor_id");
    if (!id) {
      id = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("cabi_visitor_id", id);
    }
    return id;
  } catch {
    return "v_anonymous";
  }
}
