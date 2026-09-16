// ─── Presence / Real-time User Tracking API ────────────────────────
// POST   /api/presence  — Register/update heartbeat (called every 30s)
// GET    /api/presence  — Get current online users count & stats
// DELETE /api/presence  — Remove presence (on app close)

import crypto from "crypto";
import { readStore } from "./storage.js";
import {
  upsertPresence,
  removePresence,
  getOnlineStats,
  getDailyStats,
  cleanupStalePresence,
  hasTurso,
} from "./_lib/turso.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { presenceLimiter } from "./_lib/rateLimit.js";
import { parseBody, validateVisitorId, validateSection } from "./_lib/validation.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";

// ─── Main handler ──────────────────────────────────────────────────
export default async function handler(req, res) {
  if (handleCORSPreflight(req, res)) return;
  setCORSHeaders(req, res);
  res.setHeader("Cache-Control", "no-store");

  // Periodically clean stale records (1 in 20 chance)
  if (hasTurso() && Math.random() < 0.05) cleanupStalePresence().catch(() => {});

  if (req.method === "GET") {
    return handleGet(req, res);
  }
  if (req.method === "POST") {
    if (requireSignedRequest(req, res)) return;
    if (presenceLimiter(req, res)) return;
    return handlePost(req, res);
  }
  if (req.method === "DELETE") {
    if (requireSignedRequest(req, res)) return;
    return handleDelete(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req, res) {
  const days = Math.min(parseInt(req.query?.days) || 7, 30);

  if (hasTurso()) {
    try {
      const [onlineStats, dailyStats] = await Promise.all([
        getOnlineStats(),
        getDailyStats(days),
      ]);
      return res.status(200).json({
        onlineCount: onlineStats.onlineCount,
        bySection: onlineStats.bySection,
        recentVisitors: onlineStats.visitors,
        dailyStats,
        persistence: "turso",
      });
    } catch (err) {
      console.error("Presence GET error:", err.message);
    }
  }

  // Fallback: return from local analytics
  const store = await readStore();
  return res.status(200).json({
    onlineCount: 0,
    bySection: {},
    recentVisitors: [],
    dailyStats: [],
    totalVisits: store.totalVisits,
    uniqueVisitors: store.uniqueVisitors,
    sections: store.sections,
    persistence: "fallback",
  });
}

async function handlePost(req, res) {
  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  const visitorId = validateVisitorId(body.visitorId);
  const section = validateSection(body.section);

  if (!visitorId) return res.status(400).json({ error: "visitorId is required" });

  const userAgent = req.headers["user-agent"] || "";
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "";
  const ipHash = ip ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16) : "unknown";
  const country = req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || "";
  const isPwa = body.isPwa === true;

  if (hasTurso()) {
    try {
      await upsertPresence(visitorId, section, userAgent, ipHash, country, isPwa);
      return res.status(200).json({ ok: true, persistence: "turso" });
    } catch (err) {
      console.error("Presence POST error:", err.message);
    }
  }

  return res.status(200).json({ ok: true, persistence: "fallback" });
}

async function handleDelete(req, res) {
  const body = parseBody(req);
  const visitorId = validateVisitorId(body?.visitorId || req.query?.visitorId);

  if (!visitorId) return res.status(400).json({ error: "visitorId is required" });

  if (hasTurso()) {
    try {
      await removePresence(visitorId);
      return res.status(200).json({ ok: true, persistence: "turso" });
    } catch (err) {
      console.error("Presence DELETE error:", err.message);
    }
  }

  return res.status(200).json({ ok: true, persistence: "fallback" });
}
