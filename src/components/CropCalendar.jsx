import { useState, useMemo } from "react";
import { CROP_CALENDAR, BENGALI_MONTHS, GREGORIAN_MONTHS, SEASON_COLORS } from "../data/cropCalendar";

/**
 * CropCalendar Component
 *
 * A visual 12-month × 10-crop calendar grid showing seasonal activities.
 * Highlights current month, click a crop row for seasonal details.
 * Uses the existing C color tokens pattern (receives C as prop).
 * Bengali + Gregorian month labels. Responsive mobile-first layout.
 */
export default function CropCalendar({ C }) {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'detail'

  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);

  // Check if a specific month is in a crop's season
  function isMonthInSeason(crop, monthIdx) {
    const m = monthIdx + 1; // convert to 1-indexed
    for (const season of crop.seasons) {
      if (season.months.includes(m)) return season;
    }
    return null;
  }

  // When a crop is selected, show its detail view
  function handleCropClick(crop) {
    setSelectedCrop(crop);
    setSelectedSeason(crop.seasons[0] || null);
    setViewMode("detail");
  }

  function handleBack() {
    setSelectedCrop(null);
    setSelectedSeason(null);
    setViewMode("grid");
  }

  // ─── Detail View ──────────────────────────────────────────────────────────
  if (viewMode === "detail" && selectedCrop) {
    const seasonColors = selectedSeason ? SEASON_COLORS[selectedSeason.name] : null;
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: C.primary,
              fontWeight: 600,
              padding: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← ফিরুন
          </button>
        </div>

        {/* Crop title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            padding: "14px 16px",
            background: C.bgCard,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            boxShadow: C.shadow,
          }}
        >
          <span style={{ fontSize: 36 }}>{selectedCrop.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{selectedCrop.crop}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{selectedCrop.cropEn}</div>
          </div>
        </div>

        {/* Season tabs */}
        {selectedCrop.seasons.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {selectedCrop.seasons.map((season) => {
              const sc = SEASON_COLORS[season.name] || { bg: C.bgMuted, text: C.textMuted, border: C.border };
              const isActive = selectedSeason?.name === season.name;
              return (
                <button
                  key={season.name}
                  onClick={() => setSelectedSeason(season)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${isActive ? sc.text : C.border}`,
                    background: isActive ? sc.bg : C.bgCard,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? sc.text : C.textMuted,
                    whiteSpace: "nowrap",
                    transition: "all .2s",
                  }}
                >
                  {season.icon || ""} {season.name} ({season.nameEn})
                </button>
              );
            })}
          </div>
        )}

        {/* Season detail card */}
        {selectedSeason && (
          <div
            style={{
              background: C.bgCard,
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
              marginBottom: 12,
            }}
          >
            {/* Season color banner */}
            {seasonColors && (
              <div
                style={{
                  padding: "10px 16px",
                  background: seasonColors.bg,
                  borderBottom: `1px solid ${seasonColors.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: seasonColors.text }}>
                  {selectedSeason.name} / {selectedSeason.nameEn}
                </span>
                <span style={{ fontSize: 12, color: seasonColors.text, opacity: 0.7 }}>
                  — {GREGORIAN_MONTHS.find((_, i) => selectedSeason.months.includes(i + 1))?.short} থেকে{" "}
                  {
                    GREGORIAN_MONTHS.find(
                      (_, i) =>
                        selectedSeason.months.includes(i + 1) &&
                        i === Math.max(...selectedSeason.months.map((m) => m - 1)),
                    )?.short
                  }
                </span>
              </div>
            )}

            <div style={{ padding: 16 }}>
              {/* Timeline info */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[
                  { icon: "🌱", label: "বপন", val: selectedSeason.plantMonth, color: C.success },
                  { icon: "⚠️", label: "ঝুঁকি", val: selectedSeason.riskPeriod, color: C.warning },
                  { icon: "🌾", label: "ফসল তোলা", val: selectedSeason.harvestMonth, color: C.primary },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: item.color + "0a",
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{item.icon}</div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textMuted,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: item.color, fontWeight: 700, marginTop: 2 }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Key diseases */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMuted,
                    fontWeight: 700,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  🦠 প্রধান রোগ
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(Array.isArray(selectedSeason.keyDiseases)
                    ? selectedSeason.keyDiseases
                    : [selectedSeason.keyDiseases]
                  )
                    .filter(Boolean)
                    .map((d) => (
                      <span
                        key={d}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "#fef2f2",
                          color: C.danger,
                          border: "1px solid #fecaca",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                </div>
              </div>

              {/* Key pests */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMuted,
                    fontWeight: 700,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  🪲 প্রধান পোকামাকড়
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(Array.isArray(selectedSeason.keyPests) ? selectedSeason.keyPests : [selectedSeason.keyPests])
                    .filter(Boolean)
                    .map((p) => (
                      <span
                        key={p}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "#fff7ed",
                          color: "#9a3412",
                          border: "1px solid #fed7aa",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                </div>
              </div>

              {/* Tips */}
              {selectedSeason.tips && selectedSeason.tips.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontWeight: 700,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    💡 কৃষি পরামর্শ
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedSeason.tips.map((tip, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <span style={{ color: C.success, fontSize: 13, flexShrink: 0 }}>▸</span>
                        <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mini month bar for this season */}
            <div style={{ padding: "0 16px 14px" }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>
                মাসভিত্তিক ক্যালেন্ডার
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1;
                  const isActive = selectedSeason.months.includes(m);
                  const isCurrent = m === currentMonth;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        padding: "6px 2px",
                        borderRadius: 6,
                        background: isActive ? seasonColors?.bg || C.primaryLight + "33" : C.bgMuted,
                        border: isCurrent ? `2px solid ${C.primary}` : "1px solid transparent",
                        textAlign: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: isActive ? seasonColors?.text || C.primary : C.textLight,
                          fontWeight: isCurrent ? 800 : 500,
                        }}
                      >
                        {GREGORIAN_MONTHS[i].short}
                      </div>
                      {isCurrent && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -2,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: C.primary,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Grid View ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>📅</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>ফসল ক্যালেন্ডার</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Crop Calendar — মৌসুম অনুযায়ী ফসলের তথ্য</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries(SEASON_COLORS).map(([name, colors]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            />
            <span style={{ fontSize: 10, color: colors.text, fontWeight: 600 }}>{name}</span>
          </div>
        ))}
      </div>

      {/* Month header row */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 2,
          paddingLeft: 80,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 6,
        }}
      >
        {GREGORIAN_MONTHS.map((m, i) => {
          const isCurrent = i + 1 === currentMonth;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? C.primary : C.textMuted,
                  background: isCurrent ? C.primary + "15" : "transparent",
                  borderRadius: 4,
                  padding: "2px 0",
                }}
              >
                {m.short}
              </div>
              <div style={{ fontSize: 7, color: C.textLight, marginTop: 1 }}>{BENGALI_MONTHS[i]}</div>
            </div>
          );
        })}
      </div>

      {/* Crop rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CROP_CALENDAR.map((crop) => (
          <button
            key={crop.cropEn}
            onClick={() => handleCropClick(crop)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              background: C.bgCard,
              border: "none",
              borderRadius: 10,
              padding: "6px 8px",
              cursor: "pointer",
              transition: "all .15s",
              width: "100%",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.bgCard)}
          >
            {/* Crop label */}
            <div
              style={{
                width: 72,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
                paddingRight: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{crop.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{crop.crop}</div>
                <div style={{ fontSize: 8, color: C.textLight }}>{crop.cropEn}</div>
              </div>
            </div>

            {/* Month cells */}
            <div style={{ display: "flex", flex: 1, gap: 1 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const season = isMonthInSeason(crop, i);
                const isCurrent = m === currentMonth;

                if (season) {
                  const sc = SEASON_COLORS[season.name] || { bg: C.bgMuted, text: C.primary, border: C.border };
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 24,
                        borderRadius: 4,
                        background: sc.bg,
                        border: `1px solid ${isCurrent ? C.primary : sc.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {isCurrent && (
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: C.primary,
                            position: "absolute",
                            bottom: 2,
                          }}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 24,
                      borderRadius: 4,
                      background: C.bgMuted,
                      opacity: 0.5,
                      border: isCurrent ? `1px solid ${C.primary}44` : "1px solid transparent",
                    }}
                  />
                );
              })}
            </div>

            {/* Arrow */}
            <span style={{ fontSize: 12, color: C.textLight, marginLeft: 4, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>

      {/* Current month indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          padding: "8px 12px",
          borderRadius: 10,
          background: C.primary + "0a",
          border: `1px solid ${C.primary}22`,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />
        <span style={{ fontSize: 12, color: C.primary, fontWeight: 600 }}>
          বর্তমান মাস: {GREGORIAN_MONTHS[currentMonth - 1]?.bn} ({GREGORIAN_MONTHS[currentMonth - 1]?.en})
        </span>
      </div>
    </div>
  );
}
