/**
 * Turso (LibSQL) Database Helper
 *
 * Edge-native SQLite database:
 *   - Free tier: 9GB storage, 1B reads/month, 25M writes/month
 *   - No project pausing
 *   - No quota limits for this app's usage
 *   - Low latency from Vercel serverless (edge-native)
 *
 * Required env vars:
 *   TURSO_DATABASE_URL  — e.g. libsql://your-db-name-your-org.turso.io
 *   TURSO_AUTH_TOKEN    — authentication token from Turso dashboard
 *
 * If not configured, falls back to local JSON file storage.
 */

import { createClient } from "@libsql/client";
import { promises as fs } from "fs";
import path from "path";

// ─── Singleton Turso client ────────────────────────────────────
let _tursoClient = null;

export function hasTurso() {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function getTursoClient() {
  if (_tursoClient) return _tursoClient;
  if (!hasTurso()) return null;

  _tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return _tursoClient;
}

// ─── Schema initialization (auto-creates tables) ───────────────
let _schemaInitialized = false;

export async function ensureSchema() {
  if (_schemaInitialized) return;
  const db = getTursoClient();
  if (!db) return;

  try {
    // Analytics state — single-row table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics_state (
        id TEXT PRIMARY KEY DEFAULT 'main',
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        visitors TEXT DEFAULT '{}',
        sections TEXT DEFAULT '{}',
        updated_at TEXT
      )
    `);

    // Feedback entries
    await db.execute(`
      CREATE TABLE IF NOT EXISTS feedback_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context TEXT DEFAULT '',
        rating INTEGER DEFAULT 0,
        feedback TEXT DEFAULT '',
        email TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        visitor_id TEXT DEFAULT '',
        created_at TEXT
      )
    `);

    // Online presence
    await db.execute(`
      CREATE TABLE IF NOT EXISTS presence_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL,
        section TEXT DEFAULT 'home',
        user_agent TEXT DEFAULT '',
        ip_hash TEXT DEFAULT '',
        country TEXT DEFAULT '',
        is_pwa INTEGER DEFAULT 0,
        last_heartbeat TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Index for fast presence lookups
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_presence_visitor ON presence_log(visitor_id)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_presence_heartbeat ON presence_log(last_heartbeat)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_entries(created_at)
    `);

    // Diagnoses — stores each AI diagnosis result
    await db.execute(`
      CREATE TABLE IF NOT EXISTS diagnoses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        crop TEXT NOT NULL,
        disease_name TEXT,
        disease_name_bn TEXT,
        confidence TEXT,
        severity TEXT,
        biotic_abiotic TEXT,
        provider TEXT,
        symptoms TEXT,
        recommendations TEXT,
        weather_snapshot TEXT,
        district TEXT,
        image_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON diagnoses(crop)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_diagnoses_district ON diagnoses(district)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_diagnoses_created ON diagnoses(created_at)
    `);

    // Outbreak reports — crowd-sourced disease outbreak tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS outbreak_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        district TEXT NOT NULL,
        crop TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        reporter_hash TEXT,
        confirmed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_outbreaks_district ON outbreak_reports(district)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_outbreaks_crop ON outbreak_reports(crop)
    `);

    // Ensure analytics row exists
    await db.execute(`
      INSERT OR IGNORE INTO analytics_state (id) VALUES ('main')
    `);

    // Migrate analytics_state table columns if table was created with an older schema
    try {
      const colInfo = await db.execute("PRAGMA table_info(analytics_state)");
      const existingCols = new Set(colInfo.rows.map((r) => r.name));
      if (!existingCols.has("visitors")) {
        await db.execute("ALTER TABLE analytics_state ADD COLUMN visitors TEXT DEFAULT '{}'");
      }
      if (!existingCols.has("sections")) {
        await db.execute("ALTER TABLE analytics_state ADD COLUMN sections TEXT DEFAULT '{}'");
      }
    } catch (migErr) {
      console.warn("Turso analytics_state migration warning:", migErr.message);
    }

    _schemaInitialized = true;
  } catch (err) {
    console.error("Turso schema init error:", err.message);
  }
}

// ─── Local file fallback ────────────────────────────────────────
const DEFAULT_DATA = {
  totalVisits: 0,
  uniqueVisitors: 0,
  visitors: {},
  sections: {},
  feedback: [],
  updatedAt: null,
};

function getStoragePath() {
  if (process.env.VERCEL) return path.join("/tmp", "cabi-analytics.json");
  return path.join(process.cwd(), ".data", "cabi-analytics.json");
}

// ─── Read/Write store (Turso → local file fallback) ────────────

export async function readStore() {
  const db = getTursoClient();

  if (db) {
    try {
      await ensureSchema();
      const result = await db.execute("SELECT * FROM analytics_state WHERE id = 'main'");
      const row = result.rows[0];

      if (row) {
        return {
          ...DEFAULT_DATA,
          totalVisits: Number(row.total_visits) || 0,
          uniqueVisitors: Number(row.unique_visitors) || 0,
          visitors: typeof row.visitors === "string" ? JSON.parse(row.visitors) : (row.visitors || {}),
          sections: typeof row.sections === "string" ? JSON.parse(row.sections) : (row.sections || {}),
          updatedAt: row.updated_at || null,
        };
      }
    } catch (err) {
      console.error("Turso readStore error:", err.message);
    }
    return { ...DEFAULT_DATA };
  }

  // Fallback: local JSON file
  const filePath = getStoragePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function writeStore(data) {
  const db = getTursoClient();

  if (db) {
    try {
      await ensureSchema();
      await db.execute({
        sql: `UPDATE analytics_state SET
                total_visits = ?,
                unique_visitors = ?,
                visitors = ?,
                sections = ?,
                updated_at = ?
              WHERE id = 'main'`,
        args: [
          data.totalVisits || 0,
          data.uniqueVisitors || 0,
          JSON.stringify(data.visitors || {}),
          JSON.stringify(data.sections || {}),
          new Date().toISOString(),
        ],
      });
      return;
    } catch (err) {
      console.error("Turso writeStore error:", err.message);
    }
  }

  // Fallback: local JSON file
  const filePath = getStoragePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export async function appendFeedback(item) {
  const db = getTursoClient();

  if (db) {
    try {
      await ensureSchema();
      await db.execute({
        sql: `INSERT INTO feedback_entries (context, rating, feedback, email, summary, visitor_id, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.context || "Unknown",
          item.rating || 0,
          item.feedback || "",
          item.email || "",
          item.summary || "",
          item.visitorId || "",
          item.createdAt || new Date().toISOString(),
        ],
      });
      return;
    } catch (err) {
      console.error("Turso appendFeedback error:", err.message);
    }
  }

  // Fallback: append to local store
  const store = await readStore();
  store.feedback = [...(store.feedback || []), item].slice(-200);
  await writeStore(store);
}

// ─── Presence helpers ───────────────────────────────────────────

export async function upsertPresence(visitorId, section, userAgent, ipHash, country, isPwa) {
  const db = getTursoClient();
  if (!db) return;

  try {
    await ensureSchema();
    const now = new Date().toISOString();

    // Check existing
    const existing = await db.execute({
      sql: "SELECT id FROM presence_log WHERE visitor_id = ? LIMIT 1",
      args: [visitorId],
    });

    if (existing.rows.length > 0) {
      // Update heartbeat
      await db.execute({
        sql: `UPDATE presence_log SET
                section = ?, user_agent = ?, ip_hash = ?, country = ?,
                is_pwa = ?, last_heartbeat = ?
              WHERE id = ?`,
        args: [section || "home", (userAgent || "").slice(0, 500), ipHash, (country || "").slice(0, 100), isPwa ? 1 : 0, now, existing.rows[0].id],
      });
    } else {
      // Insert new
      await db.execute({
        sql: `INSERT INTO presence_log (visitor_id, section, user_agent, ip_hash, country, is_pwa, last_heartbeat, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [visitorId, section || "home", (userAgent || "").slice(0, 500), ipHash, (country || "").slice(0, 100), isPwa ? 1 : 0, now, now],
      });
    }
  } catch (err) {
    console.error("Turso upsertPresence error:", err.message);
  }
}

export async function removePresence(visitorId) {
  const db = getTursoClient();
  if (!db) return;

  try {
    await db.execute({
      sql: "DELETE FROM presence_log WHERE visitor_id = ?",
      args: [visitorId],
    });
  } catch (err) {
    console.error("Turso removePresence error:", err.message);
  }
}

export async function getOnlineStats(heartbeatWindowMinutes = 5) {
  const db = getTursoClient();
  if (!db) return { onlineCount: 0, bySection: {}, visitors: [] };

  try {
    const cutoff = new Date(Date.now() - heartbeatWindowMinutes * 60 * 1000).toISOString();

    const result = await db.execute({
      sql: `SELECT visitor_id, section, user_agent, is_pwa, last_heartbeat, country, created_at
            FROM presence_log
            WHERE last_heartbeat >= ?
            ORDER BY last_heartbeat DESC`,
      args: [cutoff],
    });

    // Deduplicate by visitor_id (keep latest)
    const seen = new Map();
    for (const row of result.rows) {
      const vid = row.visitor_id;
      if (!seen.has(vid) || new Date(row.last_heartbeat) > new Date(seen.get(vid).last_heartbeat)) {
        seen.set(vid, row);
      }
    }

    const visitors = Array.from(seen.values());
    const bySection = {};
    for (const v of visitors) {
      bySection[v.section] = (bySection[v.section] || 0) + 1;
    }

    return {
      onlineCount: visitors.length,
      bySection,
      visitors: visitors.slice(0, 50).map((v) => ({
        visitorId: String(v.visitor_id).slice(0, 12) + "...",
        section: v.section,
        isPwa: !!v.is_pwa,
        lastSeen: v.last_heartbeat,
        country: v.country,
      })),
    };
  } catch (err) {
    console.error("Turso getOnlineStats error:", err.message);
    return { onlineCount: 0, bySection: {}, visitors: [] };
  }
}

export async function getDailyStats(days = 7) {
  const db = getTursoClient();
  if (!db) return [];

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.execute({
      sql: `SELECT visitor_id, section, created_at
            FROM presence_log
            WHERE created_at >= ?
            ORDER BY created_at ASC`,
      args: [since],
    });

    const byDate = {};
    for (const row of result.rows) {
      const date = String(row.created_at).split("T")[0];
      if (!date) continue;
      if (!byDate[date]) byDate[date] = { date, uniqueVisitors: new Set(), sections: {}, totalVisits: 0 };
      byDate[date].uniqueVisitors.add(row.visitor_id);
      byDate[date].sections[row.section] = (byDate[date].sections[row.section] || 0) + 1;
      byDate[date].totalVisits++;
    }

    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: d.date,
        uniqueVisitors: d.uniqueVisitors.size,
        totalVisits: d.totalVisits,
        sections: d.sections,
      }));
  } catch (err) {
    console.error("Turso getDailyStats error:", err.message);
    return [];
  }
}

export async function cleanupStalePresence(maxAgeMinutes = 15) {
  const db = getTursoClient();
  if (!db) return;

  try {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
    await db.execute({
      sql: "DELETE FROM presence_log WHERE last_heartbeat < ?",
      args: [cutoff],
    });
  } catch (err) {
    console.error("Turso cleanupStalePresence error:", err.message);
  }
}

// ─── Diagnoses helpers ──────────────────────────────────────────

export async function saveDiagnosis(entry) {
  const db = getTursoClient();
  if (!db) return null;

  try {
    await ensureSchema();
    const result = await db.execute({
      sql: `INSERT INTO diagnoses (session_id, crop, disease_name, disease_name_bn, confidence, severity, biotic_abiotic, provider, symptoms, recommendations, weather_snapshot, district, image_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        entry.session_id || "",
        entry.crop || "unknown",
        entry.disease_name || null,
        entry.disease_name_bn || null,
        entry.confidence || null,
        entry.severity || null,
        entry.biotic_abiotic || null,
        entry.provider || null,
        entry.symptoms || null,
        entry.recommendations || null,
        entry.weather_snapshot || null,
        entry.district || null,
        entry.image_count || 0,
      ],
    });
    return result.lastInsertRowid;
  } catch (err) {
    console.error("Turso saveDiagnosis error:", err.message);
    return null;
  }
}

export async function getDiagnoses(filters = {}) {
  const db = getTursoClient();
  if (!db) return [];

  try {
    await ensureSchema();
    const { crop, district, dateFrom, dateTo, limit = 50 } = filters;
    const conditions = [];
    const args = [];

    if (crop) {
      conditions.push("crop = ?");
      args.push(crop);
    }
    if (district) {
      conditions.push("district = ?");
      args.push(district);
    }
    if (dateFrom) {
      conditions.push("created_at >= ?");
      args.push(dateFrom);
    }
    if (dateTo) {
      conditions.push("created_at <= ?");
      args.push(dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);

    const result = await db.execute({
      sql: `SELECT * FROM diagnoses ${where} ORDER BY created_at DESC LIMIT ?`,
      args: [...args, safeLimit],
    });

    return result.rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      crop: row.crop,
      diseaseName: row.disease_name,
      diseaseNameBn: row.disease_name_bn,
      confidence: row.confidence,
      severity: row.severity,
      bioticAbiotic: row.biotic_abiotic,
      provider: row.provider,
      symptoms: row.symptoms,
      recommendations: row.recommendations,
      weatherSnapshot: row.weather_snapshot,
      district: row.district,
      imageCount: row.image_count,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error("Turso getDiagnoses error:", err.message);
    return [];
  }
}

// ─── Outbreak helpers ───────────────────────────────────────────

export async function reportOutbreak(entry) {
  const db = getTursoClient();
  if (!db) return null;

  try {
    await ensureSchema();
    const result = await db.execute({
      sql: `INSERT INTO outbreak_reports (district, crop, disease_name, reporter_hash, confirmed)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        entry.district || "unknown",
        entry.crop || "unknown",
        entry.disease_name || "unknown",
        entry.reporter_hash || null,
        entry.confirmed ? 1 : 0,
      ],
    });
    return result.lastInsertRowid;
  } catch (err) {
    console.error("Turso reportOutbreak error:", err.message);
    return null;
  }
}

export async function getOutbreaks(filters = {}) {
  const db = getTursoClient();
  if (!db) return [];

  try {
    await ensureSchema();
    const { district, crop, recentDays, limit = 50 } = filters;
    const conditions = [];
    const args = [];

    if (district) {
      conditions.push("district = ?");
      args.push(district);
    }
    if (crop) {
      conditions.push("crop = ?");
      args.push(crop);
    }
    if (recentDays) {
      const since = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000).toISOString();
      conditions.push("created_at >= ?");
      args.push(since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);

    const result = await db.execute({
      sql: `SELECT * FROM outbreak_reports ${where} ORDER BY created_at DESC LIMIT ?`,
      args: [...args, safeLimit],
    });

    return result.rows.map((row) => ({
      id: row.id,
      district: row.district,
      crop: row.crop,
      diseaseName: row.disease_name,
      reporterHash: row.reporter_hash,
      confirmed: !!row.confirmed,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error("Turso getOutbreaks error:", err.message);
    return [];
  }
}

// ─── Disease statistics ─────────────────────────────────────────

export async function getDiseaseStats(days = 30) {
  const db = getTursoClient();
  if (!db) return { topCrops: [], topDiseases: [], byDistrict: [], byBioticAbiotic: {}, trend: [] };

  try {
    await ensureSchema();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Top crops
    const cropsResult = await db.execute({
      sql: `SELECT crop, COUNT(*) as count FROM diagnoses WHERE created_at >= ? GROUP BY crop ORDER BY count DESC LIMIT 20`,
      args: [since],
    });

    // Top diseases
    const diseasesResult = await db.execute({
      sql: `SELECT disease_name, COUNT(*) as count FROM diagnoses WHERE created_at >= ? AND disease_name IS NOT NULL GROUP BY disease_name ORDER BY count DESC LIMIT 20`,
      args: [since],
    });

    // By district
    const districtResult = await db.execute({
      sql: `SELECT district, COUNT(*) as count FROM diagnoses WHERE created_at >= ? AND district IS NOT NULL GROUP BY district ORDER BY count DESC LIMIT 20`,
      args: [since],
    });

    // Biotic vs abiotic
    const bioticResult = await db.execute({
      sql: `SELECT biotic_abiotic, COUNT(*) as count FROM diagnoses WHERE created_at >= ? AND biotic_abiotic IS NOT NULL GROUP BY biotic_abiotic`,
      args: [since],
    });

    // Trend: daily counts
    const trendResult = await db.execute({
      sql: `SELECT date(created_at) as day, COUNT(*) as count FROM diagnoses WHERE created_at >= ? GROUP BY day ORDER BY day ASC`,
      args: [since],
    });

    return {
      topCrops: cropsResult.rows.map((r) => ({ crop: r.crop, count: Number(r.count) })),
      topDiseases: diseasesResult.rows.map((r) => ({ diseaseName: r.disease_name, count: Number(r.count) })),
      byDistrict: districtResult.rows.map((r) => ({ district: r.district, count: Number(r.count) })),
      byBioticAbiotic: Object.fromEntries(bioticResult.rows.map((r) => [r.biotic_abiotic, Number(r.count)])),
      trend: trendResult.rows.map((r) => ({ date: r.day, count: Number(r.count) })),
      days,
    };
  } catch (err) {
    console.error("Turso getDiseaseStats error:", err.message);
    return { topCrops: [], topDiseases: [], byDistrict: [], byBioticAbiotic: {}, trend: [], days };
  }
}
