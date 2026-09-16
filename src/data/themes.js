/**
 * Dark Mode Theme System for CABI Plant Detective
 *
 * Tokens are aligned with C_LIGHT in App.jsx for visual consistency.
 * Includes tinted backgrounds and borders for dark-mode compatibility.
 */

export const lightTheme = {
  bg: "#f4f6f8",
  bgCard: "#ffffff",
  bgMuted: "#f0f2f5",
  text: "#1a1d21",
  textMuted: "#5f6672",
  textLight: "#8e95a2",
  primary: "#006a4e",
  primaryDark: "#00503a",
  primaryLight: "#0b8457",
  border: "#e2e5ea",
  shadow: "0 2px 8px rgba(0,0,0,0.06)",
  danger: "#f42a41",
  warning: "#d97706",
  success: "#006a4e",
  blue: "#2563eb",
  bdGreen: "#006a4e",
  bdRed: "#f42a41",
};

export const darkTheme = {
  bg: "#0f172a",
  bgCard: "#1e293b",
  bgMuted: "#334155",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textLight: "#94a3b8",
  primary: "#22c55e",
  primaryDark: "#006a4e",
  primaryLight: "#4ade80",
  border: "#475569",
  shadow: "0 1px 3px rgba(0,0,0,0.3)",
  danger: "#f42a41",
  warning: "#f59e0b",
  success: "#22c55e",
  blue: "#3b82f6",
  bdGreen: "#006a4e",
  bdRed: "#f42a41",
};

// ─── Tinted backgrounds & borders for dark-mode compatibility ─────────────────
// Light theme uses soft pastels; dark theme uses deep muted tones.

const lightTints = {
  bgDanger: "#fef2f2",
  bgSuccess: "#f0fdf4",
  bgWarning: "#fffbeb",
  bgInfo: "#eff6ff",
  bgBlue: "#f0f9ff",
  bgPurple: "#faf5ff",
  bgTeal: "#ecfeff",
  bgOrange: "#fff7ed",
  borderDanger: "#fecaca",
  borderSuccess: "#bbf7d0",
  borderWarning: "#fcd34d",
  borderInfo: "#bfdbfe",
  borderBlue: "#bae6fd",
  borderPurple: "#e9d5ff",
  borderTeal: "#a5f3fc",
  borderOrange: "#fed7aa",
  badgeSuccess: "#dcfce7",
  badgeWarning: "#fef3c7",
  textSuccess: "#14532d",
  textDanger: "#991b1b",
  textWarning: "#92400e",
  textInfo: "#1e40af",
  textBlue: "#0369a1",
  textPurple: "#6b21a8",
  textTeal: "#155e75",
  textOrange: "#9a3412",
};

const darkTints = {
  bgDanger: "#450a0a",
  bgSuccess: "#052e16",
  bgWarning: "#451a03",
  bgInfo: "#172554",
  bgBlue: "#0c4a6e",
  bgPurple: "#3b0764",
  bgTeal: "#134e4a",
  bgOrange: "#431407",
  borderDanger: "#7f1d1d",
  borderSuccess: "#166534",
  borderWarning: "#92400e",
  borderInfo: "#1e40af",
  borderBlue: "#075985",
  borderPurple: "#7e22ce",
  borderTeal: "#0f766e",
  borderOrange: "#c2410c",
  badgeSuccess: "#166534",
  badgeWarning: "#92400e",
  textSuccess: "#4ade80",
  textDanger: "#fca5a5",
  textWarning: "#fcd34d",
  textInfo: "#93c5fd",
  textBlue: "#7dd3fc",
  textPurple: "#c084fc",
  textTeal: "#5eead4",
  textOrange: "#fb923c",
};

export const lightThemeFull = {
  ...lightTheme,
  primaryXDark: "#00281b",
  accent: "#f42a41",
  accentLight: "#ff4d61",
  accentDark: "#d6182e",
  bgHeader: "#ffffff",
  bgNav: "#f0f2f5",
  borderFocus: "#006a4e",
  shadowMd: "0 4px 16px rgba(0,106,78,0.10)",
  shadowLg: "0 8px 32px rgba(0,106,78,0.16)",
  heroGradient: "linear-gradient(135deg, #006a4e 0%, #00503a 50%, #087f5b 100%)",
  heroGradientBd: "linear-gradient(135deg, #006a4e 0%, #00503a 65%, #c81e35 100%)",
  game1: "#7c3aed",
  game2: "#0891b2",
  game3: "#ea580c",
  ...lightTints,
};

export const darkThemeFull = {
  ...darkTheme,
  primaryXDark: "#00281b",
  accent: "#f42a41",
  accentLight: "#ff4d61",
  accentDark: "#d6182e",
  bgHeader: "#1e293b",
  bgNav: "#1e293b",
  borderFocus: "#22c55e",
  shadowMd: "0 4px 16px rgba(0,0,0,0.3)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.4)",
  heroGradient: "linear-gradient(135deg, #003626 0%, #004d37 50%, #006a4e 100%)",
  heroGradientBd: "linear-gradient(135deg, #003626 0%, #004d37 65%, #991b1b 100%)",
  game1: "#8b5cf6",
  game2: "#06b6d4",
  game3: "#f97316",
  ...darkTints,
};

export function getPreferredTheme() {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("cabi-theme");
  if (stored === "dark" || stored === "light") return stored;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function getTheme(name) {
  return name === "dark" ? darkThemeFull : lightThemeFull;
}
