"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useSearchParams } from "next/navigation";

type PortfolioData = {
  income: number; recurring: number; leisure: number;
  savings: number; emergency: number; investment: number;
  score: number; advice: string[]; month: string;
};

const INSIGHT_LABELS: Record<string, string> = {
  "Strength": "Strength", "Risk": "Risk", "Action": "Action",
  "Investment Strategy": "Investment Strategy",
  "Emergency Planning": "Emergency Planning", "Lifestyle Tip": "Lifestyle Tip",
};

export default function PortfolioClient() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const params = useSearchParams();
  const id = params.get("id");

  async function handleLogout() {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "/";
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    setCurrencySymbol(user.currencySymbol || "₹");

    async function loadPortfolio() {
      try {
        if (!user.uid) { window.location.href = "/login"; return; }
        const res = await fetch("/api/portfolio/fetch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, monthId: id || null }),
        });
        const json = await res.json();
        if (!res.ok || json.error) { setLoadError(json.error || "Could not load portfolio."); setLoading(false); return; }
        setData({ ...json.portfolio });
        setLoading(false);

        setAiLoading(true);
        try {
          const aiRes = await fetch("/api/ai-score", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ income: json.portfolio.income, recurring: json.portfolio.recurring, leisure: json.portfolio.leisure, savings: json.portfolio.savings, emergency: json.portfolio.emergency, investment: json.portfolio.investment }),
          });
          const aiData = await aiRes.json();
          if (aiData.advice?.length > 0) {
            const updated = { ...json.portfolio, score: aiData.score, advice: aiData.advice };
            setData(updated);
            setAiError(null);
            localStorage.setItem("moneyguruPortfolio", JSON.stringify(updated));
          } else {
            setAiError(aiData.error || "AI returned no insights.");
          }
        } catch { setAiError("Could not reach AI service."); }
        finally { setAiLoading(false); }
      } catch (err) {
        setLoadError("Unexpected error: " + String(err));
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [id]);

  const fmt = (n: number) => `${currencySymbol}${n?.toLocaleString()}`;
  function scoreColor(s: number) { return s >= 8 ? "#22C55E" : s >= 5 ? "var(--gold)" : "#EF4444"; }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", margin: "0 auto 16px" }} className="animate-spin" />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading portfolio...</p>
      </div>
    </div>
  );

  if (loadError) return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px" }}>
        <h2 className="font-serif" style={{ fontSize: "28px", marginBottom: "12px" }}>Could not load</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "14px" }}>{loadError}</p>
        <button className="mg-btn mg-btn-outline" onClick={() => window.location.href = "/profile"}>Back to Profile</button>
      </div>
    </main>
  );

  if (!data) return null;

  const metrics = [
    { label: "Income", value: data.income },
    { label: "Recurring Costs", value: data.recurring },
    { label: "Leisure", value: data.leisure },
    { label: "Savings", value: data.savings },
    { label: "Emergency Fund", value: data.emergency },
    { label: "Investments", value: data.investment },
  ];

  const savingsRate = data.income > 0 ? Math.round((data.savings / data.income) * 100) : 0;
  const expenseRate = data.income > 0 ? Math.round(((data.recurring + data.leisure) / data.income) * 100) : 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
          <button className="nav-btn" onClick={() => window.location.href = "/chat"}>AI Advisor</button>
          <button className="nav-btn" onClick={() => window.location.href = "/leaderboard"}>Leaderboard</button>
          <button className="nav-btn primary" onClick={() => window.location.href = "/new-month"}>+ New Month</button>
          <button className="nav-btn danger" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 32px" }}>
        <div className="animate-fadeUp" style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "10px" }}>{data.month} Report</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Financial Portfolio</h1>
        </div>

        {/* Score hero */}
        <div className="animate-fadeUp delay-1" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "40px 48px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-60px", top: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${scoreColor(aiLoading ? 5 : data.score)}15 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div>
            <div className="score-display" style={{ color: aiLoading ? "var(--text-dim)" : undefined, background: aiLoading ? "none" : undefined, WebkitTextFillColor: aiLoading ? "var(--text-dim)" : undefined }}>
              {aiLoading ? "—" : data.score}
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>Guru Score</p>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>Overall Financial Health</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: 300 }}>
              {aiLoading ? "AI is evaluating your financial data..." : "AI evaluated based on your income, spending & savings patterns"}
            </p>
            {!aiLoading && (
              <div style={{ display: "flex", gap: "32px", marginTop: "20px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>Savings Rate</p>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: savingsRate >= 20 ? "#22C55E" : "var(--gold)" }}>{savingsRate}%</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>Expense Rate</p>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: expenseRate <= 50 ? "#22C55E" : "#EF4444" }}>{expenseRate}%</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="animate-fadeUp delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginBottom: "40px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden" }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: "var(--surface)", padding: "24px 24px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "10px" }}>{m.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.01em" }}>{fmt(m.value)}</p>
            </div>
          ))}
        </div>

        {/* Export buttons */}
        <div className="animate-fadeUp delay-2" style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
          <button className="nav-btn" onClick={() => window.location.href = `/api/export?uid=${JSON.parse(localStorage.getItem("moneyguruUser")||"{}").uid}&format=csv`}>
            Download CSV
          </button>
          <button className="nav-btn" onClick={() => window.location.href = `/api/export?uid=${JSON.parse(localStorage.getItem("moneyguruUser")||"{}").uid}&format=pdf`}>
            Download PDF Report
          </button>
        </div>

        {/* AI Insights */}
        <div className="animate-fadeUp delay-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="font-serif" style={{ fontSize: "28px", letterSpacing: "-0.01em" }}>AI Smart Insights</h2>
            {aiLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13px" }}>
                <div style={{ width: "14px", height: "14px", border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%" }} className="animate-spin" />
                Generating...
              </div>
            )}
          </div>

          {aiError && !aiLoading && (
            <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#EF4444", fontSize: "13px", marginBottom: "20px" }}>
              {aiError}
            </div>
          )}

          {!aiLoading && data.advice?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden" }}>
              {data.advice.map((a, i) => {
                const parts = a.includes(":") ? [a.split(":")[0].trim(), a.split(":").slice(1).join(":").trim()] : ["Insight", a];
                const title = INSIGHT_LABELS[parts[0]] || parts[0];
                return (
                  <div key={i} style={{ background: "var(--surface)", padding: "28px 28px", borderRadius: i === 0 ? "18px 0 0 0" : i === 1 ? "0 18px 0 0" : i === data.advice.length - 2 ? "0 0 0 18px" : i === data.advice.length - 1 ? "0 0 18px 0" : "0" }}>
                    <h3 style={{ fontSize: "11px", fontWeight: 600, color: "var(--gold-light)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>{title}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", fontWeight: 300 }}>{parts[1]}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
