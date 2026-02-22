"use client";
import { useState, useEffect } from "react";

const STEPS = [
  {
    number: 1,
    title: "Welcome to MoneyGuru",
    subtitle: "Your personal financial discipline tracker",
    content: "MoneyGuru isn't just another finance app. Instead of showing where your money went, it evaluates whether your financial behaviour is healthy — and scores it every month.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
        {[
          { label: "Track monthly income & expenses", done: true },
          { label: "Get an AI-powered Guru Score", done: true },
          { label: "Receive personalised advice", done: true },
          { label: "Watch your score improve over time", done: true },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "10px", color: "var(--gold)" }}>✓</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 300 }}>{item.label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: 2,
    title: "How the Guru Score works",
    subtitle: "Your financial health in a single number",
    content: "Each month you enter 6 simple numbers. Our AI evaluates the balance between your income, spending, savings, and investments — then assigns a score from 0 to 10.",
    visual: (
      <div style={{ maxWidth: "360px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "var(--border-subtle)", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
          {[
            { score: "9–10", label: "Outstanding", color: "#22C55E" },
            { score: "7–8", label: "Excellent", color: "#22C55E" },
            { score: "5–6", label: "Good", color: "var(--gold)" },
            { score: "3–4", label: "Fair", color: "var(--gold)" },
            { score: "1–2", label: "Needs Work", color: "#EF4444" },
            { score: "0", label: "Critical", color: "#EF4444" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="font-serif" style={{ fontSize: "22px", color: s.color }}>{s.score}</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-dim)", textAlign: "center", fontWeight: 300 }}>Score improves as your savings rate grows and spending stays balanced</p>
      </div>
    ),
  },
  {
    number: 3,
    title: "You're all set",
    subtitle: "Start with your first monthly snapshot",
    content: "Add this month's income, expenses, savings, and investments. The AI will analyse your numbers and give you your first Guru Score along with personalised advice.",
    visual: (
      <div style={{ maxWidth: "340px", margin: "0 auto" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: "8px" }}>Your First Score</p>
          <div className="font-serif" style={{ fontSize: "80px", lineHeight: 1, background: "linear-gradient(135deg, #E8C97A 0%, #C9A84C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>?</div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 300, lineHeight: "1.6" }}>Fill in your first month to unlock your score and personalised AI insights</p>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
          {["Income", "Expenses", "Savings", "Investments"].map((label, i) => (
            <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", background: "var(--gold-dim)", border: "1px solid var(--border)", color: "var(--gold-light)", fontSize: "12px", fontWeight: 500 }}>{label}</span>
          ))}
        </div>
      </div>
    ),
  },
];

export default function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    if (!user.uid) { window.location.href = "/login"; return; }
    // If already seen onboarding, skip to dashboard
    if (localStorage.getItem("mgOnboardingDone")) {
      window.location.href = "/profile";
    }
  }, []);

  function next() {
    if (animating) return;
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem("mgOnboardingDone", "1");
    window.location.href = "/dashboard";
  }

  function skip() {
    localStorage.setItem("mgOnboardingDone", "1");
    window.location.href = "/profile";
  }

  const current = STEPS[step];

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button onClick={skip} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
          Skip →
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: "2px", background: "var(--border-subtle)", margin: "0 48px" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, var(--gold-light), var(--gold))", borderRadius: "2px", transition: "width 0.4s ease", width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: "560px", opacity: animating ? 0 : 1, transition: "opacity 0.2s", textAlign: "center" }}>

          {/* Step number */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", border: "1px solid var(--border)", background: "var(--gold-dim)", marginBottom: "28px" }}>
            <span style={{ fontSize: "12px", color: "var(--gold-light)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
              Step {current.number} of {STEPS.length}
            </span>
          </div>

          <h1 className="font-serif" style={{ fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "10px" }}>
            {current.title}
          </h1>
          <p style={{ color: "var(--gold)", fontSize: "14px", fontWeight: 500, marginBottom: "20px" }}>{current.subtitle}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.7", fontWeight: 300, marginBottom: "40px", maxWidth: "460px", margin: "0 auto 40px" }}>
            {current.content}
          </p>

          {/* Visual */}
          <div style={{ marginBottom: "48px" }}>
            {current.visual}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
            {step > 0 && (
              <button className="mg-btn mg-btn-outline" onClick={() => setStep(s => s - 1)} style={{ padding: "12px 24px" }}>
                ← Back
              </button>
            )}
            <button className="mg-btn mg-btn-gold" onClick={next} style={{ minWidth: "180px" }}>
              {step === STEPS.length - 1 ? "Add First Month →" : "Next →"}
            </button>
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === step ? "var(--gold)" : "var(--border)", transition: "all 0.3s", cursor: "pointer" }} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
