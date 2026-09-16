import { useState } from "react";

/**
 * SymptomImageGallery – Reusable thumbnail-strip + lightbox viewer
 * for CABI diagnostic reference images.
 *
 * Props:
 *   images   – string[]  – array of image filenames (e.g. ["img_page99_0.jpeg"])
 *   label    – string    – accessible label prefix (default "লক্ষণের ছবি")
 */
export default function SymptomImageGallery({ images, label = "লক্ষণের ছবি" }) {
  const [viewIdx, setViewIdx] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* ── Thumbnail strip ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {images.slice(0, 4).map((img, i) => (
          <div
            key={i}
            onClick={() => setViewIdx(i)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              overflow: "hidden",
              border: "2px solid #becabc",
              cursor: "pointer",
              flexShrink: 0,
              transition: "transform 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.borderColor = "#006a4e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "#becabc";
            }}
          >
            <img
              src={`/images/${img}`}
              alt={`${label} ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
        ))}

        {images.length > 4 && (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: "#eff5f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#3f493f",
              flexShrink: 0,
              cursor: "pointer",
              border: "2px solid #becabc",
            }}
            onClick={() => setViewIdx(0)}
          >
            +{images.length - 4} আরও
          </div>
        )}
      </div>

      {/* ── Fullscreen lightbox overlay ── */}
      {viewIdx !== null && (
        <div
          onClick={() => setViewIdx(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "85vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/images/${images[viewIdx]}`}
              alt={`${label} ${viewIdx + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 16,
                objectFit: "contain",
              }}
            />

            {/* Previous button */}
            {viewIdx > 0 && (
              <button
                onClick={() => setViewIdx(viewIdx - 1)}
                style={{
                  position: "absolute",
                  left: -16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ◀
              </button>
            )}

            {/* Next button */}
            {viewIdx < images.length - 1 && (
              <button
                onClick={() => setViewIdx(viewIdx + 1)}
                style={{
                  position: "absolute",
                  right: -16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ▶
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => setViewIdx(null)}
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#dc2626",
                border: "none",
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            {/* Image counter */}
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: "50%",
                transform: "translateX(-50%)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {viewIdx + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
