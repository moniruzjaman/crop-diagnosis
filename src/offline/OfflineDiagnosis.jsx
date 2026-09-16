import { useState } from "react";
import { diagnoseOffline } from "./diagnosticEngine";
import { enrichDiagnosisWithImages } from "./visualEnrichment";

// Enhanced OfflineDiagnosis component
// Performs rule-based diagnosis AND attaches CABI reference images
// from the public/images library — entirely offline.

const styles = {
  container: {
    padding: "16px",
    background: "#f8f9fa",
    borderRadius: "12px",
    fontFamily: "'Inter','Noto Sans Bengali',sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#006a4e",
  },
  badge: {
    background: "#dcfce7",
    color: "#00503a",
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 600,
  },
  button: {
    padding: "10px 20px",
    background: "#006a4e",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  section: {
    background: "#fff",
    border: "1px solid #e2e5ea",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#006a4e",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  row: {
    marginBottom: "6px",
    fontSize: "13px",
  },
  label: {
    fontWeight: 600,
    color: "#1a1d21",
  },
  value: {
    color: "#5f6672",
  },
  imgGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: "8px",
    marginTop: "8px",
  },
  imgCard: {
    border: "1px solid #e2e5ea",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    background: "#fff",
    transition: "transform 0.15s",
  },
  img: {
    width: "100%",
    height: "90px",
    objectFit: "cover",
    display: "block",
    background: "#f4f6f8",
  },
  imgCaption: {
    padding: "4px 6px",
    fontSize: "10px",
    color: "#5f6672",
    lineHeight: 1.2,
  },
  imgPage: {
    fontSize: "9px",
    color: "#8e95a2",
    marginTop: "2px",
  },
  catChip: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 600,
    marginBottom: "2px",
  },
  visualConfidence: {
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    marginBottom: "8px",
  },
  loadingState: {
    padding: "30px",
    textAlign: "center",
    color: "#5f6672",
    fontSize: "14px",
  },
};

const CAT_COLORS = {
  Wilt: { bg: "#fef3c7", fg: "#92400e" },
  "Leaf spot": { bg: "#fee2e2", fg: "#991b1b" },
  Mosaic: { bg: "#dbeafe", fg: "#1e40af" },
  "Yellowing of leaves": { bg: "#fef9c3", fg: "#854d0e" },
  "Distortion of leaves": { bg: "#f3e8ff", fg: "#6b21a8" },
  "Little leaf": { bg: "#dcfce7", fg: "#166534" },
  "Witches' broom": { bg: "#fce7f3", fg: "#9d174d" },
  Canker: { bg: "#fed7aa", fg: "#9a3412" },
  Galls: { bg: "#d1fae5", fg: "#065f46" },
  "Drying/necrosis/blight": { bg: "#fee2e2", fg: "#7f1d1d" },
};

function catColor(cat) {
  return CAT_COLORS[cat] || { bg: "#f1f5f9", fg: "#475569" };
}

function confidenceStyle(level) {
  switch (level) {
    case "high":
      return { background: "#dcfce7", color: "#166534" };
    case "medium":
      return { background: "#fef9c3", color: "#854d0e" };
    case "low":
      return { background: "#fee2e2", color: "#991b1b" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
}

const OfflineDiagnosis = () => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState(null);

  const simulateFormData = () => ({
    symptoms: {
      leafSymptoms: "yellowing older leaves, symmetrical pattern",
      distribution: "uniform across field",
      progression: "no progression observed",
      signs: "no fruiting bodies, no ooze, no webbing",
    },
    hostInfo: {
      varietySusceptibility: "medium",
      growthStage: "vegetative",
    },
    pathogenInfo: {
      inoculumPressure: "low",
      recentHistory: "none",
    },
    envInfo: {
      temp: 28,
      humidity: 75,
      rainfall: 20,
    },
  });

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    setDiagnosis(null);
    try {
      const formData = simulateFormData();
      // Step 1: Synchronous rule-based diagnosis
      const baseResult = diagnoseOffline(formData);
      // Step 2: Async enrichment with reference images
      setEnriching(true);
      const enriched = await enrichDiagnosisWithImages(baseResult, formData);
      setDiagnosis(enriched);
    } catch (err) {
      setError("Diagnosis failed: " + err.message);
    } finally {
      setLoading(false);
      setEnriching(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingState}>
        {enriching ? (
          <>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
            CABI রেফারেন্স ইমেজ সংযুক্ত হচ্ছে...
          </>
        ) : (
          <>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔬</div>
            অফলাইন নির্ণয় চলছে...
          </>
        )}
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  }

  if (!diagnosis) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>🔬 অফলাইন নির্ণয় ইঞ্জিন</div>
          <span style={styles.badge}>CABI + Visual Library</span>
        </div>
        <p style={{ fontSize: "13px", color: "#5f6672", marginBottom: "12px" }}>
          CABI Plantwise পদ্ধতি + ২৭৮টি রেফারেন্স ইমেজ — সম্পূর্ণ অফলাইনে।
        </p>
        <button style={styles.button} onClick={handleDiagnose}>
          🚀 নির্ণয় শুরু করুন
        </button>
      </div>
    );
  }

  const refImages = diagnosis.referenceImages || { overall: [], perDisease: [], visualConfidence: "none" };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🔬 অফলাইন নির্ণয় ফলাফল</div>
        <span style={styles.badge}>CABI + Visual Library</span>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>১. অ্যাবায়োটিক বনাম বায়োটিক</div>
        <div style={styles.row}>
          <span style={styles.label}>শ্রেণী:</span> <span style={styles.value}>{diagnosis.abioticBiotic}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>২. বর্জন ও সন্দেহভাজন</div>
        <div style={styles.row}>
          <span style={styles.label}>বাদ দেওয়া হয়েছে:</span>{" "}
          <span style={styles.value}>{diagnosis.excluded.join(", ") || "কিছুই না"}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>সন্দেহভাজন:</span>{" "}
          <span style={styles.value}>{diagnosis.suspects.join(", ") || "কিছুই না"}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>প্রাথমিক সন্দেহ:</span>{" "}
          <span style={styles.value}>{diagnosis.primarySuspect}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>আস্থার মাত্রা:</span> <span style={styles.value}>{diagnosis.confidence}</span>
        </div>
      </div>

      {diagnosis.specificDisease && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>৩. সনাক্ত রোগ</div>
          <div style={styles.row}>
            <span style={styles.label}>নাম (বাংলা):</span>{" "}
            <span style={styles.value}>{diagnosis.specificDisease.nameBn}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>নাম (English):</span>{" "}
            <span style={styles.value}>{diagnosis.specificDisease.name}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>কারণ:</span> <span style={styles.value}>{diagnosis.specificDisease.cause}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>রোগজীবাণু:</span>{" "}
            <span style={styles.value}>{diagnosis.specificDisease.pathogen}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>তীব্রতা:</span>{" "}
            <span style={styles.value}>{diagnosis.specificDisease.severity}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>মিলের হার:</span>{" "}
            <span style={styles.value}>{Math.round((diagnosis.specificDisease.matchRatio || 0) * 100)}%</span>
          </div>
          {diagnosis.specificDisease.matchedSymptoms && (
            <div style={styles.row}>
              <span style={styles.label}>মিলে যাওয়া লক্ষণ:</span>{" "}
              <span style={styles.value}>{diagnosis.specificDisease.matchedSymptoms.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Visual Reference Images Section ─────────────────────────────── */}
      {refImages.overall.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>৪. CABI রেফারেন্স ইমেজ ({refImages.overall.length})</div>
          <div
            style={{
              ...styles.visualConfidence,
              ...confidenceStyle(refImages.visualConfidence),
            }}
          >
            📷 ভিজ্যুয়াল আস্থা: {refImages.visualConfidence}
          </div>
          <div style={styles.imgGrid}>
            {refImages.overall.map((entry, idx) => {
              const c = catColor(entry.category);
              return (
                <div key={`overall-${idx}`} style={styles.imgCard}>
                  <img src={entry.url} alt={`CABI page ${entry.page}`} loading="lazy" style={styles.img} />
                  <div style={styles.imgCaption}>
                    {entry.category && (
                      <span style={{ ...styles.catChip, background: c.bg, color: c.fg }}>{entry.category}</span>
                    )}
                    <div style={styles.imgPage}>📄 পৃষ্ঠা {entry.page}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Per-Disease Reference Images ────────────────────────────────── */}
      {refImages.perDisease?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>৫. রোগভিত্তিক ইমেজ</div>
          {refImages.perDisease.map((group, gidx) => (
            <div key={`group-${gidx}`} style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1d21", marginBottom: "4px" }}>
                {group.diseaseNameBn} ({group.diseaseName}) — {group.cause}
              </div>
              <div style={styles.imgGrid}>
                {group.images.map((entry, idx) => {
                  const c = catColor(entry.category);
                  return (
                    <div key={`grp-${gidx}-${idx}`} style={styles.imgCard}>
                      <img src={entry.url} alt={`CABI page ${entry.page}`} loading="lazy" style={styles.img} />
                      <div style={styles.imgCaption}>
                        {entry.category && (
                          <span style={{ ...styles.catChip, background: c.bg, color: c.fg }}>{entry.category}</span>
                        )}
                        <div style={styles.imgPage}>📄 পৃষ্ঠা {entry.page}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>৬. রোগ ত্রিভুজ</div>
        <div style={styles.row}>
          <span style={styles.label}>Host:</span> <span style={styles.value}>{diagnosis.diseaseTriangle.host}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Pathogen:</span>{" "}
          <span style={styles.value}>{diagnosis.diseaseTriangle.pathogen}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Environment:</span>{" "}
          <span style={styles.value}>{diagnosis.diseaseTriangle.environment}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Risk Level:</span>{" "}
          <span style={styles.value}>{diagnosis.diseaseTriangle.riskLevel}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>৭. মাঠে নিশ্চিতকরণ</div>
        <ul style={{ paddingLeft: "20px", fontSize: "13px" }}>
          {diagnosis.fieldConfirmation.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>৮. IPM সুপারিশ</div>
        {["cultural", "biological", "chemical", "prevention"].map((cat) => (
          <div key={cat} style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1d21", textTransform: "capitalize" }}>
              {cat}:
            </div>
            <ul style={{ paddingLeft: "20px", fontSize: "12px" }}>
              {diagnosis.ipmRecommendations[cat].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>৯. অর্থনৈতিক থ্রেশহোল্ড</div>
        <div style={styles.row}>
          <span style={styles.value}>{diagnosis.economicThreshold}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px solid #ddd",
          fontSize: "11px",
          color: "#8e95a2",
        }}
      >
        <div>নির্ণয়ের সময়: {new Date(diagnosis.timestamp).toLocaleString()}</div>
        <div style={{ marginTop: "4px" }}>
          📷 {refImages.libraryStats?.totalImages || 0} CABI রেফারেন্স ইমেজ অফলাইনে অ্যাক্সেস করা হয়েছে
        </div>
      </div>
    </div>
  );
};

export default OfflineDiagnosis;
