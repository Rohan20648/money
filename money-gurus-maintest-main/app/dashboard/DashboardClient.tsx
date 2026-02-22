"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DashboardClient() {
  const [fields, setFields] = useState({
    income: "", recurring: "", leisure: "",
    savings: "", emergency: "", investment: ""
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const inputs = [
    { key: "income",     label: "Monthly Income",    icon: "💰", hint: "Your total take-home pay" },
    { key: "recurring",  label: "Recurring Costs",   icon: "🔄", hint: "Rent, bills, subscriptions" },
    { key: "leisure",    label: "Leisure Spending",  icon: "☕", hint: "Dining, entertainment, hobbies" },
    { key: "savings",    label: "Savings",           icon: "🏦", hint: "Amount moved to savings" },
    { key: "emergency",  label: "Emergency Fund",    icon: "🛡️", hint: "Contribution this month" },
    { key: "investment", label: "Investments",       icon: "📈", hint: "Stocks, mutual funds, SIP" },
  ];

  async function handleSubmit() {
    const vals = Object.values(fields);
    if (vals.some(v => v === "")) {
      alert("Please fill all fields before generating your report.");
      return;
    }

    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, Number(v)])
      );

      // Step 1 — Get AI score
      const aiRes = await fetch("/api/ai-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ai = await aiRes.json();

      // Step 2 — Get user session
      const userRaw = localStorage.getItem("moneyguruUser") || sessionStorage.getItem("moneyguruUser");
      if (!userRaw) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }
      const user = JSON.parse(userRaw);

      // Step 3 — Save via API (Admin SDK, not client Firestore)
      const now = new Date();
      const monthLabel = now.toISOString().slice(0, 7);
      const monthId = `${monthLabel}-${now.getTime()}`;

      const saveRes = await fetch("/api/new-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          ...payload,
          score: ai.score || 0,
          advice: ai.advice || [],
          monthId,
        }),
      });
      const save = await saveRes.json();
      if (!save.success) throw new Error("Save failed");

      localStorage.setItem("moneyguruPortfolio", JSON.stringify({
        ...payload, score: ai.score, advice: ai.advice, month: monthLabel
      }));

      window.location.href = "/profile";
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const allFilled = Object.values(fields).every(v => v !== "");

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{
        padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, background: "rgba(8,11,15,0.92)",
        backdropFilter: "blur(12px)", zIndex: 100
      }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <Link href="/profile"><button className="nav-btn">← Back</button></Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 32px" }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: "56px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>
            First-time Setup
          </p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "12px" }}>
            Your Financial Snapshot
          </h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300, maxWidth: "400px", margin: "0 auto" }}>
            Enter this month's numbers to generate your first Guru Score and unlock AI insights.
          </p>
        </div>

        {/* Input grid */}
        <div className="animate-fadeUp delay-1" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "2px", background: "var(--border-subtle)",
          borderRadius: "20px", overflow: "hidden", marginBottom: "32px"
        }}>
          {inputs.map(({ key, label, icon, hint }, i) => (
            <div key={key} style={{
              background: "var(--surface)", padding: "24px 24px",
              borderRadius:
                i === 0 ? "18px 0 0 0" :
                i === 1 ? "0 18px 0 0" :
                i === inputs.length - 2 ? "0 0 0 18px" :
                i === inputs.length - 1 ? "0 0 18px 0" : "0"
            }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontSize: "12px", color: "var(--text-muted)",
                letterSpacing: "0.05em", textTransform: "uppercase",
                marginBottom: "10px", fontWeight: 500
              }}>
                <span>{icon}</span> {label}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)", color: "var(--text-muted)",
                  fontSize: "15px", fontWeight: 500, pointerEvents: "none"
                }}>₹</span>
                <input
                  type="number"
                  value={fields[key as keyof typeof fields]}
                  onChange={set(key)}
                  placeholder="0"
                  className="mg-input"
                  style={{ paddingLeft: "30px" }}
                />
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>{hint}</p>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="animate-fadeUp delay-2" style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fields completed</span>
            <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 500 }}>
              {Object.values(fields).filter(v => v !== "").length} / 6
            </span>
          </div>
          <div style={{ height: "3px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(Object.values(fields).filter(v => v !== "").length / 6) * 100}%`,
              background: "linear-gradient(90deg, var(--gold-light), var(--gold))",
              borderRadius: "2px", transition: "width 0.3s ease"
            }} />
          </div>
        </div>

        {/* Submit */}
        <div className="animate-fadeUp delay-3" style={{ textAlign: "center" }}>
          <button
            className="mg-btn mg-btn-gold"
            onClick={handleSubmit}
            disabled={loading || !allFilled}
            style={{ minWidth: "280px", fontSize: "16px", opacity: (!allFilled && !loading) ? 0.5 : 1 }}
          >
            {loading ? "Generating Report..." : "Generate Guru Score →"}
          </button>
          {loading && (
            <p style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
              Analysing your data with AI — this may take a moment...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
