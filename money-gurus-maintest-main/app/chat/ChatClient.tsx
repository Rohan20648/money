"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; text: string; };

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    try {
      const portfolio = JSON.parse(localStorage.getItem("moneyguruPortfolio") || "{}");
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.text, portfolio }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Error contacting AI. Please try again." }]);
    } finally { setLoading(false); }
  }

  const suggestions = ["Can I afford a vacation this month?", "How should I grow my emergency fund?", "Is my savings rate healthy?", "Best SIP options for my income?"];

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "760px", margin: "0 auto", width: "100%", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ padding: "40px 0 24px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "10px" }}>AI Financial Advisor</p>
          <h1 className="font-serif" style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>Ask your advisor</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px", fontWeight: 300, fontSize: "14px" }}>Powered by your personal financial profile</p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0 16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "300px" }}>
          {messages.length === 0 && (
            <div style={{ padding: "20px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", textAlign: "center" }}>Try asking something like:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)} style={{ padding: "14px 16px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", lineHeight: "1.4" }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--text)"; }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border-subtle)"; (e.currentTarget).style.color = "var(--text-muted)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", marginRight: "10px", flexShrink: 0, marginTop: "2px" }}>🤖</div>
              )}
              <div style={{
                maxWidth: "75%", padding: "14px 18px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "var(--gold-dim)" : "var(--surface)",
                border: `1px solid ${m.role === "user" ? "var(--border)" : "var(--border-subtle)"}`,
                color: "var(--text)", fontSize: "14px", lineHeight: "1.7", fontWeight: 300
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
              <div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: "var(--surface)", border: "1px solid var(--border-subtle)", display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map(j => <span key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", display: "inline-block", animation: `fadeIn 1s ${j * 0.2}s infinite alternate` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "16px 0 32px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              className="mg-input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your finances..."
              style={{ flex: 1 }}
            />
            <button className="mg-btn mg-btn-gold" onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "14px 24px", whiteSpace: "nowrap" }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
