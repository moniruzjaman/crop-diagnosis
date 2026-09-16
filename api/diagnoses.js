/**
 * Diagnoses API — Save and query diagnosis records.
 *
 * POST  /api/diagnoses  — Save a diagnosis record
 * GET   /api/diagnoses  — List diagnoses with optional filters
 */

import { saveDiagnosis, getDiagnoses, hasTurso } from "./_lib/turso.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { createRateLimiter } from "./_lib/rateLimit.js";
import { parseBody } from "./_lib/validation.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";

const diagnosesLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

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
    if (diagnosesLimiter(req, res)) return;
    return handlePost(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req, res) {
  try {
    const filters = {
      crop: req.query?.crop || undefined,
      district: req.query?.district || undefined,
      dateFrom: req.query?.dateFrom || undefined,
      dateTo: req.query?.dateTo || undefined,
      limit: req.query?.limit || 50,
    };

    const diagnoses = await getDiagnoses(filters);
    return res.status(200).json({
      diagnoses,
      count: diagnoses.length,
      persistence: "turso",
    });
  } catch (err) {
    console.error("Diagnoses GET error:", err.message);
    return res.status(500).json({ error: "Failed to fetch diagnoses" });
  }
}

async function handlePost(req, res) {
  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  // Validate required fields
  if (!body.session_id || typeof body.session_id !== "string") {
    return res.status(400).json({ error: "session_id is required" });
  }
  if (!body.crop || typeof body.crop !== "string") {
    return res.status(400).json({ error: "crop is required" });
  }

  const entry = {
    session_id: String(body.session_id).slice(0, 200),
    crop: String(body.crop).slice(0, 100),
    disease_name: body.disease_name ? String(body.disease_name).slice(0, 300) : null,
    disease_name_bn: body.disease_name_bn ? String(body.disease_name_bn).slice(0, 300) : null,
    confidence: body.confidence ? String(body.confidence).slice(0, 20) : null,
    severity: body.severity ? String(body.severity).slice(0, 20) : null,
    biotic_abiotic: body.biotic_abiotic ? String(body.biotic_abiotic).slice(0, 20) : null,
    provider: body.provider ? String(body.provider).slice(0, 100) : null,
    symptoms: body.symptoms ? String(body.symptoms).slice(0, 2000) : null,
    recommendations: body.recommendations ? String(body.recommendations).slice(0, 4000) : null,
    weather_snapshot: body.weather_snapshot ? String(body.weather_snapshot).slice(0, 2000) : null,
    district: body.district ? String(body.district).slice(0, 100) : null,
    image_count: Math.min(Math.max(Number(body.image_count) || 0, 0), 10),
  };

  try {
    const id = await saveDiagnosis(entry);
    if (id === null) {
      return res.status(500).json({ error: "Failed to save diagnosis" });
    }
    return res.status(201).json({ ok: true, id, persistence: "turso" });
  } catch (err) {
    console.error("Diagnoses POST error:", err.message);
    return res.status(500).json({ error: "Failed to save diagnosis" });
  }
}
