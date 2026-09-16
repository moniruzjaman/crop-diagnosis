import { readStore, writeStore } from "./storage.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { analyticsLimiter } from "./_lib/rateLimit.js";
import { parseBody, validateVisitorId, validateSection } from "./_lib/validation.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";
import { getDiseaseStats, hasTurso } from "./_lib/turso.js";

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, POST, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, POST, OPTIONS");

  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify request signature on POST (prevents external API abuse)
  if (requireSignedRequest(req, res)) return;

  // Rate limiting on POST
  if (analyticsLimiter(req, res)) return;

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  const visitorId = validateVisitorId(body.visitorId);
  const section = validateSection(body.section);

  if (!visitorId) return res.status(400).json({ error: "visitorId is required" });

  try {
    const store = await readStore();
    const isNewVisitor = !store.visitors[visitorId];

    store.totalVisits += 1;
    store.sections[section] = (store.sections[section] || 0) + 1;
    store.visitors[visitorId] = {
      firstSeen: store.visitors[visitorId]?.firstSeen || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      visits: (store.visitors[visitorId]?.visits || 0) + 1,
    };
    if (isNewVisitor) store.uniqueVisitors += 1;

    await writeStore(store);

    return res.status(200).json({
      totalVisits: store.totalVisits,
      uniqueVisitors: store.uniqueVisitors,
      sections: store.sections,
      visitor: store.visitors[visitorId],
      updatedAt: store.updatedAt,
      persistence: (process.env.TURSO_DATABASE_URL) ? "turso" : (process.env.VERCEL ? "temporary-instance-storage" : "local-file-storage"),
    });
  } catch (err) {
    console.error("Analytics POST error:", err.message);
    return res.status(500).json({ error: "Failed to update analytics" });
  }
}

async function handleGet(req, res) {
  try {
    const store = await readStore();

    // Base analytics response
    const response = {
      totalVisits: store.totalVisits,
      uniqueVisitors: store.uniqueVisitors,
      sections: store.sections,
      updatedAt: store.updatedAt,
    };

    // If disease stats requested and Turso is available
    if (req.query?.disease === "true" && hasTurso()) {
      try {
        const days = Math.min(Math.max(parseInt(req.query?.days) || 30, 1), 365);
        const diseaseStats = await getDiseaseStats(days);
        response.diseaseStats = diseaseStats;
      } catch (err) {
        console.error("Analytics disease stats error:", err.message);
        response.diseaseStats = { error: "Failed to fetch disease stats" };
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("Analytics GET error:", err.message);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}
