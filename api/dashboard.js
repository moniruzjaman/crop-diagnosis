// Live Analytics Dashboard — HTML page served at /api/dashboard
// Visit: https://cabi-diagnosis.vercel.app/api/dashboard
// Auto-refreshes every 10 seconds with real-time presence data

import { readStore } from "./storage.js";
import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { analyticsLimiter } from "./_lib/rateLimit.js";
import { getDiseaseStats, getOutbreaks, hasTurso } from "./_lib/turso.js";

// Allowed hosts for internal API calls (SSRF protection)
const ALLOWED_HOSTS = [
  "cabi-diagnosis.vercel.app",
  "cabi-diagnosis-git-main-moniruzjamans-projects.vercel.app",
];

function getSafeBaseUrl(req) {
  const forwardedHost = req.headers["x-forwarded-host"] || "";
  // Only trust known Vercel deployment hosts
  if (forwardedHost && (ALLOWED_HOSTS.includes(forwardedHost) || forwardedHost.endsWith(".vercel.app"))) {
    return `https://${forwardedHost}`;
  }
  // Fallback: no base URL (relative path works on Vercel)
  return "";
}

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, OPTIONS");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit dashboard access
  if (analyticsLimiter(req, res)) return;

  res.setHeader("Cache-Control", "no-store");

  // If JSON requested, return raw data
  if (req.query?.format === "json") {
    try {
      const store = await readStore();
      const visitorList = Object.entries(store.visitors || {})
        .sort((a, b) => new Date(b[1].lastSeen) - new Date(a[1].lastSeen));
      return res.status(200).json({
        totalVisits: store.totalVisits || 0,
        uniqueVisitors: store.uniqueVisitors || 0,
        sections: store.sections || {},
        recentVisitors: visitorList.slice(0, 50).map(([id, v]) => ({
          id: id.slice(0, 12) + "...",
          firstSeen: v.firstSeen,
          lastSeen: v.lastSeen,
          visits: v.visits,
        })),
        updatedAt: store.updatedAt,
        persistence: (process.env.TURSO_DATABASE_URL)
          ? "turso"
          : process.env.VERCEL
            ? "vercel-tmp-storage"
            : "local-file",
      });
    } catch (err) {
      console.error("Dashboard JSON error:", err.message);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  }

  // If presence JSON requested
  if (req.query?.format === "presence") {
    try {
      const baseUrl = getSafeBaseUrl(req);
      const presenceRes = await fetch(`${baseUrl}/api/presence`);
      const data = await presenceRes.json();
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ onlineCount: 0, bySection: {}, recentVisitors: [] });
    }
  }

  // If disease stats JSON requested
  if (req.query?.format === "disease") {
    if (!hasTurso()) {
      return res.status(200).json({ error: "Database not configured", diseaseStats: null });
    }
    try {
      const days = Math.min(Math.max(parseInt(req.query?.days) || 30, 1), 365);
      const diseaseStats = await getDiseaseStats(days);
      return res.status(200).json({ diseaseStats, days });
    } catch (_err) { // eslint-disable-line no-unused-vars
      return res.status(500).json({ error: "Failed to fetch disease stats" });
    }
  }

  // If outbreak heatmap JSON requested
  if (req.query?.format === "outbreaks") {
    if (!hasTurso()) {
      return res.status(200).json({ error: "Database not configured", outbreaks: [] });
    }
    try {
      const recentDays = Math.min(Math.max(parseInt(req.query?.days) || 30, 1), 365);
      const outbreaks = await getOutbreaks({ recentDays, limit: 200 });
      // Group by district for heatmap
      const heatmap = {};
      for (const o of outbreaks) {
        const key = o.district;
        if (!heatmap[key]) heatmap[key] = { district: key, crops: {}, total: 0 };
        heatmap[key].total++;
        heatmap[key].crops[o.crop] = (heatmap[key].crops[o.crop] || 0) + 1;
      }
      return res.status(200).json({
        outbreaks: outbreaks.slice(0, 50),
        heatmap: Object.values(heatmap).sort((a, b) => b.total - a.total),
        recentDays,
      });
    } catch (_err) { // eslint-disable-line no-unused-vars
      return res.status(500).json({ error: "Failed to fetch outbreaks" });
    }
  }

  // Otherwise serve the live dashboard HTML
  let store;
  try {
    store = await readStore();
  } catch (err) {
    console.error("Dashboard HTML readStore error:", err.message);
    store = { totalVisits: 0, uniqueVisitors: 0, sections: {}, visitors: {}, updatedAt: null };
  }

  // Fetch presence data
  let presence = { onlineCount: 0, bySection: {}, recentVisitors: [], dailyStats: [], persistence: "none" };
  try {
    const baseUrl = getSafeBaseUrl(req);
    const presenceRes = await fetch(`${baseUrl}/api/presence?days=7`);
    presence = await presenceRes.json();
  } catch {}

  // Fetch disease stats data
  let diseaseStats = null;
  let outbreakData = null;
  if (hasTurso()) {
    try {
      [diseaseStats, outbreakData] = await Promise.all([
        getDiseaseStats(30),
        getOutbreaks({ recentDays: 30, limit: 100 }),
      ]);
    } catch {}
  }

  const data = {
    totalVisits: store.totalVisits || 0,
    uniqueVisitors: store.uniqueVisitors || 0,
    sections: store.sections || {},
    visitors: store.visitors || {},
    updatedAt: store.updatedAt,
  };

  const visitors = Object.entries(data.visitors)
    .sort((a, b) => new Date(b[1].lastSeen) - new Date(a[1].lastSeen));

  const todayVisitors = visitors.filter(
    (v) => new Date(v[1].lastSeen).toDateString() === new Date().toDateString()
  ).length;

  const todayVisits = visitors
    .filter((v) => new Date(v[1].lastSeen).toDateString() === new Date().toDateString())
    .reduce((sum, v) => sum + (v[1].visits || 0), 0);

  const onlineCount = presence.onlineCount || 0;
  const bySection = presence.bySection || {};

  const sectionLabels = {
    home: "🏠 হোম",
    app_open: "🚀 অ্যাপ ওপেন",
    guide: "📖 CABI গাইড",
    game: "🎮 গেম হাব",
    diagnose: "🔬 নির্ণয়",
    library: "📚 ভান্ডার",
    more: "⚙️ আরও",
    apps: "🌐 অ্যাপস",
    history: "📋 ইতিহাস",
    learn: "📖 শিখুন",
  };

  const sectionRows = Object.entries(data.sections || {})
    .sort((a, b) => b[1] - a[1])
    .map(
      ([key, val]) => `
      <tr>
        <td style="padding:10px 14px;font-weight:600;">${sectionLabels[key] || key}</td>
        <td style="padding:10px 14px;text-align:right;">${val.toLocaleString()}</td>
        <td style="padding:10px 14px;text-align:right;width:80px;">${data.totalVisits > 0 ? ((val / data.totalVisits) * 100).toFixed(1) : 0}%</td>
        <td style="padding:10px 14px;width:120px;">
          <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#006a4e,#0b8457);height:100%;width:${data.totalVisits > 0 ? ((val / data.totalVisits) * 100) : 0}%;border-radius:4px;"></div>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const liveSectionRows = Object.entries(bySection)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([key, val]) => `
      <tr>
        <td style="padding:8px 14px;font-weight:600;">${sectionLabels[key] || key}</td>
        <td style="padding:8px 14px;text-align:right;font-weight:700;color:#16a34a;">${val}</td>
        <td style="padding:8px 14px;width:100px;">
          <div style="background:#dcfce7;border-radius:4px;height:8px;overflow:hidden;">
            <div style="background:#16a34a;height:100%;width:${onlineCount > 0 ? ((val / onlineCount) * 100) : 0}%;border-radius:4px;"></div>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const recentPresenceRows = (presence.recentVisitors || [])
    .slice(0, 15)
    .map(
      (v) => `
    <tr>
      <td style="padding:6px 14px;font-family:monospace;font-size:11px;color:#6b7280;">${v.visitorId}</td>
      <td style="padding:6px 14px;font-size:12px;">${sectionLabels[v.section] || v.section}</td>
      <td style="padding:6px 14px;font-size:11px;">${v.isPwa ? "📱" : "🌐"}</td>
      <td style="padding:6px 14px;font-size:11px;">${v.country ? v.country.toUpperCase() : "-"}</td>
      <td style="padding:6px 14px;font-size:11px;color:#16a34a;">● Active</td>
    </tr>`
    )
    .join("");

  const dailyRows = (presence.dailyStats || [])
    .reverse()
    .slice(0, 7)
    .map(
      (d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.date}</td>
      <td style="padding:8px 14px;text-align:right;">${d.uniqueVisitors}</td>
      <td style="padding:8px 14px;text-align:right;">${d.totalVisits}</td>
      <td style="padding:8px 14px;font-size:11px;">${Object.entries(d.sections || {}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${sectionLabels[k]||k}: ${v}`).join(", ")}</td>
    </tr>`
    )
    .join("");

  const recentRows = visitors.slice(0, 20).map(
    ([id, v]) => `
    <tr>
      <td style="padding:8px 14px;font-family:monospace;font-size:12px;color:#6b7280;">${id.slice(0, 16)}...</td>
      <td style="padding:8px 14px;text-align:center;">${v.visits}</td>
      <td style="padding:8px 14px;font-size:12px;">${new Date(v.firstSeen).toLocaleDateString("bn-BD")}</td>
      <td style="padding:8px 14px;font-size:12px;">${formatTimeAgo(v.lastSeen)}</td>
    </tr>`
  ).join("");

  const persistenceLabel = presence.persistence === "turso" ? "☁️ Turso" : "💾 Local/Temp";

  // Disease stats HTML sections
  const topDiseaseRows = diseaseStats?.topDiseases?.length
    ? diseaseStats.topDiseases.slice(0, 10).map((d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.diseaseName}</td>
      <td style="padding:8px 14px;text-align:right;font-weight:700;color:#006a4e;">${d.count}</td>
    </tr>`).join("")
    : '<tr><td colspan="2" style="text-align:center;padding:20px;color:#9ca3af;">কোনো রোগের তথ্য নেই</td></tr>';

  const topCropRows = diseaseStats?.topCrops?.length
    ? diseaseStats.topCrops.slice(0, 10).map((d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.crop}</td>
      <td style="padding:8px 14px;text-align:right;font-weight:700;color:#006a4e;">${d.count}</td>
    </tr>`).join("")
    : '<tr><td colspan="2" style="text-align:center;padding:20px;color:#9ca3af;">কোনো ফসলের তথ্য নেই</td></tr>';

  const diseaseByDistrictRows = diseaseStats?.byDistrict?.length
    ? diseaseStats.byDistrict.slice(0, 10).map((d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.district}</td>
      <td style="padding:8px 14px;text-align:right;font-weight:700;color:#006a4e;">${d.count}</td>
    </tr>`).join("")
    : '<tr><td colspan="2" style="text-align:center;padding:20px;color:#9ca3af;">কোনো জেলার তথ্য নেই</td></tr>';

  const diseaseTrendRows = diseaseStats?.trend?.length
    ? diseaseStats.trend.slice(-14).map((d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.date}</td>
      <td style="padding:8px 14px;text-align:right;">${d.count}</td>
      <td style="padding:8px 14px;width:150px;">
        <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#b91c1c,#ef4444);height:100%;width:${diseaseStats.trend.length > 0 ? Math.max((d.count / Math.max(...diseaseStats.trend.map(t => t.count), 1)) * 100, 2) : 0}%;border-radius:4px;"></div>
        </div>
      </td>
    </tr>`).join("")
    : '<tr><td colspan="3" style="text-align:center;padding:20px;color:#9ca3af;">কোনো ট্রেন্ড তথ্য নেই</td></tr>';

  // Outbreak heatmap: group by district
  const outbreakHeatmap = {};
  if (outbreakData?.length) {
    for (const o of outbreakData) {
      const key = o.district;
      if (!outbreakHeatmap[key]) outbreakHeatmap[key] = { district: key, diseases: {}, total: 0 };
      outbreakHeatmap[key].total++;
      outbreakHeatmap[key].diseases[o.diseaseName] = (outbreakHeatmap[key].diseases[o.diseaseName] || 0) + 1;
    }
  }
  const outbreakHeatmapRows = Object.values(outbreakHeatmap).sort((a, b) => b.total - a.total).slice(0, 15).map((d) => `
    <tr>
      <td style="padding:8px 14px;font-weight:600;">${d.district}</td>
      <td style="padding:8px 14px;text-align:right;font-weight:700;color:#b91c1c;">${d.total}</td>
      <td style="padding:8px 14px;font-size:11px;">${Object.entries(d.diseases).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} (${v})`).join(", ")}</td>
    </tr>`).join("") || '<tr><td colspan="3" style="text-align:center;padding:20px;color:#9ca3af;">কোনো প্রাদুর্ভাবের তথ্য নেই</td></tr>';

  const bioticAbioticInfo = diseaseStats?.byBioticAbiotic
    ? Object.entries(diseaseStats.byBioticAbiotic).map(([k, v]) => `${k}: ${v}`).join(" · ")
    : "";

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>🌿 Analytics Dashboard — উদ্ভিদ গোয়েন্দা</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f0f2f5;color:#1a1a2e;line-height:1.6}
.header{background:linear-gradient(135deg,#006a4e,#00503a);color:#fff;padding:24px;text-align:center}
.header h1{font-size:22px;margin-bottom:4px}
.header p{font-size:13px;opacity:.8}
.container{max-width:960px;margin:20px auto;padding:0 16px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.stat-card{background:#fff;border-radius:14px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center}
.stat-card .number{font-size:32px;font-weight:800;color:#006a4e;line-height:1.1}
.stat-card .label{font-size:11px;color:#6b7280;margin-top:6px;font-weight:600}
.stat-card.highlight{background:linear-gradient(135deg,#006a4e,#0b8457);color:#fff}
.stat-card.highlight .number{color:#fff}
.stat-card.highlight .label{color:rgba(255,255,255,.8)}
.stat-card.warning{background:linear-gradient(135deg,#b91c1c,#ef4444);color:#fff}
.stat-card.warning .number{color:#fff}
.stat-card.warning .label{color:rgba(255,255,255,.8)}
.stat-card.online{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;animation:glow 3s infinite}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(34,197,94,.3)}50%{box-shadow:0 0 30px rgba(34,197,94,.6)}}
.stat-card.online .number{color:#fff}
.stat-card.online .label{color:rgba(255,255,255,.8)}
.card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:16px;overflow:hidden}
.card h2{font-size:16px;color:#1a1a2e;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #f0f2f5}
.card h2 .badge{font-size:10px;padding:2px 8px;border-radius:12px;background:#dcfce7;color:#16a34a;font-weight:700;vertical-align:middle;margin-left:8px}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 14px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;font-weight:700;border-bottom:1px solid #f0f2f5}
td{border-bottom:1px solid #f9fafb;font-size:13px}
tr:hover{background:#f9fafb}
.footer{text-align:center;padding:20px;font-size:11px;color:#9ca3af}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.refresh-note{text-align:center;margin:12px 0;font-size:12px;color:#6b7280}
.persistence-badge{display:inline-block;padding:3px 10px;border-radius:20px;background:#f0fdf4;border:1px solid #bbf7d0;font-size:11px;color:#16a34a;font-weight:600}
</style>
</head>
<body>
<div class="header">
  <h1>🌿 উদ্ভিদ গোয়েন্দা — Live Analytics</h1>
  <p>Real-time user activity dashboard · Auto-refreshes every 10s · <span class="persistence-badge">${persistenceLabel}</span></p>
</div>
<div class="container">
  <div class="stats">
    <div class="stat-card online">
      <div class="number"><span class="live-dot"></span><span id="online-count">${onlineCount}</span></div>
      <div class="label">🟢 এখন অনলাইন</div>
    </div>
    <div class="stat-card highlight">
      <div class="number">${data.uniqueVisitors.toLocaleString()}</div>
      <div class="label">👤 মোট ইউজার</div>
    </div>
    <div class="stat-card">
      <div class="number">${data.totalVisits.toLocaleString()}</div>
      <div class="label">👁️ মোট ভিজিট</div>
    </div>
    <div class="stat-card">
      <div class="number">${todayVisitors}</div>
      <div class="label">📅 আজকের ইউজার</div>
    </div>
    <div class="stat-card">
      <div class="number">${todayVisits}</div>
      <div class="label">📅 আজকের ভিজিট</div>
    </div>
    ${diseaseStats ? `
    <div class="stat-card warning">
      <div class="number">${diseaseStats.topDiseases?.length || 0}</div>
      <div class="label">🦠 শনাক্ত রোগ (৩০ দিন)</div>
    </div>
    <div class="stat-card">
      <div class="number">${diseaseStats.trend?.reduce((s, t) => s + t.count, 0) || 0}</div>
      <div class="label">🔬 মোট নির্ণয় (৩০ দিন)</div>
    </div>` : ""}
  </div>

  <div class="card">
    <h2>🟢 এখন অনলাইন যারা আছেন <span class="badge">LIVE</span></h2>
    <table>
      <thead><tr><th>সেকশন</th><th style="text-align:right">জন</th><th style="width:100px"></th></tr></thead>
      <tbody>${liveSectionRows || '<tr><td colspan="3" style="text-align:center;padding:20px;color:#9ca3af;">কেউ অনলাইন নেই</td></tr>'}</tbody>
    </table>
  </div>

  ${recentPresenceRows ? `
  <div class="card">
    <h2>📡 সর্বশেষ সক্রিয় ইউজার <span class="badge">LIVE</span></h2>
    <table>
      <thead><tr><th>ভিজিটর</th><th>সেকশন</th><th>ধরন</th><th>দেশ</th><th>স্ট্যাটাস</th></tr></thead>
      <tbody>${recentPresenceRows}</tbody>
    </table>
  </div>` : ""}

  ${dailyRows ? `
  <div class="card">
    <h2>📊 দৈনিক পরিসংখ্যান (গত ৭ দিন)</h2>
    <table>
      <thead><tr><th>তারিখ</th><th style="text-align:right">ইউজার</th><th style="text-align:right">ভিজিট</th><th>শীর্ষ সেকশন</th></tr></thead>
      <tbody>${dailyRows}</tbody>
    </table>
  </div>` : ""}

  <div class="card">
    <h2>📊 সেকশন অনুযায়ী ব্যবহার (সব সময়)</h2>
    <table>
      <thead><tr><th>সেকশন</th><th style="text-align:right">ভিজিট</th><th style="text-align:right">শতাংশ</th><th></th></tr></thead>
      <tbody>${sectionRows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#9ca3af;">এখনো কোনো ডেটা নেই</td></tr>'}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>👥 সাম্প্রতিক ইউজার (সর্বশেষ ২০)</h2>
    <table>
      <thead><tr><th>ভিজিটর ID</th><th style="text-align:center">ভিজিট</th><th>প্রথম দেখা</th><th>শেষ সক্রিয়</th></tr></thead>
      <tbody>${recentRows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#9ca3af;">এখনো কোনো ইউজার নেই</td></tr>'}</tbody>
    </table>
  </div>

  ${diseaseStats ? `
  <div class="card">
    <h2>🦠 সর্বোচ্চ রোগ (গত ৩০ দিন)${bioticAbioticInfo ? ` <span style="font-size:11px;color:#6b7280;">(${bioticAbioticInfo})</span>` : ""}</h2>
    <table>
      <thead><tr><th>রোগের নাম</th><th style="text-align:right">সংখ্যা</th></tr></thead>
      <tbody>${topDiseaseRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>🌾 সর্বোচ্চ ফসল (গত ৩০ দিন)</h2>
    <table>
      <thead><tr><th>ফসল</th><th style="text-align:right">নির্ণয় সংখ্যা</th></tr></thead>
      <tbody>${topCropRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>📍 জেলা অনুযায়ী রোগ (গত ৩০ দিন)</h2>
    <table>
      <thead><tr><th>জেলা</th><th style="text-align:right">নির্ণয় সংখ্যা</th></tr></thead>
      <tbody>${diseaseByDistrictRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>📈 রোগ ট্রেন্ড (গত ১৪ দিন)</h2>
    <table>
      <thead><tr><th>তারিখ</th><th style="text-align:right">নির্ণয়</th><th></th></tr></thead>
      <tbody>${diseaseTrendRows}</tbody>
    </table>
  </div>
  ` : ""}

  ${outbreakData?.length ? `
  <div class="card">
    <h2>🔥 প্রাদুর্ভাব হিটম্যাপ (গত ৩০ দিন) <span class="badge">OUTBREAK</span></h2>
    <table>
      <thead><tr><th>জেলা</th><th style="text-align:right">রিপোর্ট</th><th>শীর্ষ রোগ</th></tr></thead>
      <tbody>${outbreakHeatmapRows}</tbody>
    </table>
  </div>
  ` : ""}

  <div class="refresh-note">🔄 ১০ সেকেন্ড পর পর অটো-রিফ্রেশ · শেষ আপডেট: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString("bn-BD") : "N/A"}</div>
</div>
<div class="footer">
  উদ্ভিদ গোয়েন্দা · CABI Plantwise · DAE Bangladesh<br>
  <a href="/api/dashboard?format=json" style="color:#006a4e;">Analytics JSON</a> ·
  <a href="/api/presence" style="color:#006a4e;">Presence JSON</a> ·
  <a href="/api/dashboard?format=disease" style="color:#006a4e;">Disease Stats</a> ·
  <a href="/api/dashboard?format=outbreaks" style="color:#006a4e;">Outbreak Heatmap</a> ·
  <a href="/" style="color:#006a4e;">অ্যাপে ফিরুন</a>
</div>
<script>
// Auto-refresh online count every 10 seconds
async function refreshPresence(){
  try{
    const r=await fetch('/api/presence?days=7');
    const d=await r.json();
    const el=document.getElementById('online-count');
    if(el)el.textContent=d.onlineCount||0;
  }catch{}
}
setInterval(refreshPresence,10000);
// Full page refresh every 60 seconds
setTimeout(()=>{location.reload()},60000);
</script>
</body>
</html>`;

  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return mins + " মিনিট আগে";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " ঘণ্টা আগে";
    const days = Math.floor(hrs / 24);
    return days + " দিন আগে";
  }

  return res.status(200).setHeader("Content-Type", "text/html").send(html);
}
