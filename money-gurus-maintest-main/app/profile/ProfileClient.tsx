"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { showToast } from "../components/Toast";

type HistoryItem = { id: string; month: string; score: number; income: number; savings: number; };
type UserProfile = { username: string; email: string; phone: string; };

function formatMonth(m: string) {
  if (!m || !m.includes("-")) return m;
  const [year, month] = m.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const FEATURES = [
  { href: "/new-month",    icon: "✦", title: "New Month",        desc: "Log income, expenses and savings for this month",              accent: "var(--gold)" },
  { href: "/goal-planner", icon: "◎", title: "AI Goal Planner",  desc: "Get a personalised month-by-month savings plan from AI",       accent: "#818CF8" },
  { href: "/chat",         icon: "◈", title: "AI Advisor",       desc: "Chat with your financial AI — ask anything about your money",  accent: "#34D399" },
  { href: "/budgets",      icon: "▦", title: "Category Budgets", desc: "Set spending limits per category and track actuals",           accent: "#F472B6" },
  { href: "/leaderboard",  icon: "◑", title: "Leaderboard",      desc: "Compare Guru Scores with friends using a private group code",  accent: "#FB923C" },
  { href: "/settings",     icon: "⊙", title: "Settings",         desc: "Update your profile, currency preference and account",        accent: "#94A3B8" },
];

function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 32px" }}>
      <div style={{ marginBottom: "48px" }}>
        <div className="skeleton" style={{ width: "80px", height: "12px", marginBottom: "16px" }} />
        <div className="skeleton" style={{ width: "260px", height: "48px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "200px", height: "16px" }} />
      </div>
      <div className="skeleton" style={{ height: "80px", borderRadius: "16px", marginBottom: "48px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", marginBottom: "48px" }}>
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: "140px" }} />)}
      </div>
      <div className="skeleton" style={{ width: "160px", height: "28px", marginBottom: "20px" }} />
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "8px", marginBottom: "2px" }} />)}
    </div>
  );
}

export default function ProfileClient() {
  const [history, setHistory]       = useState<HistoryItem[]>([]);
  const [user, setUser]             = useState<{ username: string; email: string; phone: string } | null>(null);
  const [loading, setLoading]       = useState(true);
  const [currencySymbol, setCurrency] = useState("₹");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [uid, setUid]               = useState("");

  useEffect(() => {
    async function load() {
      const local = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
      if (!local.uid) { window.location.href = "/login"; return; }
      setCurrency(local.currencySymbol || "₹");
      setUid(local.uid);
      const res = await fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: local.uid }) });
      const data = await res.json();
      setHistory(data.history || []);
      setUser(data.user || null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    const local = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    setDeletingId(id);
    try {
      await fetch("/api/delete-month", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: local.uid, monthId: id }) });
      setHistory(h => h.filter(item => item.id !== id));
      showToast("Month deleted", "info");
    } catch { showToast("Failed to delete. Try again.", "error"); }
    finally { setDeletingId(null); setConfirmId(null); }
  }

  function scoreColor(s: number) { return s >= 8 ? "#22C55E" : s >= 5 ? "var(--gold)" : "#EF4444"; }
  function scoreLabel(s: number) { if (s >= 8) return "Excellent"; if (s >= 6) return "Good"; if (s >= 4) return "Fair"; return "Needs Work"; }

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(8,11,15,0.92)" }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
      </nav>
      <ProfileSkeleton />
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Minimal nav */}
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/settings"><button className="nav-btn">Settings</button></Link>
          <button className="nav-btn danger" onClick={() => setShowLogout(true)}>Logout</button>
        </div>
      </nav>

      {/* Logout confirm modal */}
      {showLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setShowLogout(false)}>
          <div className="animate-fadeUp" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px", maxWidth: "380px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <h2 className="font-serif" style={{ fontSize: "26px", marginBottom: "12px" }}>Sign out?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: 300, marginBottom: "28px" }}>Your data is safely stored in the cloud. You can sign back in any time.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="mg-btn mg-btn-outline" onClick={() => setShowLogout(false)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={{ flex: 1, padding: "14px", borderRadius: "100px", border: "none", background: "#EF4444", color: "white", fontFamily: "inherit", fontWeight: 500, fontSize: "15px", cursor: "pointer" }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 32px" }} className="page-container">

        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "10px" }}>Dashboard</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "6px" }}>
            {user ? `Hello, ${user.username}` : "Your Portfolio"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Track your financial health month by month</p>
        </div>

        {/* User info */}
        {user && (
          <div className="card animate-fadeUp delay-1" style={{ padding: "24px 32px", marginBottom: "48px" }}>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }} className="profile-info">
              {[
                { label: "Name",     value: user.username },
                { label: "Email",    value: user.email },
                { label: "Phone",    value: user.phone || "—" },
                { label: "Currency", value: currencySymbol },
              ].map((f, i) => (
                <div key={i}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>{f.label}</p>
                  <p style={{ fontWeight: 400, fontSize: "15px" }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature cards */}
        <div className="animate-fadeUp delay-2" style={{ marginBottom: "56px" }}>
          <h2 className="font-serif" style={{ fontSize: "26px", letterSpacing: "-0.01em", marginBottom: "6px" }}>What would you like to do?</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 300, marginBottom: "24px" }}>All your financial tools in one place</p>
          <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <div key={i} onClick={() => window.location.href = f.href}
                style={{ background: "var(--surface)", padding: "28px", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface)"}
              >
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: f.accent, opacity: 0.06, pointerEvents: "none" }} />
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--obsidian)", border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "18px", color: f.accent }}>{f.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>{f.title}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6", fontWeight: 300 }}>{f.desc}</p>
                </div>
                <span style={{ fontSize: "14px", color: f.accent, marginTop: "auto", opacity: 0.7 }}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Records */}
        <div className="animate-fadeUp delay-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="font-serif" style={{ fontSize: "26px", letterSpacing: "-0.01em" }}>Monthly Records</h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{history.length} {history.length === 1 ? "entry" : "entries"}</span>
              {history.length > 0 && (
                <button className="nav-btn" style={{ fontSize: "12px" }} onClick={() => { window.location.href = `/api/export?uid=${uid}&format=csv`; showToast("Downloading CSV...", "info"); }}>Export CSV</button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="card" style={{ padding: "64px 32px", textAlign: "center" }}>
              <p className="font-serif" style={{ fontSize: "22px", marginBottom: "8px" }}>No records yet</p>
              <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontWeight: 300 }}>Add your first monthly snapshot to get started</p>
              <Link href="/new-month"><button className="mg-btn mg-btn-gold">Add First Month →</button></Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {history.map((item, i) => (
                <div key={item.id}>
                  <div className="animate-fadeUp" style={{
                    animationDelay: `${0.05 * i}s`, opacity: 0,
                    background: "var(--surface)", border: `1px solid ${confirmId === item.id ? "rgba(239,68,68,0.3)" : "var(--border-subtle)"}`,
                    borderRadius: i === 0 ? "16px 16px 4px 4px" : i === history.length - 1 && confirmId !== item.id ? "4px 4px 16px 16px" : "4px",
                    padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, cursor: "pointer" }}
                      onClick={() => confirmId !== item.id && (window.location.href = `/portfolio?id=${item.id}`)}
                      onMouseEnter={e => { if (confirmId !== item.id) (e.currentTarget.parentElement as HTMLElement).style.background = "var(--surface-2)"; }}
                      onMouseLeave={e => { (e.currentTarget.parentElement as HTMLElement).style.background = "var(--surface)"; }}
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "14px", color: "var(--gold)" }}>◈</span>
                      </div>
                      <div>
                        {/* Better month label */}
                        <p style={{ fontWeight: 500, fontSize: "16px", marginBottom: "3px" }}>{formatMonth(item.month)}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          Income {currencySymbol}{item.income?.toLocaleString()} &nbsp;·&nbsp; Savings {currencySymbol}{item.savings?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "2px" }}>Guru Score</p>
                        <p style={{ fontSize: "13px", color: scoreColor(item.score), fontWeight: 500 }}>{scoreLabel(item.score)}</p>
                      </div>
                      <div className="font-serif" style={{ fontSize: "36px", color: scoreColor(item.score), lineHeight: 1 }}>{item.score}</div>
                      {confirmId !== item.id ? (
                        <button onClick={e => { e.stopPropagation(); setConfirmId(item.id); }}
                          style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "6px 10px", color: "var(--text-dim)", fontSize: "12px", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                          onMouseEnter={e => { (e.currentTarget).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget).style.color = "#EF4444"; }}
                          onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border-subtle)"; (e.currentTarget).style.color = "var(--text-dim)"; }}
                        >Delete</button>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "18px" }}>→</span>
                      )}
                    </div>
                  </div>
                  {confirmId === item.id && (
                    <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderTop: "none", borderRadius: i === history.length - 1 ? "0 0 16px 16px" : "0 0 4px 4px", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <p style={{ fontSize: "13px", color: "#EF4444" }}>Delete this entry permanently?</p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setConfirmId(null)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                        <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "#EF4444", color: "white", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                          {deletingId === item.id ? "Deleting..." : "Yes, Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
