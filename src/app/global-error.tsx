"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BrandBridge] Root layout error:", error);
  }, [error]);

  // This boundary replaces the root layout, so it must render its own shell
  // and cannot rely on the app's theme provider or Tailwind-only styling.
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#0a0a12",
          color: "#f2f2f7",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 auto 18px",
              width: 52,
              height: 52,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239,68,68,0.15)",
              fontSize: 24,
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            The application failed to load
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(242,242,247,0.7)",
            }}
          >
            A critical error stopped BrandBridge AI from starting. Reloading
            usually resolves it.
          </p>

          {error.digest && (
            <p
              style={{
                marginTop: 16,
                padding: "8px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                fontSize: 11,
                wordBreak: "break-all",
                color: "rgba(242,242,247,0.5)",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "11px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              background: "linear-gradient(135deg,#8b5cf6,#4f8cff)",
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
