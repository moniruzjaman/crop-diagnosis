/**
 * Request Signing Token Endpoint
 *
 * GET /api/signing-token — returns a time-limited HMAC token.
 * The frontend includes this token in the X-Request-Signature header
 * on all mutation requests (POST, DELETE).
 *
 * Tokens are NOT origin-bound — CORS already validates origins.
 * The token simply proves "I was issued by this server recently."
 */

import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { generateRequestToken } from "./_lib/requestSigning.js";

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, OPTIONS");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = generateRequestToken();

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    token,
    expiresIn: 7200,
  });
}
