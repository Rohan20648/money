"use client";
import { useState, useEffect } from "react";
import { showToast } from "../components/Toast";

const CURRENCIES = [
  { code: "INR", symbol: "₹",    label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$",    label: "US Dollar ($)" },
  { code: "EUR", symbol: "€",    label: "Euro (€)" },
  { code: "GBP", symbol: "£",    label: "British Pound (£)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
  { code: "SGD", symbol: "S$",   label: "Singapore Dollar (S$)" },
  { code: "AUD", symbol: "A$",   label: "Australian Dollar (A$)" },
  { code: "CAD", symbol: "C$",   label: "Canadian Dollar (C$)" },
];

export default function SettingsClient() {
  const [username, setUsername] = useState("");
  const [phone, setPhone]       = useState("");
  const [currency, setCurrency] = useState("INR");
  const [email, setEmail]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [uid, setUid]           = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    if (!user.uid) { window.location.href = "/login"; return; }
    setUid(user.uid);
    setUsername(user.username || "");
    setEmail(user.email || "");
    const cur = CURRENCIES.find(c => c.symbol === user.currencySymbol) || CURRENCIES[0];
    setCurrency(cur.code);
    // Load phone from API
    fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: user.uid }) })
      .then(r => r.json()).then(d => { if (d.user?.phone) setPhone(d.user.phone); });
  }, []);

  async function handleSave() {
    if (!username.trim()) { showToast("Username cannot be empty", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, username, phone, currency }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // Update localStorage
      const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
      const sel = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
      localStorage.setItem("moneyguruUser", JSON.stringify({ ...user, username, currencySymbol: sel.symbol, currency: sel.code }));
      showToast("Settings saved successfully", "success");
    } catch { showToast("Failed to save settings", "error"); }
    finally { setSaving(false); }
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
      </nav>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 32px" }} className="page-container">
        <div className="animate-fadeUp" style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>Account</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Settings</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 300, marginTop: "8px" }}>Update your profile and preferences</p>
        </div>

        {/* Profile settings */}
        <div className="card animate-fadeUp delay-1" style={{ padding: "32px", marginBottom: "16px" }}>
          <h2 className="font-serif" style={{ fontSize: "20px", marginBottom: "24px" }}>Profile</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 500 }}>Username</label>
              <input className="mg-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="your_name" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 500 }}>Email</label>
              <input className="mg-input" value={email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "6px" }}>Email cannot be changed</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 500 }}>Phone</label>
              <input className="mg-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="card animate-fadeUp delay-2" style={{ padding: "32px", marginBottom: "24px" }}>
          <h2 className="font-serif" style={{ fontSize: "20px", marginBottom: "8px" }}>Currency</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 300, marginBottom: "20px" }}>All amounts in the app will display in this currency</p>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{
            width: "100%", background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: "12px", padding: "14px 18px", color: "var(--text)",
            fontFamily: "'DM Sans', sans-serif", fontSize: "15px", outline: "none", cursor: "pointer",
          }}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} style={{ background: "#0E1219" }}>{c.label}</option>
            ))}
          </select>
        </div>

        <button className="mg-btn mg-btn-gold animate-fadeUp delay-3" onClick={handleSave} disabled={saving} style={{ width: "100%", marginBottom: "40px" }}>
          {saving ? "Saving..." : "Save Changes →"}
        </button>

        {/* Danger zone */}
        <div className="animate-fadeUp delay-4" style={{ padding: "24px 28px", borderRadius: "14px", border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.04)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#EF4444", marginBottom: "8px", letterSpacing: "0.02em" }}>Danger Zone</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 300, marginBottom: "16px" }}>Signing out will clear your local session. Your data is safely stored and will be here when you return.</p>
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} style={{ padding: "8px 20px", borderRadius: "100px", border: "1px solid rgba(239,68,68,0.3)", background: "none", color: "#EF4444", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
              Sign Out
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ fontSize: "13px", color: "#EF4444", flex: 1 }}>Are you sure?</p>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "100px", border: "none", background: "#EF4444", color: "white", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Yes, Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
