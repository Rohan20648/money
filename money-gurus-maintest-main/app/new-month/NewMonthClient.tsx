"use client";
import { useState } from "react";
import Link from "next/link";

export default function NewMonthClient() {
  const [fields, setFields] = useState({ income: "", recurring: "", leisure: "", savings: "", emergency: "", investment: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setFields(f => ({ ...f, [k]: e.target.value }));

  const inputs = [
    { key: "income", label: "Monthly Income", icon: "💰", hint: "Your total take-home pay" },
    { key: "recurring", label: "Recurring Costs", icon: "🔄", hint: "Rent, bills, subscriptions" },
    { key: "leisure", label: "Leisure Spending", icon: "☕", hint: "Dining, entertainment, hobbies" },
    { key: "savings", label: "Savings", icon: "🏦", hint: "Amount moved to savings" },
    { key: "emergency", label: "Emergency Fund", icon: "🛡️", hint: "Contribution this month" },
    { key: "investment", label: "Investments", icon: "📈", hint: "Stocks, mutual funds, SIP" },
  ];

  async function handleSubmit() {
    const vals = Object.values(fields);
    if (vals.some(v => v === "")) { alert("Please fill all fields."); return; }
    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Number(v)]));
      const aiRes = await fetch("/api/ai-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const ai = await aiRes.json();
      const user = JSON.parse(localStorage.getItem("moneyguruUser") || sessionStorage.getItem("moneyguruUser") || "{}");
      if (!user.uid) throw new Error("Not logged in");
      const saveRes = await fetch("/api/new-month", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: user.uid, ...payload, score: ai.score || 0, advice: ai.advice || [] }) });
      const save = await saveRes.json();
      if (!save.success) throw new Error("Save failed");
      window.location.href = "/profile";
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 32px" }}>
        <div className="animate-fadeUp" style={{ marginBottom: "56px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>Monthly Snapshot</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "12px" }}>Add New Month</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Enter your financial details to generate your Guru Score</p>
        </div>

        <div className="animate-fadeUp delay-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden", marginBottom: "32px" }}>
          {inputs.map(({ key, label, icon, hint }, i) => (
            <div key={key} style={{ background: "var(--surface)", padding: "24px 24px", borderRadius: i === 0 ? "18px 0 0 0" : i === 1 ? "0 18px 0 0" : i === inputs.length - 2 ? "0 0 0 18px" : i === inputs.length - 1 ? "0 0 18px 0" : "0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 500 }}>
                <span>{icon}</span> {label}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "15px", fontWeight: 500 }}>₹</span>
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

        <div className="animate-fadeUp delay-2" style={{ textAlign: "center" }}>
          <button className="mg-btn mg-btn-gold" onClick={handleSubmit} disabled={loading} style={{ minWidth: "280px", fontSize: "16px" }}>
            {loading ? "Generating Report..." : "Generate Guru Score →"}
          </button>
          {loading && <p style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "13px" }}>Analysing your data with AI...</p>}
        </div>
      </div>
    </main>
  );
}
