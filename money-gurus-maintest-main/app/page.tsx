"use client";
import Link from "next/link";

const FEATURES = [
  { n: "01", t: "Guru Score",        d: "AI evaluates your financial behaviour and gives a score from 0–10 every month." },
  { n: "02", t: "Goal Planner",      d: "Tell the AI your goal — get a personalised month-by-month savings plan." },
  { n: "03", t: "Category Budgets",  d: "Set spending limits per category and track actuals in real time." },
  { n: "04", t: "Leaderboard",       d: "Compare scores with friends and family using private group codes." },
  { n: "05", t: "AI Advisor",        d: "Chat with your financial AI — ask anything about your money habits." },
  { n: "06", t: "Export Reports",    d: "Download your full financial history as a CSV or styled PDF." },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", position: "relative", overflow: "hidden" }}>

      {/* Background glow */}
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "600px", background: "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
        <span className="font-serif text-gold" style={{ fontSize: "22px", letterSpacing: "-0.01em" }}>MoneyGuru</span>
        <Link href="/select-user">
          <button className="mg-btn mg-btn-outline" style={{ padding: "10px 24px", fontSize: "13px" }}>Sign In →</button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 48px 60px" }}>
        <div className="animate-fadeUp" style={{ maxWidth: "720px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", border: "1px solid var(--border)", background: "var(--gold-dim)", marginBottom: "36px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "var(--gold-light)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>AI-Powered Financial Intelligence</span>
          </div>

          <h1 className="font-serif" style={{ fontSize: "clamp(40px, 7vw, 88px)", lineHeight: "1.05", letterSpacing: "-0.02em", marginBottom: "24px" }}>
            Build wealth through<br /><span className="text-gold">better decisions.</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-muted)", lineHeight: "1.7", maxWidth: "520px", marginBottom: "40px", fontWeight: 300 }}>
            MoneyGuru evaluates the quality of your financial behaviour — not just your balance. Get your Guru Score every month and build lasting discipline.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/select-user">
              <button className="mg-btn mg-btn-gold" style={{ fontSize: "16px", padding: "16px 40px" }}>Get Started Free</button>
            </Link>
            <Link href="/select-user">
              <button className="mg-btn mg-btn-outline" style={{ fontSize: "15px", padding: "16px 32px" }}>Sign In</button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="animate-fadeUp delay-2 stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border-subtle)", borderRadius: "20px", overflow: "hidden", marginTop: "80px", maxWidth: "680px" }}>
          {[
            { value: "0–10", label: "Guru Score Range" },
            { value: "6+",   label: "AI-Powered Features" },
            { value: "PWA",  label: "Install on Mobile" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", padding: "28px 24px" }}>
              <div className="font-serif text-gold" style={{ fontSize: "32px", marginBottom: "6px" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="features-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 48px 100px" }}>
        <div className="gold-line" style={{ marginBottom: "64px" }} />

        <div className="features-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.15", letterSpacing: "-0.02em", marginBottom: "20px" }}>
              Finance apps track.<br />
              <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>MoneyGuru teaches.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.8", fontWeight: 300, fontSize: "16px", marginBottom: "32px" }}>
              Instead of showing where your money went, MoneyGuru evaluates whether your financial behaviour is healthy, risky, or improving — month after month.
            </p>
            <Link href="/select-user">
              <button className="mg-btn mg-btn-gold" style={{ fontSize: "14px", padding: "12px 28px" }}>Start Tracking →</button>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: i === 0 ? "16px 16px 4px 4px" : i === FEATURES.length - 1 ? "4px 4px 16px 16px" : "4px",
                padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"}
              >
                <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", paddingTop: "2px", minWidth: "24px" }}>{f.n}</span>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: "4px", fontSize: "14px" }}>{f.t}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6", fontWeight: 300 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-serif text-gold" style={{ fontSize: "16px" }}>MoneyGuru</span>
        <span style={{ fontSize: "12px", color: "var(--text-dim)", letterSpacing: "0.04em" }}>Financial discipline, not just data.</span>
      </footer>
    </main>
  );
}
