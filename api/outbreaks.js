/**
 * Outbreak Reports API — Report and query disease outbreaks.
 *
 * POST  /api/outbreaks  — Report an outbreak
 * GET   /api/outbreaks  — List outbreaks with optional filters
 */

import { reportOutbreak, getOutbreaks, hasTurso } from "./_lib/turso.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { createRateLimiter } from "./_lib/rateLimit.js";
import { parseBody } from "./_lib/validation.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";
import crypto from "crypto";

const outbreaksLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, POST, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, POST, OPTIONS");

  if (!hasTurso()) {
    return res.status(503).json({ error: "Database not configured", persistence: "none" });
  }

  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    if (requireSignedRequest(req, res)) return;
    if (outbreaksLimiter(req, res)) return;
    return handlePost(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req, res) {
  try {
    const filters = {
      district: req.query?.district || undefined,
      crop: req.query?.crop || undefined,
      recentDays: req.query?.recentDays ? parseInt(req.query.recentDays, 10) : undefined,
      limit: req.query?.limit || 50,
    };

    const outbreaks = await getOutbreaks(filters);
    return res.status(200).json({
      outbreaks,
      count: outbreaks.length,
      persistence: "turso",
    });
  } catch (err) {
    console.error("Outbreaks GET error:", err.message);
    return res.status(500).json({ error: "Failed to fetch outbreaks" });
  }
}

async function handlePost(req, res) {
  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  // Validate required fields
  if (!body.district || typeof body.district !== "string") {
    return res.status(400).json({ error: "district is required" });
  }
  if (!body.crop || typeof body.crop !== "string") {
    return res.status(400).json({ error: "crop is required" });
  }
  if (!body.disease_name || typeof body.disease_name !== "string") {
    return res.status(400).json({ error: "disease_name is required" });
  }

  // Hash reporter identity for privacy
  const reporterInput = body.reporter_id || req.headers["x-forwarded-for"] || "anonymous";
  const reporter_hash = crypto
    .createHash("sha256")
    .update(String(reporterInput))
    .digest("hex")
    .slice(0, 16);

  const entry = {
    district: String(body.district).slice(0, 100),
    crop: String(body.crop).slice(0, 100),
    disease_name: String(body.disease_name).slice(0, 300),
    reporter_hash,
    confirmed: body.confirmed === true,
  };

  try {
    const id = await reportOutbreak(entry);
    if (id === null) {
      return res.status(500).json({ error: "Failed to report outbreak" });
    }
    return res.status(201).json({ ok: true, id, persistence: "turso" });
  } catch (err) {
    console.error("Outbreaks POST error:", err.message);
    return res.status(500).json({ error: "Failed to report outbreak" });
  }
}
