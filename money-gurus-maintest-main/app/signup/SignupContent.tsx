"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const CURRENCIES = [
  { code: "INR", symbol: "₹",    label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$",    label: "US Dollar ($)" },
  { code: "EUR", symbol: "€",    label: "Euro (€)" },
  { code: "GBP", symbol: "£",    label: "British Pound (£)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
  { code: "SGD", symbol: "S$",   label: "Singapore Dollar (S$)" },
  { code: "AUD", symbol: "A$",   label: "Australian Dollar (A$)" },
  { code: "CAD", symbol: "C$",   label: "Canadian Dollar (C$)" },
];

export default function SignupContent() {
  const router = useRouter();
  const params = useSearchParams();
  const userType = params.get("type");

  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", confirm: "" });
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSignup() {
    const { username, email, phone, password, confirm } = form;
    if (!username || !email || !phone || !password || !confirm) { setError("Please fill all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const sel = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
      await setDoc(doc(db, "users", uid), {
        username, email, phone,
        userType: userType || "adult",
        currency: sel.code,
        currencySymbol: sel.symbol,
        createdAt: new Date(),
      });
      router.push(`/login?type=${userType || "adult"}`);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("This email is already registered.");
      else if (err.code === "auth/invalid-email") setError("Please enter a valid email.");
      else setError("Signup failed. Please try again.");
    } finally { setLoading(false); }
  }

  const fields = [
    { key: "username", label: "Username",         type: "text",     placeholder: "your_name" },
    { key: "email",    label: "Email Address",    type: "email",    placeholder: "you@example.com" },
    { key: "phone",    label: "Phone Number",     type: "tel",      placeholder: "+91 98765 43210" },
    { key: "password", label: "Password",         type: "password", placeholder: "Min. 6 characters" },
    { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "Same as above" },
  ];

  const filled = Object.values(form).filter(v => v !== "").length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "28px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/"><span className="font-serif text-gold" style={{ fontSize: "22px", cursor: "pointer" }}>MoneyGuru</span></Link>
        <Link href="/select-user"><button className="nav-btn">← Choose Profile</button></Link>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div className="animate-fadeUp" style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ marginBottom: "40px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", border: "1px solid var(--border)", background: "var(--gold-dim)", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", color: "var(--gold-light)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
                {userType === "student" ? "Student" : "Professional"} Account
              </span>
            </div>
            <h1 className="font-serif" style={{ fontSize: "42px", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "8px" }}>Create account</h1>
            <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Join MoneyGuru and start building financial discipline</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 500 }}>{label}</label>
                <input className="mg-input" type={type} placeholder={placeholder}
                  value={form[key as keyof typeof form]} onChange={set(key)}
                  onKeyDown={e => e.key === "Enter" && handleSignup()} />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 500 }}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={{
                width: "100%", background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "12px", padding: "14px 18px", color: "var(--text)",
                fontFamily: "'DM Sans', sans-serif", fontSize: "15px", outline: "none", cursor: "pointer",
              }}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: "#0E1219" }}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ height: "2px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(filled / 5) * 100}%`, background: "linear-gradient(90deg, var(--gold-light), var(--gold))", borderRadius: "2px", transition: "width 0.3s ease" }} />
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
          )}

          <button className="mg-btn mg-btn-gold" onClick={handleSignup} disabled={loading} style={{ width: "100%", fontSize: "15px" }}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href={`/login?type=${userType || "adult"}`} style={{ color: "var(--gold)", textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
