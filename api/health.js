/**
 * Health check endpoint for uptime monitoring.
 * Returns system status — no sensitive information exposed.
 */

import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";

const startTime = Date.now();

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, OPTIONS");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    env: {
      VERCEL: !!process.env.VERCEL,
      TURSO: !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN),
      // Only report whether keys exist, never their values or partial content
      AI_PROVIDERS_CONFIGURED: !!(
        process.env.GEMINI_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.OPENROUTER_API_KEY
      ),
    },
    version: "4.0.0",
  });
}
