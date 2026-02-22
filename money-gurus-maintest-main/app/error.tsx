"use client";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
      <div className="animate-fadeUp" style={{ textAlign: "center", maxWidth: "440px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: "24px" }}>
          ✕
        </div>
        <h1 className="font-serif" style={{ fontSize: "36px", letterSpacing: "-0.02em", marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.7", fontWeight: 300, marginBottom: "36px" }}>
          An unexpected error occurred. Don't worry — your data is safe. You can try again or go back home.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="mg-btn mg-btn-gold" onClick={reset}>Try Again</button>
          <button className="mg-btn mg-btn-outline" onClick={() => window.location.href = "/"}>Go Home</button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p style={{ marginTop: "24px", fontSize: "12px", color: "var(--text-dim)", fontFamily: "monospace", background: "var(--surface)", padding: "12px", borderRadius: "8px", textAlign: "left" }}>
            {error.message}
          </p>
        )}
      </div>
    </main>
  );
}
