"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useSearchParams } from "next/navigation";

type PortfolioData = {
  userType: string;
  income: number;
  recurring: number;
  leisure: number;
  savings: number;
  emergency: number;
  investment: number;
  score: number;
  advice: string[];
  month: string;
};

export default function PortfolioClient() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const monthId = params.get("hid");
  const isHistory = params.get("history") === "true";

  async function handleLogout() {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "/";
  }

  function goToChat() {
    window.location.href = "/chat";
  }

  function goToHistory() {
    window.location.href = "/history";
  }

  function goToNewMonth() {
    window.location.href = "/new-month";
  }

  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  function exitHistory() {
    window.location.href = "/history";
  }

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const user = JSON.parse(localStorage.getItem("moneyguruUser") || "{}");

        if (!user.uid) {
          window.location.href = "/login";
          return;
        }

        let portfolioData: any = null;

        // history doc
        if (isHistory && monthId) {
          const ref = doc(db, "portfolios", user.uid, "history", monthId);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            portfolioData = snap.data();
          }
        }

        // latest doc fallback
        if (!portfolioData) {
          const ref = doc(db, "portfolios", user.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            portfolioData = snap.data();
          }
        }

        if (!portfolioData) {
          alert("No portfolio found.");
          window.location.href = "/history";
          return;
        }

        // 🔥 CALL AI SCORE
        const aiRes = await fetch("/api/ai-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            income: portfolioData.income,
            recurring: portfolioData.recurring,
            leisure: portfolioData.leisure,
            savings: portfolioData.savings,
            emergency: portfolioData.emergency,
            investment: portfolioData.investment,
          }),
        });

        const aiData = await aiRes.json();

        portfolioData.score = aiData.score;
        portfolioData.advice = aiData.advice;

        setData(portfolioData);

        localStorage.setItem(
          "moneyguruPortfolio",
          JSON.stringify(portfolioData)
        );
      } catch (err) {
        console.error("LOAD PORTFOLIO ERROR:", err);
        alert("Failed to load portfolio.");
        window.location.href = "/history";
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [monthId, isHistory]);

  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading portfolio...
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-10">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold">Financial Portfolio</h1>
            <p className="text-gray-400 mt-2">
              AI-powered financial analysis
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">

            {isHistory && (
              <button onClick={exitHistory}
                className="px-6 py-2 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                ← Back to History
              </button>
            )}

            <button onClick={goToHistory}
              className="px-6 py-2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              History
            </button>

            <button onClick={goToChat}
              className="px-6 py-2 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              AI Advisor
            </button>

            <button onClick={goToNewMonth}
              className="px-6 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              Add New Month
            </button>

            <button onClick={goToDashboard}
              className="px-6 py-2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Edit Portfolio
            </button>

            <button onClick={handleLogout}
              className="px-6 py-2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              Logout
            </button>
          </div>
        </header>

        {/* SCORE */}
        <section className="flex items-center gap-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-2xl p-6">
          <div className="text-7xl font-extrabold text-yellow-400">
            {data.score}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              Overall Financial Health
            </h2>
            <p className="text-gray-400 text-sm">
              AI evaluated based on your income, spending & savings
            </p>
          </div>
        </section>

        {/* METRICS */}
        <section className="grid md:grid-cols-3 gap-6">
          <Metric label="Income" value={data.income} />
          <Metric label="Recurring Costs" value={data.recurring} />
          <Metric label="Leisure Spending" value={data.leisure} />
          <Metric label="Savings" value={data.savings} />
          <Metric label="Emergency Fund" value={data.emergency} />
          <Metric label="Investments" value={data.investment} />
        </section>

        {/* AI INSIGHTS */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">
            AI Smart Insights
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {data.advice?.map((a, i) => {
              const parts = a.split(":");
              const title = parts.shift();
              const content = parts.join(":");

              return (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-blue-400 font-semibold mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {content}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-1">₹{value}</p>
    </div>
  );
}
