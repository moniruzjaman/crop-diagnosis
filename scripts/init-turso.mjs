#!/usr/bin/env node
/**
 * Turso database initialization script
 *
 * Creates all required tables, indexes, and seed rows in the Turso database
 * using the single source of truth: ensureSchema() from api/_lib/turso.js.
 *
 * Usage:
 *   node scripts/init-turso.mjs
 *
 * Required env vars (read from process.env or .env file):
 *   TURSO_DATABASE_URL  — e.g. libsql://your-db-name-your-org.turso.io
 *   TURSO_AUTH_TOKEN    — auth token from `turso db tokens create <db>`
 *
 * Security: secrets are loaded into process.env only. Values of keys
 * matching KEY|TOKEN|SECRET are never printed.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ─── Load .env into process.env (no dotenv dependency) ─────────
async function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  let raw;
  try {
    raw = await fs.readFile(envPath, "utf8");
  } catch {
    console.log("[env] No .env file found — relying on process.env only.");
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue; // skip comments and blanks
    const [, key, value] = match;
    const unquoted = value.replace(/^["']|["']$/g, "");
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = unquoted;
    }
  }
  console.log("[env] Loaded .env (secret values not shown).");
}

function maskKey(key) {
  return /KEY|TOKEN|SECRET/i.test(key) ? "<redacted>" : process.env[key];
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  await loadEnvFile();

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error(
      "[error] TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set (in .env or environment).",
    );
    console.error("        Add them to .env (never commit it) or Vercel env vars for production.");
    process.exit(1);
  }

  console.log(`[turso] Connecting to ${process.env.TURSO_DATABASE_URL}`);
  console.log(`[turso] TURSO_AUTH_TOKEN=${maskKey("TURSO_AUTH_TOKEN")}`);

  const { ensureSchema, hasTurso, getTursoClient } = await import(
    pathToFileURL(path.join(ROOT, "api", "_lib", "turso.js")).href
  );

  if (!hasTurso()) {
    console.error("[error] Turso client not configured.");
    process.exit(1);
  }

  const started = Date.now();
  await ensureSchema();
  console.log(`[turso] Schema initialization attempted in ${Date.now() - started}ms.`);

  // Verify: compare actual tables against what the codebase requires
  const db = getTursoClient();
  const REQUIRED_TABLES = [
    "analytics_state",
    "feedback_entries",
    "presence_log",
    "diagnoses",
    "outbreak_reports",
    "market_prices"
  ];

  const tablesResult = await db.execute(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  );
  const existing = new Set(tablesResult.rows.map((r) => r.name));

  const missing = REQUIRED_TABLES.filter((t) => !existing.has(t));
  if (missing.length > 0) {
    console.error("\n[warn] Missing required tables:", missing.join(", "));
    console.error(
      "[warn] The current TURSO_AUTH_TOKEN does not have write permission (or schema init failed).",
    );
    console.error(
      "        Regenerate a token WITH write access:  turso db tokens create <db-name>",
    );
    console.error("        Then update .env and re-run:            npm run db:init");
    process.exit(1);
  }

  console.log("\n[turso] Tables (required by the codebase):");
  for (const name of REQUIRED_TABLES) {
    const countResult = await db.execute({ sql: `SELECT COUNT(*) AS n FROM "${name}"`, args: [] });
    console.log(`  ✓ ${name}: ${Number(countResult.rows[0].n)} row(s)`);
  }

  const extra = [...existing].filter((t) => !REQUIRED_TABLES.includes(t));
  if (extra.length > 0) console.log(`\n[turso] Other tables present: ${extra.join(", ")}`);

  console.log("\n[done] Turso database is ready. All API routes can now use persistent storage.");
}

main().catch((err) => {
  console.error("[error] Turso initialization failed:", err.message);
  process.exit(1);
});
