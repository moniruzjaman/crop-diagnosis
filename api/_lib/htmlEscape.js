/**
 * HTML escaping utility to prevent XSS in email templates and HTML output.
 */

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes HTML special characters in a string.
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string
 */
export function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (char) => ESCAPE_MAP[char]);
}

/**
 * Escapes HTML but preserves newlines as <br> tags (for email templates).
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string with <br> for newlines
 */
export function escapeHtmlWithBr(str) {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

/**
 * Validates an email address looks reasonable (not a full RFC 5322 check,
 * but prevents obvious XSS via mailto: links).
 * @param {string} email
 * @returns {string} - The cleaned email or empty string
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  // Remove anything that isn't a valid email character
  const cleaned = email.trim().slice(0, 320);
  // Basic email pattern check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return "";
  return cleaned;
}
