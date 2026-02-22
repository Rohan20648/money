"use client";
import { useState, useEffect } from "react";

type MonthPlan = { month: number; targetSavings: number; leisureBudget: number; adjustments: string; };
type Plan = {
  goalSummary: string;
  feasibility: "Achievable" | "Challenging" | "Very Ambitious";
  feasibilityReason: string;
  monthlyPlan: MonthPlan[];
  totalProjected: number;
  keyChanges: string[];
  warning: string | null;
};

export default function GoalPlannerClient() {
  const [goal, setGoal] = useState("");
  const [months, setMonths] = useState("3");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    if (!user.uid) { window.location.href = "/login"; return; }
    setCurrencySymbol(user.currencySymbol || "₹");
    const saved = localStorage.getItem("moneyguruPortfolio");
    if (saved) setPortfolio(JSON.parse(saved));
  }, []);

  async function generatePlan() {
    if (!goal.trim()) { setError("Please describe your goal."); return; }
    if (!portfolio) { setError("No portfolio data found. Add a month first."); return; }
    setError(""); setLoading(true); setPlan(null);
    try {
      const res = await fetch("/api/goal-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, months: parseInt(months), portfolio }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate plan. Try again.");
    } finally { setLoading(false); }
  }

  function feasibilityColor(f: string) {
    if (f === "Achievable") return "#22C55E";
    if (f === "Challenging") return "var(--gold)";
    return "#EF4444";
  }

  const suggestions = [
    "Save ₹50,000 for an emergency fund",
    "Buy a new laptop worth ₹80,000",
    "Go on a vacation costing ₹30,000",
    "Build a 6-month expense buffer",
    "Invest ₹1,00,000 in mutual funds",
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 32px" }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>AI Feature</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "12px" }}>Goal Planner</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300, maxWidth: "500px" }}>
            Tell the AI what you want to achieve and it will build a personalised month-by-month savings plan based on your actual income and spending.
          </p>
        </div>

        {/* Input card */}
        <div className="card animate-fadeUp delay-1" style={{ padding: "36px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 500 }}>
              What's your goal?
            </label>
            <input
              className="mg-input"
              placeholder={`e.g. Save ${currencySymbol}50,000 for an emergency fund`}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generatePlan()}
            />
          </div>

          {/* Suggestion chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setGoal(s)} style={{
                padding: "6px 14px", borderRadius: "100px", border: "1px solid var(--border-subtle)",
                background: "var(--surface-2)", color: "var(--text-muted)", fontSize: "12px",
                cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--text)"; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border-subtle)"; (e.currentTarget).style.color = "var(--text-muted)"; }}
              >{s}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 500 }}>
                Timeframe
              </label>
              <select value={months} onChange={e => setMonths(e.target.value)} style={{
                width: "100%", background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "12px", padding: "14px 18px", color: "var(--text)",
                fontFamily: "'DM Sans', sans-serif", fontSize: "15px", outline: "none", cursor: "pointer",
              }}>
                {[1,2,3,4,5,6,9,12].map(m => (
                  <option key={m} value={m} style={{ background: "#0E1219" }}>{m} {m === 1 ? "month" : "months"}</option>
                ))}
              </select>
            </div>
            <button className="mg-btn mg-btn-gold" onClick={generatePlan} disabled={loading || !goal.trim()} style={{ padding: "14px 32px", whiteSpace: "nowrap" }}>
              {loading ? "Planning..." : "Generate Plan →"}
            </button>
          </div>

          {error && <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "16px" }}>{error}</p>}

          {!portfolio && (
            <p style={{ color: "var(--gold)", fontSize: "13px", marginTop: "16px" }}>
              No portfolio data found — <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => window.location.href = "/new-month"}>add a month first</span> so the AI can personalise your plan.
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="card animate-fadeIn" style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", margin: "0 auto 16px" }} className="animate-spin" />
            <p className="font-serif" style={{ fontSize: "20px", marginBottom: "8px" }}>Analysing your finances...</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 300 }}>The AI is building your personalised plan</p>
          </div>
        )}

        {/* Result */}
        {plan && !loading && (
          <div className="animate-fadeUp">

            {/* Goal summary + feasibility */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px 36px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: "8px" }}>Your Goal</p>
                  <p style={{ fontSize: "18px", fontWeight: 400, lineHeight: 1.4 }}>{plan.goalSummary}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>Feasibility</p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: feasibilityColor(plan.feasibility) }}>{plan.feasibility}</p>
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: 300, borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>{plan.feasibilityReason}</p>

              {plan.warning && (
                <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#EF4444", fontSize: "13px" }}>
                  {plan.warning}
                </div>
              )}
            </div>

            {/* Key changes */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "28px 32px", marginBottom: "16px" }}>
              <h3 className="font-serif" style={{ fontSize: "20px", marginBottom: "16px" }}>Key Changes Required</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.keyChanges.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--gold)", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: 300 }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Month-by-month plan */}
            <h3 className="font-serif" style={{ fontSize: "22px", marginBottom: "16px" }}>Month-by-Month Plan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "24px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden" }}>
              {plan.monthlyPlan.map((m, i) => (
                <div key={i} style={{ background: "var(--surface)", padding: "24px 28px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="font-serif" style={{ fontSize: "20px", color: "var(--gold)" }}>{m.month}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", fontWeight: 300 }}>{m.adjustments}</p>
                  </div>
                  <div style={{ display: "flex", gap: "24px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "2px" }}>Save</p>
                      <p style={{ fontSize: "16px", fontWeight: 500, color: "#22C55E" }}>{currencySymbol}{m.targetSavings?.toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "2px" }}>Leisure</p>
                      <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--gold)" }}>{currencySymbol}{m.leisureBudget?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total projection */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>Total Projected Savings</p>
                <p className="font-serif" style={{ fontSize: "36px", color: "#22C55E" }}>{currencySymbol}{plan.totalProjected?.toLocaleString()}</p>
              </div>
              <button className="mg-btn mg-btn-outline" onClick={() => { setPlan(null); setGoal(""); }}>Plan Another Goal</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
