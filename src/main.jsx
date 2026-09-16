// Ensure window.fetch is writable and has both getter and setter
try {
  let currentFetch = window.fetch;
  const desc = Object.getOwnPropertyDescriptor(window, "fetch");
  if (!desc || !desc.set || !desc.writable) {
    Object.defineProperty(window, "fetch", {
      get() {
        return currentFetch;
      },
      set(v) {
        currentFetch = v;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignore environments where window.fetch cannot be redefined
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Component } from "react";
import App from "./App.jsx";

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("উদ্ভিদ গোয়েন্দা Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f6f8",
            padding: 24,
            textAlign: "center",
            fontFamily: "'Inter','Noto Sans Bengali',sans-serif",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
          <h1 style={{ fontSize: 22, color: "#006a4e", marginBottom: 8 }}>কিছু একটা সমস্যা হয়েছে</h1>
          <p style={{ fontSize: 14, color: "#5f6672", maxWidth: 360, lineHeight: 1.6, marginBottom: 20 }}>
            অ্যাপে একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। দয়া করে পাতাটি রিফ্রেশ করুন।
            <br />
            <span style={{ fontSize: 12, color: "#8e95a2" }}>
              An unexpected error occurred. Please refresh the page.
            </span>
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              background: "#006a4e",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 রিফ্রেশ করুন / Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
