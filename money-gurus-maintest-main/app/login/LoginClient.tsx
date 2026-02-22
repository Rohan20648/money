"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginClient() {
  const params = useSearchParams();
  const router = useRouter();
  const userType = params.get("type");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setError(""); setLoading(true);
    try {
      const email = username.includes("@") ? username : username + "@moneyguru.com";
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const userSnap = await getDoc(doc(db, "users", uid));
      if (!userSnap.exists()) throw new Error("User not found");
      const userData = userSnap.data();
      localStorage.setItem("moneyguruUser", JSON.stringify({
        uid, username: userData.username, userType: userData.userType,
        email: userData.email || email,
        currencySymbol: userData.currencySymbol || "₹",
        currency: userData.currency || "INR",
      }));
      const portfolioSnap = await getDoc(doc(db, "portfolios", uid));
      const isNewUser = !portfolioSnap.exists();
      const seenOnboarding = localStorage.getItem("mgOnboardingDone");
      if (isNewUser && !seenOnboarding) {
        router.push("/onboarding");
      } else {
        router.push(portfolioSnap.exists() ? "/profile" : `/dashboard?type=${userData.userType}`);
      }
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "28px 48px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/"><span className="font-serif text-gold" style={{ fontSize: "22px", cursor: "pointer" }}>MoneyGuru</span></Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div className="animate-fadeUp" style={{ width: "100%", maxWidth: "420px" }}>

          <div style={{ marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>
              {userType === "student" ? "Student" : "Professional"} Access
            </p>
            <h1 className="font-serif" style={{ fontSize: "40px", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "8px" }}>Welcome back</h1>
            <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Sign in to your financial dashboard</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Username or Email</label>
              <input className="mg-input" placeholder="your_username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Password</label>
              <input className="mg-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <button className="mg-btn mg-btn-gold" onClick={handleLogin} disabled={loading} style={{ marginTop: "8px", width: "100%" }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "13px", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--gold)", textDecoration: "none" }}>Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
