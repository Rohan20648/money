"use client";
import Link from "next/link";

export default function SelectUser() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "28px 48px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/">
          <span className="font-serif text-gold" style={{ fontSize: "22px", cursor: "pointer" }}>MoneyGuru</span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: "760px" }}>
          <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "16px" }}>Get Started</p>
            <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 58px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Choose your profile</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "16px", fontWeight: 300, fontSize: "16px" }}>Select the experience that matches your financial stage</p>
          </div>

          <div className="animate-fadeUp delay-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Link href="/login?type=student" style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "20px", padding: "40px 36px", cursor: "pointer",
                transition: "all 0.3s", position: "relative", overflow: "hidden"
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(201,168,76,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "20px" }}></div>
                <h3 className="font-serif" style={{ fontSize: "26px", marginBottom: "12px", letterSpacing: "-0.01em" }}>Student</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", fontWeight: 300 }}>
                  Build responsible money habits, manage your allowance, and learn financial discipline from day one.
                </p>
                <div style={{ marginTop: "28px", fontSize: "13px", color: "var(--gold)", fontWeight: 500 }}>Select →</div>
              </div>
            </Link>

            <Link href="/login?type=adult" style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "20px", padding: "40px 36px", cursor: "pointer",
                transition: "all 0.3s", position: "relative", overflow: "hidden"
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(201,168,76,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "20px" }}></div>
                <h3 className="font-serif" style={{ fontSize: "26px", marginBottom: "12px", letterSpacing: "-0.01em" }}>Professional</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", fontWeight: 300 }}>
                  Track income, expenses, savings, and investments with intelligent AI insights for long-term growth.
                </p>
                <div style={{ marginTop: "28px", fontSize: "13px", color: "var(--gold)", fontWeight: 500 }}>Select →</div>
              </div>
            </Link>
          </div>

          <p className="animate-fadeUp delay-4" style={{ textAlign: "center", marginTop: "40px", fontSize: "12px", color: "var(--text-dim)" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--gold)", textDecoration: "none" }}>Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
