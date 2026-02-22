"use client";
import { useState, useEffect } from "react";

type Member = { id: string; username: string; score: number; };

export default function LeaderboardClient() {
  const [inputCode, setInputCode] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [myUid, setMyUid] = useState("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"home" | "board">("home");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    if (!user.uid) { window.location.href = "/login"; return; }
    setMyUid(user.uid);
    const saved = localStorage.getItem("mgLeaderboardCode");
    if (saved) loadBoard(saved, user.uid);
  }, []);

  async function loadBoard(code: string, uid: string) {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/leaderboard/scores", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode: code, uid }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMembers(data.members);
      setGroupCode(code);
      setView("board");
      localStorage.setItem("mgLeaderboardCode", code);
    } catch { setError("Could not load leaderboard. Check the group code."); }
    finally { setLoading(false); }
  }

  async function handleJoin() {
    if (inputCode.trim().length < 4) return;
    const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");
    setJoining(true); setError("");
    try {
      const res = await fetch("/api/leaderboard/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, username: user.username, groupCode: inputCode }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadBoard(inputCode.toUpperCase(), user.uid);
    } catch { setError("Failed to join. Try again."); }
    finally { setJoining(false); }
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setInputCode(code);
  }

  function copyCode() {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function leaveGroup() {
    localStorage.removeItem("mgLeaderboardCode");
    setGroupCode(""); setMembers([]); setInputCode(""); setView("home");
  }

  function scoreColor(s: number) { return s >= 8 ? "#22C55E" : s >= 5 ? "var(--gold)" : "#EF4444"; }
  function scoreLabel(s: number) {
    if (s >= 8) return "Excellent"; if (s >= 6) return "Good";
    if (s >= 4) return "Fair"; return "Needs Work";
  }
  function rankLabel(i: number) { return ["1st","2nd","3rd"][i] ?? `${i+1}th`; }
  function rankColor(i: number) { return ["#F59E0B","#9CA3AF","#92400E"][i] ?? "var(--text-dim)"; }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(8,11,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span className="font-serif text-gold" style={{ fontSize: "20px" }}>MoneyGuru</span>
        <div style={{ display: "flex", gap: "8px" }}>
          {view === "board" && <button className="nav-btn danger" onClick={leaveGroup}>Leave Group</button>}
          <button className="nav-btn" onClick={() => window.location.href = "/profile"}>← Profile</button>
        </div>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 32px" }}>

        {/* HOME VIEW */}
        {view === "home" && (
          <div className="animate-fadeUp">
            <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "12px" }}>Social</p>
            <h1 className="font-serif" style={{ fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "16px" }}>Score Leaderboard</h1>
            <p style={{ color: "var(--text-muted)", fontWeight: 300, marginBottom: "48px", maxWidth: "480px" }}>
              Compare Guru Scores with friends and family. Only usernames and scores are visible — no financial data is ever shared.
            </p>

            <div className="card" style={{ padding: "36px", marginBottom: "16px" }}>
              <h2 className="font-serif" style={{ fontSize: "22px", marginBottom: "8px" }}>Join or Create a Group</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px", fontWeight: 300 }}>
                Create a 6-character code and share it with people you want to compete with. Anyone with the code can join.
              </p>

              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <input
                  className="mg-input"
                  placeholder="GROUP CODE"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  onKeyDown={e => e.key === "Enter" && handleJoin()}
                  maxLength={6}
                  style={{ flex: 1, letterSpacing: "0.15em", fontWeight: 600, fontSize: "18px", textAlign: "center" }}
                />
                <button className="mg-btn mg-btn-gold" onClick={handleJoin} disabled={joining || inputCode.length < 4} style={{ whiteSpace: "nowrap", padding: "14px 28px" }}>
                  {joining ? "Joining..." : "Join →"}
                </button>
              </div>

              <button onClick={generateCode} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: "13px", cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>
                Generate a random code for me
              </button>

              {error && <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "16px" }}>{error}</p>}
            </div>

            <div style={{ padding: "20px 24px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.7" }}>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>How it works —</span> Enter any 6-character code and click Join. Share that same code with friends so they can join too. Scores update automatically each time someone adds a new month. Leave and rejoin any group at any time.
              </p>
            </div>
          </div>
        )}

        {/* BOARD VIEW */}
        {view === "board" && (
          <div className="animate-fadeUp">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: "10px" }}>Group Leaderboard</p>
                <h1 className="font-serif" style={{ fontSize: "clamp(32px, 4vw, 44px)", letterSpacing: "-0.02em" }}>Rankings</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>{members.length} {members.length === 1 ? "member" : "members"}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: 700, background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 20px", borderRadius: "10px", letterSpacing: "0.15em", color: "var(--gold-light)" }}>
                  {groupCode}
                </div>
                <button className="nav-btn primary" onClick={copyCode}>
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ width: "28px", height: "28px", border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", margin: "0 auto 12px" }} className="animate-spin" />
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading scores...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="card" style={{ padding: "64px 32px", textAlign: "center" }}>
                <p className="font-serif" style={{ fontSize: "22px", marginBottom: "8px" }}>No members yet</p>
                <p style={{ color: "var(--text-muted)", fontWeight: 300 }}>Share the code <strong style={{ color: "var(--gold)", letterSpacing: "0.1em" }}>{groupCode}</strong> to invite others</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {members.map((m, i) => {
                  const isMe = m.id === myUid;
                  return (
                    <div key={m.id} style={{
                      background: isMe ? "var(--surface-2)" : "var(--surface)",
                      border: `1px solid ${isMe ? "var(--border)" : "var(--border-subtle)"}`,
                      borderRadius: i === 0 ? "16px 16px 4px 4px" : i === members.length - 1 ? "4px 4px 16px 16px" : "4px",
                      padding: "22px 28px", display: "flex", alignItems: "center", gap: "24px"
                    }}>
                      {/* Rank */}
                      <div style={{ width: "48px", textAlign: "center", flexShrink: 0 }}>
                        <span className="font-serif" style={{ fontSize: "22px", color: rankColor(i), fontWeight: 600 }}>{rankLabel(i)}</span>
                      </div>

                      {/* Medal bar for top 3 */}
                      {i < 3 && (
                        <div style={{ width: "3px", height: "40px", borderRadius: "2px", background: rankColor(i), flexShrink: 0, opacity: 0.6 }} />
                      )}

                      {/* Name */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <p style={{ fontWeight: 500, fontSize: "17px" }}>{m.username}</p>
                          {isMe && <span style={{ fontSize: "10px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "100px", fontWeight: 600, letterSpacing: "0.06em" }}>YOU</span>}
                        </div>
                        <p style={{ fontSize: "13px", color: scoreColor(m.score), fontWeight: 500, marginTop: "2px" }}>{scoreLabel(m.score)}</p>
                      </div>

                      {/* Score */}
                      <div className="font-serif" style={{ fontSize: "48px", color: scoreColor(m.score), lineHeight: 1, fontWeight: 400 }}>{m.score}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <p style={{ textAlign: "center", marginTop: "28px", fontSize: "12px", color: "var(--text-dim)", letterSpacing: "0.02em" }}>
              Scores sync automatically when members add a new month
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
