import { NextResponse } from "next/server";

const MODELS = [
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-4-reasoning-plus:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, portfolio } = body;

    const prompt = `You are a certified Indian financial advisor.

User Financial Profile:
Income: ₹${portfolio?.income || 0}
Recurring Expenses: ₹${portfolio?.recurring || 0}
Leisure Spending: ₹${portfolio?.leisure || 0}
Savings: ₹${portfolio?.savings || 0}
Emergency Fund: ₹${portfolio?.emergency || 0}
Investments: ₹${portfolio?.investment || 0}

User Question:
"${message}"

Give a clear, short, final answer. Do not ask questions. Use ₹ currency.`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "AI service not configured." });
    }

    let replyText = "";
    let lastError = "";

    for (const model of MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://moneyguru.app",
            "X-Title": "MoneyGuru",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          lastError = data.error?.message || `HTTP ${response.status}`;
          console.warn(`Chat model ${model} failed:`, lastError);
          continue;
        }

        const content = data.choices?.[0]?.message?.content || "";
        if (content) {
          replyText = content;
          break;
        }

      } catch (modelErr) {
        lastError = String(modelErr);
        continue;
      }
    }

    if (!replyText) {
      return NextResponse.json({ reply: `AI service temporarily unavailable. Please try again shortly.` });
    }

    const cleaned = replyText
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return NextResponse.json({ reply: cleaned });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return NextResponse.json({ reply: "AI service unavailable." });
  }
}
