import { NextResponse } from "next/server";

const MODELS = [
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-4-reasoning-plus:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];

function cleanText(str: string) {
  return str.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const { goal, months, portfolio } = await req.json();

    if (!goal || !months || !portfolio) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const prompt = `You are a financial planning AI. A user wants to achieve a financial goal and needs a concrete month-by-month savings plan.

User's current monthly finances:
- Income: ${portfolio.income}
- Recurring Costs: ${portfolio.recurring}
- Leisure Spending: ${portfolio.leisure}
- Current Savings: ${portfolio.savings}
- Emergency Fund contribution: ${portfolio.emergency}
- Investments: ${portfolio.investment}
- Current Guru Score: ${portfolio.score}/10

User's Goal: "${goal}"
Timeframe: ${months} months

Analyse their current spending and create a realistic plan. Return ONLY valid JSON, no other text:

{
  "goalSummary": "one sentence summary of the goal",
  "feasibility": "Achievable" | "Challenging" | "Very Ambitious",
  "feasibilityReason": "brief explanation of why",
  "monthlyPlan": [
    {
      "month": 1,
      "targetSavings": <number>,
      "leisureBudget": <number>,
      "adjustments": "specific advice for this month in one sentence"
    }
  ],
  "totalProjected": <total savings across all months>,
  "keyChanges": ["change 1", "change 2", "change 3"],
  "warning": "any important caveat or null if none"
}`;

    let lastError = "";
    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://moneyguru.app",
            "X-Title": "MoneyGuru",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1200,
            temperature: 0.3,
          }),
        });

        if (res.status === 429) { lastError = "Rate limited"; continue; }
        if (!res.ok) { lastError = `Model error ${res.status}`; continue; }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || "";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (e) {
        lastError = String(e);
        continue;
      }
    }

    return NextResponse.json({ error: "All AI models failed: " + lastError }, { status: 500 });
  } catch (err) {
    console.error("GOAL PLAN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
