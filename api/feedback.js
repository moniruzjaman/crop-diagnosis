import { appendFeedback, readStore } from "./storage.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { feedbackLimiter } from "./_lib/rateLimit.js";
import { parseBody, validateFeedback } from "./_lib/validation.js";
import { escapeHtml, escapeHtmlWithBr, sanitizeEmail } from "./_lib/htmlEscape.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";

const SUPPORT_EMAIL = "support@krishiai.live";

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "POST, OPTIONS")) return;
  setCORSHeaders(req, res, "POST, OPTIONS");

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify request signature (prevents external API abuse)
  if (requireSignedRequest(req, res)) return;

  // Rate limiting
  if (feedbackLimiter(req, res)) return;

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  // Validate and sanitize all feedback fields
  const item = validateFeedback(body);
  const safeEmail = sanitizeEmail(item.email);

  const feedbackItem = {
    context: item.context,
    rating: item.rating,
    feedback: item.feedback,
    email: safeEmail,
    summary: item.summary,
    visitorId: item.visitorId,
    createdAt: new Date().toISOString(),
  };

  try {
    await appendFeedback(feedbackItem);
  } catch (err) {
    console.error("Feedback save error:", err.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  // Send email notification (non-blocking) — uses escaped HTML
  sendEmailNotification({ ...feedbackItem, email: safeEmail }).catch(() => {});

  let store;
  try {
    store = await readStore();
  } catch (err) {
    console.error("Feedback read error:", err.message);
    store = { feedback: [] };
  }

  return res.status(200).json({
    ok: true,
    count: Array.isArray(store.feedback) ? store.feedback.length : null,
    persistence: (process.env.TURSO_DATABASE_URL)
      ? "turso"
      : process.env.VERCEL
        ? "temporary-instance-storage"
        : "local-file-storage"
  });
}

// Send notification email via MailChannels (free on Vercel/Cloudflare)
async function sendEmailNotification(item) {
  if (!process.env.VERCEL) return; // Only send in production

  const subject = `[উদ্ভিদ গোয়েন্দা] ${escapeHtml(item.context)} — ${getRatingLabel(item.rating)}`;

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
      <div style="background:#006a4e;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0;">
        <h2 style="margin:0;font-size:18px;">🌿 উদ্ভিদ গোয়েন্দা — New Feedback</h2>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;width:120px;">Section</td><td style="padding:8px 0;">${escapeHtml(item.context)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Rating</td><td style="padding:8px 0;">${"⭐".repeat(item.rating)}${"☆".repeat(5 - item.rating)} (${item.rating}/5)</td></tr>
          ${item.email ? `<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">User Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></td></tr>` : ""}
          ${item.summary ? `<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Summary</td><td style="padding:8px 0;">${escapeHtml(item.summary)}</td></tr>` : ""}
          ${item.feedback ? `<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;vertical-align:top;">Feedback</td><td style="padding:8px 0;background:#f9fafb;padding:12px;border-radius:8px;">${escapeHtmlWithBr(item.feedback)}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Time</td><td style="padding:8px 0;">${escapeHtml(item.createdAt)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Visitor</td><td style="padding:8px 0;font-family:monospace;font-size:12px;">${escapeHtml(item.visitorId) || "N/A"}</td></tr>
        </table>
      </div>
      <div style="padding:12px 20px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
        উদ্ভিদ গোয়েন্দা (Plant Detective) · CABI Plantwise · DAE Bangladesh<br>
        <a href="https://cabi-diagnosis.vercel.app">cabi-diagnosis.vercel.app</a>
      </div>
    </div>
  `;

  try {
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: SUPPORT_EMAIL, name: "Krishi AI Support" }] }],
        from: { email: "noreply@cabi-diagnosis.vercel.app", name: "উদ্ভিদ গোয়েন্দা" },
        subject,
        content: [{ type: "text/html", value: htmlBody }],
      }),
    });
  } catch (err) {
    console.error("Email notification failed:", err.message);
  }
}

function getRatingLabel(rating) {
  if (rating >= 4) return "Positive";
  if (rating >= 3) return "Neutral";
  if (rating >= 1) return "Negative";
  return "No Rating";
}
