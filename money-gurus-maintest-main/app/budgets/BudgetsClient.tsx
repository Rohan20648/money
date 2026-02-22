"use client";
import { useState, useEffect } from "react";

const DEFAULT_CATEGORIES = [
  { id: "rent",          label: "Rent / Housing",    icon: "🏠" },
  { id: "food",          label: "Food & Groceries",  icon: "🛒" },
  { id: "transport",     label: "Transport",          icon: "🚗" },
  { id: "subscriptions", label: "Subscriptions",      icon: "📱" },
  { id: "utilities",     label: "Utilities",          icon: "💡" },
  { id: "health",        label: "Health & Medical",   icon: "🏥" },
  { id: "dining",        label: "Dining Out",         icon: "🍽️" },
  { id: "shopping",      label: "Shopping",           icon: "🛍️" },
  { id: "entertainment", label: "Entertainment",      icon: "🎬" },
  { id: "other",         label: "Other",              icon: "📦" },
];

type Budget   = { id: string; label: string; icon: string; limit: number; };
type Actuals  = Record<string, number>;

export default function BudgetsClient() {
  const [tab, setTab]           = useState<"overview" | "setup" | "track">("overview");
  const [budgets, setBudgets]   = useState<Budget[]>([]);
  const [actuals, setActuals]   = useState<Actuals>({});
  const [limits, setLimits]     = useState<Record<string, string>>({});
  const [spent, setSpent]       = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [currency, setCurrency] = useState("₹");
  const [uid, setUid]           = useState("");

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    if (!user.uid) { window.location.href = "/login"; return; }
    setUid(user.uid);
    setCurrency(user.currencySymbol || "₹");
    loadData(user.uid);
  }, []);

  async function loadData(id: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: id, action: "get", month: currentMonth }),
      });
      const data = await res.json();
      const loaded: Budget[] = data.budgets || [];
      setBudgets(loaded);
      // Pre-fill limit inputs
      const lims: Record<string, string> = {};
      loaded.forEach((b: Budget) => { lims[b.id] = String(b.limit); });
      setLimits(lims);
      // Pre-fill actuals
      if (data.actuals) {
        setActuals(data.actuals);
        const sp: Record<string, string> = {};
        Object.entries(data.actuals).forEach(([k, v]) => { sp[k] = String(v); });
        setSpent(sp);
      }
    } finally { setLoading(false); }
  }

  async function saveBudgets() {
    setSaving(true);
    const newBudgets: Budget[] = DEFAULT_CATEGORIES
      .filter(c => limits[c.id] && Number(limits[c.id]) > 0)
      .map(c => ({ ...c, limit: Number(limits[c.id]) }));
    await fetch("/api/budgets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, action: "save-budgets", budgets: newBudgets }),
    });
    setBudgets(newBudgets);
    setSaving(false);
    setTab("overview");
  }

  async function saveActuals() {
    setSaving(true);
    const newActuals: Actuals = {};
    Object.entries(spent).forEach(([k, v]) => { if (v) newActuals[k] = Number(v); });
    await fetch("/api/budgets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, action: "save-actuals", month: currentMonth, actuals: newActuals }),
    });
    setActuals(newActuals);
    setSaving(false);
    setTab("overview");
  }

  function pct(spent: number, limit: number) {
    return Math.min(Math.round((spent / limit) * 100), 100);
  }
  function barColor(p: number) {
    if (p >= 100) return "#EF4444";
    if (p >= 80)  return "var(--gold)";
    return "#22C55E";
  }
  function statusLabel(p: number) {
    if (p >= 100) return "Over budget";
    if (p >= 80)  return "Near limit";
    return "On track";
  }

  const totalBudget  = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent   = budgets.reduce((s, b) => s + (actuals[b.id] || 0), 0);
  const overCount    = budgets.filter(b => (actuals[b.id] || 0) >= b.limit).length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", margin: "0 auto" }} className="animate-spin" />
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "56px 32px" }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>Finance</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "10px" }}>Category Budgets</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Set spending limits per category and track actuals each month</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "2px", background: "var(--surface)", borderRadius: "12px", padding: "4px", marginBottom: "32px", width: "fit-content" }}>
          {(["overview", "setup", "track"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: "9px", border: "none", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", fontWeight: 500, transition: "all 0.2s",
              background: tab === t ? "var(--gold)" : "none",
              color: tab === t ? "#080B0F" : "var(--text-muted)",
            }}>
              {t === "overview" ? "Overview" : t === "setup" ? "Set Budgets" : "Log Spending"}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="animate-fadeUp">
            {budgets.length === 0 ? (
              <div className="card" style={{ padding: "64px 32px", textAlign: "center" }}>
                <p className="font-serif" style={{ fontSize: "22px", marginBottom: "8px" }}>No budgets set yet</p>
                <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontWeight: 300 }}>Set your monthly spending limits per category to start tracking</p>
                <button className="mg-btn mg-btn-gold" onClick={() => setTab("setup")}>Set Up Budgets →</button>
              </div>
            ) : (
              <>
                {/* Summary row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", background: "var(--border-subtle)", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
                  {[
                    { label: "Total Budget",  value: `${currency}${totalBudget.toLocaleString()}`,  color: "var(--text)" },
                    { label: "Total Spent",   value: `${currency}${totalSpent.toLocaleString()}`,   color: totalSpent > totalBudget ? "#EF4444" : "#22C55E" },
                    { label: "Over Budget",   value: `${overCount} categor${overCount === 1 ? "y" : "ies"}`, color: overCount > 0 ? "#EF4444" : "#22C55E" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "var(--surface)", padding: "22px 24px" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</p>
                      <p style={{ fontSize: "20px", fontWeight: 500, color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Category rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden" }}>
                  {budgets.map((b, i) => {
                    const spentAmt = actuals[b.id] || 0;
                    const p        = pct(spentAmt, b.limit);
                    const color    = barColor(p);
                    const isFirst  = i === 0;
                    const isLast   = i === budgets.length - 1;
                    return (
                      <div key={b.id} style={{
                        background: "var(--surface)", padding: "20px 24px",
                        borderRadius: isFirst ? "18px 18px 0 0" : isLast ? "0 0 18px 18px" : "0",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "20px" }}>{b.icon}</span>
                            <div>
                              <p style={{ fontWeight: 500, fontSize: "15px" }}>{b.label}</p>
                              <p style={{ fontSize: "12px", color: color, fontWeight: 500 }}>{statusLabel(p)}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "15px", fontWeight: 500 }}>{currency}{spentAmt.toLocaleString()}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>of {currency}{b.limit.toLocaleString()}</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: "4px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: "2px", transition: "width 0.6s ease" }} />
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px", textAlign: "right" }}>{p}% used</p>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="nav-btn" onClick={() => setTab("track")}>Log This Month's Spending</button>
                  <button className="nav-btn" onClick={() => setTab("setup")}>Edit Budgets</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SETUP TAB ── */}
        {tab === "setup" && (
          <div className="animate-fadeUp">
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px", fontWeight: 300 }}>
              Enter your monthly budget limit for each category. Leave blank to skip a category.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden", marginBottom: "24px" }}>
              {DEFAULT_CATEGORIES.map((c, i) => (
                <div key={c.id} style={{
                  background: "var(--surface)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px",
                  borderRadius: i === 0 ? "18px 18px 0 0" : i === DEFAULT_CATEGORIES.length - 1 ? "0 0 18px 18px" : "0",
                }}>
                  <span style={{ fontSize: "20px", width: "28px", textAlign: "center", flexShrink: 0 }}>{c.icon}</span>
                  <p style={{ flex: 1, fontSize: "15px", fontWeight: 400 }}>{c.label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--gold)", fontSize: "15px", fontWeight: 500 }}>{currency}</span>
                    <input
                      type="number" min="0" placeholder="0"
                      value={limits[c.id] || ""}
                      onChange={e => setLimits(l => ({ ...l, [c.id]: e.target.value }))}
                      style={{ width: "120px", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "10px 14px", color: "var(--text)", fontFamily: "inherit", fontSize: "15px", outline: "none", textAlign: "right" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mg-btn mg-btn-gold" onClick={saveBudgets} disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving..." : "Save Budgets →"}
            </button>
          </div>
        )}

        {/* ── TRACK TAB ── */}
        {tab === "track" && (
          <div className="animate-fadeUp">
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px", fontWeight: 300 }}>
              Enter what you actually spent in each category this month ({currentMonth}).
            </p>
            {budgets.length === 0 ? (
              <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Set up your budgets first before logging spending.</p>
                <button className="mg-btn mg-btn-gold" onClick={() => setTab("setup")}>Set Up Budgets →</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden", marginBottom: "24px" }}>
                  {budgets.map((b, i) => (
                    <div key={b.id} style={{
                      background: "var(--surface)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px",
                      borderRadius: i === 0 ? "18px 18px 0 0" : i === budgets.length - 1 ? "0 0 18px 18px" : "0",
                    }}>
                      <span style={{ fontSize: "20px", width: "28px", textAlign: "center", flexShrink: 0 }}>{b.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "15px", fontWeight: 400 }}>{b.label}</p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Budget: {currency}{b.limit.toLocaleString()}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--gold)", fontSize: "15px", fontWeight: 500 }}>{currency}</span>
                        <input
                          type="number" min="0" placeholder="0"
                          value={spent[b.id] || ""}
                          onChange={e => setSpent(s => ({ ...s, [b.id]: e.target.value }))}
                          style={{ width: "120px", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "10px 14px", color: "var(--text)", fontFamily: "inherit", fontSize: "15px", outline: "none", textAlign: "right" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mg-btn mg-btn-gold" onClick={saveActuals} disabled={saving} style={{ width: "100%" }}>
                  {saving ? "Saving..." : "Save Spending →"}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
