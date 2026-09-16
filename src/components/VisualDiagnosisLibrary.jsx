import { useState, useEffect, useMemo, useCallback } from "react";
import { buildImageIndex, getLibraryStats } from "../data/imageLibrary";

// CABI Visual Reference Library
// Lets users browse the 278 CABI Plantwise Field Guide images offline.
// Supports filtering by symptom category, page number, and free-text search.

const CATEGORY_COLORS = {
  Wilt: { bg: "#fef3c7", fg: "#92400e", border: "#fbbf24" },
  "Leaf spot": { bg: "#fee2e2", fg: "#991b1b", border: "#f87171" },
  Mosaic: { bg: "#dbeafe", fg: "#1e40af", border: "#60a5fa" },
  "Yellowing of leaves": { bg: "#fef9c3", fg: "#854d0e", border: "#facc15" },
  "Distortion of leaves": { bg: "#f3e8ff", fg: "#6b21a8", border: "#c084fc" },
  "Little leaf": { bg: "#dcfce7", fg: "#166534", border: "#4ade80" },
  "Witches' broom": { bg: "#fce7f3", fg: "#9d174d", border: "#f472b6" },
  Canker: { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c" },
  Galls: { bg: "#d1fae5", fg: "#065f46", border: "#34d399" },
  "Drying/necrosis/blight": { bg: "#fee2e2", fg: "#7f1d1d", border: "#dc2626" },
};

function catColor(cat) {
  return CATEGORY_COLORS[cat] || { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1" };
}

const styles = {
  container: {
    padding: "16px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "'Inter','Noto Sans Bengali',sans-serif",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#006a4e",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#5f6672",
    marginBottom: "12px",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e5ea",
    borderRadius: "12px",
    padding: "10px 14px",
    flex: "1 1 120px",
    minWidth: "120px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#006a4e",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: "11px",
    color: "#5f6672",
    marginTop: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  controls: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: "1 1 200px",
    minWidth: "180px",
    padding: "10px 14px",
    border: "1px solid #e2e5ea",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid #e2e5ea",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  categoryChips: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  chip: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e5ea",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.15s",
  },
  cardHover: {
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
  cardImg: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    background: "#f4f6f8",
    display: "block",
  },
  cardBody: {
    padding: "8px 10px",
  },
  cardCat: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  cardPage: {
    fontSize: "10px",
    color: "#8e95a2",
    marginTop: "4px",
  },
  cardPreview: {
    fontSize: "11px",
    color: "#5f6672",
    lineHeight: 1.3,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#8e95a2",
    fontSize: "14px",
  },
  loadingState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#5f6672",
    fontSize: "14px",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    padding: "0",
  },
  modalImg: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    background: "#000",
    display: "block",
  },
  modalBody: {
    padding: "16px 20px",
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#006a4e",
    marginBottom: "8px",
  },
  modalText: {
    fontSize: "13px",
    color: "#1a1d21",
    lineHeight: 1.5,
  },
  modalMeta: {
    marginTop: "12px",
    fontSize: "11px",
    color: "#5f6672",
    borderTop: "1px solid #e2e5ea",
    paddingTop: "8px",
  },
  modalClose: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(255,255,255,0.9)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    fontSize: "18px",
    cursor: "pointer",
    color: "#5f6672",
  },
};

const VisualDiagnosisLibrary = () => {
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalImages: 0, totalPages: 0, totalCategories: 0, categories: [] });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("page");
  const [hoveredId, setHoveredId] = useState(null);
  const [modalEntry, setModalEntry] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [idx, st] = await Promise.all([buildImageIndex(), getLibraryStats()]);
        if (!mounted) return;
        setIndex(idx);
        setStats(st);
      } catch (e) {
        console.warn("VisualDiagnosisLibrary: failed to load index", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = index;
    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) => e.keywords.includes(q) || (e.category || "").toLowerCase().includes(q) || String(e.page).includes(q),
      );
    }
    result = [...result];
    if (sortBy === "page") {
      result.sort((a, b) => a.page - b.page);
    } else if (sortBy === "category") {
      result.sort((a, b) => (a.category || "zzz").localeCompare(b.category || "zzz"));
    }
    return result;
  }, [index, selectedCategory, searchQuery, sortBy]);

  const handleCardClick = useCallback((entry) => {
    setModalEntry(entry);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalEntry(null);
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingState}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
        CABI ভিজ্যুয়াল লাইব্রেরি লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>📷 CABI ভিজ্যুয়াল রেফারেন্স লাইব্রেরি</div>
        <div style={styles.subtitle}>
          CABI Plantwise Diagnostic Field Guide থেকে ২৭৮টি রেফারেন্স ইমেজ — সম্পূর্ণ অফলাইনে ব্রাউজ করুন
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalImages}</div>
          <div style={styles.statLabel}>Total Images</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalPages}</div>
          <div style={styles.statLabel}>Book Pages</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalCategories}</div>
          <div style={styles.statLabel}>Symptom Categories</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{filtered.length}</div>
          <div style={styles.statLabel}>Matching Now</div>
        </div>
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="🔍 সার্চ করুন — symptom, page, keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
          <option value="page">Sort by Page</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      <div style={styles.categoryChips}>
        <button
          style={{
            ...styles.chip,
            background: selectedCategory === "All" ? "#006a4e" : "#f0f2f5",
            color: selectedCategory === "All" ? "#fff" : "#5f6672",
          }}
          onClick={() => setSelectedCategory("All")}
        >
          All ({index.length})
        </button>
        {stats.categories.map((cat) => {
          const count = index.filter((e) => e.category === cat).length;
          const c = catColor(cat);
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              style={{
                ...styles.chip,
                background: isActive ? c.fg : c.bg,
                color: isActive ? "#fff" : c.fg,
                border: `1px solid ${c.border}`,
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔍</div>
          কোনো ইমেজ পাওয়া যায়নি। অন্য কীওয়ার্ড বা ক্যাটেগরি চেষ্টা করুন।
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.slice(0, 60).map((entry) => {
            const c = catColor(entry.category);
            const id = `${entry.page}-${entry.image}`;
            return (
              <div
                key={id}
                style={{
                  ...styles.card,
                  ...(hoveredId === id ? styles.cardHover : {}),
                }}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleCardClick(entry)}
              >
                <img
                  src={entry.url}
                  alt={`CABI page ${entry.page}`}
                  loading="lazy"
                  style={styles.cardImg}
                  onError={(e) => {
                    e.target.style.background = "#f0f2f5";
                    e.target.style.display = "flex";
                    e.target.style.alignItems = "center";
                    e.target.style.justifyContent = "center";
                    e.target.style.color = "#8e95a2";
                    e.target.style.fontSize = "24px";
                    e.target.alt = "⚠";
                  }}
                />
                <div style={styles.cardBody}>
                  {entry.category && (
                    <span
                      style={{
                        ...styles.cardCat,
                        background: c.bg,
                        color: c.fg,
                      }}
                    >
                      {entry.category}
                    </span>
                  )}
                  <div style={styles.cardPreview}>{entry.textPreview}</div>
                  <div style={styles.cardPage}>Page {entry.page}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 60 && (
        <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#8e95a2" }}>
          প্রথম ৬০টি দেখানো হচ্ছে — আরও দেখতে সার্চ বা ফিল্টার করুন
        </div>
      )}

      {modalEntry && (
        <div style={styles.modal} onClick={handleModalClose}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={handleModalClose}>
              ✕
            </button>
            <img src={modalEntry.url} alt={`CABI page ${modalEntry.page}`} style={styles.modalImg} />
            <div style={styles.modalBody}>
              <div style={styles.modalTitle}>CABI Plantwise — Page {modalEntry.page}</div>
              {modalEntry.category &&
                (() => {
                  const c = catColor(modalEntry.category);
                  return (
                    <span
                      style={{
                        ...styles.cardCat,
                        background: c.bg,
                        color: c.fg,
                        marginBottom: "8px",
                      }}
                    >
                      {modalEntry.category}
                    </span>
                  );
                })()}
              <div style={styles.modalText}>{modalEntry.textPreview}</div>
              <div style={styles.modalMeta}>
                <div>📷 Image: {modalEntry.image}</div>
                <div>📄 Source: CABI Plantwise Diagnostic Field Guide, page {modalEntry.page}</div>
                <div>🌐 Loaded offline from /images/{modalEntry.image}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualDiagnosisLibrary;
