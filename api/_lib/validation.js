/**
 * Shared input validation utilities for API routes.
 */

/**
 * Safely parses a request body (handles string or object).
 * Returns parsed object or null on failure.
 */
export function parseBody(req) {
  try {
    if (!req.body) return {};
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return null;
  }
}

/**
 * Validates the messages array for the /api/diagnose endpoint.
 * - Enforces max message count
 * - Truncates individual messages to prevent oversized payloads
 * - Rejects client-injected system messages
 * - Sanitizes text content
 */
export function validateDiagnoseMessages(messages, opts = {}) {
  const { maxMessages = 20, maxTextLength = 5000, maxImageCount = 5 } = opts;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: "No messages provided" };
  }

  if (messages.length > maxMessages) {
    return { valid: false, error: `Too many messages (max ${maxMessages})` };
  }

  let imageCount = 0;
  const sanitized = [];

  for (const msg of messages) {
    // Reject client-injected system messages
    if (msg.role === "system") continue;

    // Only allow user and assistant roles
    if (msg.role !== "user" && msg.role !== "assistant") continue;

    if (typeof msg.content === "string") {
      sanitized.push({
        role: msg.role,
        content: msg.content.slice(0, maxTextLength),
      });
    } else if (Array.isArray(msg.content)) {
      const blocks = [];
      for (const block of msg.content) {
        if (block.type === "text" && block.text) {
          blocks.push({ type: "text", text: block.text.slice(0, maxTextLength) });
        } else if (block.type === "image" && block.source?.type === "base64") {
          imageCount++;
          if (imageCount <= maxImageCount) {
            // Limit base64 size to ~2MB
            const maxDataLen = 2_700_000; // ~2MB base64
            blocks.push({
              type: "image",
              source: {
                type: "base64",
                media_type: block.source.media_type || "image/jpeg",
                data: block.source.data?.slice(0, maxDataLen) || "",
              },
            });
          }
        }
      }
      if (blocks.length > 0) {
        sanitized.push({ role: msg.role, content: blocks });
      }
    }
  }

  if (sanitized.length === 0) {
    return { valid: false, error: "No valid messages after sanitization" };
  }

  return { valid: true, messages: sanitized, imageCount };
}

/**
 * Validates a visitor ID string.
 */
export function validateVisitorId(id) {
  if (!id || typeof id !== "string") return "";
  return id.trim().slice(0, 120);
}

/**
 * Validates a section string.
 */
export function validateSection(section, allowedSections = null) {
  if (!section || typeof section !== "string") return "home";
  const trimmed = section.trim().slice(0, 50);
  if (allowedSections && !allowedSections.includes(trimmed)) return "home";
  return trimmed;
}

/**
 * Validates feedback input.
 */
export function validateFeedback(body) {
  return {
    context: String(body.context || "Unknown").slice(0, 120),
    rating: Math.min(Math.max(Number(body.rating) || 0, 0), 5),
    feedback: String(body.feedback || "").slice(0, 4000),
    email: String(body.email || "").slice(0, 320),
    summary: String(body.summary || "").slice(0, 2000),
    visitorId: String(body.visitorId || "").slice(0, 120),
  };
}
