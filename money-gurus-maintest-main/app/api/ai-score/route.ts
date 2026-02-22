import { NextResponse } from "next/server";

function cleanText(str: string) {
  return str
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Free models in priority order — if one is rate-limited, falls to next
const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-r1-zero:free",
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-4-reasoning-plus:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { income, recurring, leisure, savings, emergency, investment } = body;

    const prompt = `You are a financial advisor AI.

Return ONLY valid JSON in this exact format, nothing else:

{
  "score": <number between 0 and 10>,
  "advice": [
    "Strength: <your strength observation>",
    "Risk: <your risk observation>",
    "Action: <your recommended action>",
    "Investment Strategy: <investment advice>",
    "Emergency Planning: <emergency fund advice>",
    "Lifestyle Tip: <lifestyle spending tip>"
  ]
}

Financial Data:
Income: ${income}
Recurring Expenses: ${recurring}
Leisure Spending: ${leisure}
Savings: ${savings}
Emergency Fund: ${emergency}
Investments: ${investment}

Rules:
- Return ONLY the JSON object above
- No markdown, no backticks, no extra text
- All 6 advice items must be present
- Score must be a number 0-10`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("AI SCORE: OPENROUTER_API_KEY is not set");
      return NextResponse.json({ score: 0, advice: [], error: "API key not configured" });
    }

    let text = "";
    let lastError = "";

    for (const model of MODELS) {
      try {
        console.log("Trying model:", model);

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
            temperature: 0.3,
            max_tokens: 600,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          lastError = data.error?.message || `HTTP ${response.status}`;
          console.warn(`Model ${model} failed:`, lastError);
          // Wait 1 second before trying next model
          await new Promise(res => setTimeout(res, 1000));
          continue;
        }

        const content = data.choices?.[0]?.message?.content || "";
        if (content) {
          text = content;
          console.log("Success with model:", model);
          break;
        }

      } catch (modelErr) {
        lastError = String(modelErr);
        console.warn(`Model ${model} threw:`, modelErr);
        // Wait 1 second before trying next model
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
    }

    if (!text) {
      return NextResponse.json({
        score: 0,
        advice: [],
        error: `All models failed. Last: ${lastError}`,
      });
    }

    console.log("AI RAW RESPONSE:", text);

    // Strip markdown fences if present
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Extract JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("AI SCORE: No JSON found in response:", text);
      return NextResponse.json({ score: 0, advice: [], error: "No JSON in AI response" });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (parseErr) {
      console.error("AI SCORE: JSON parse failed:", match[0]);
      return NextResponse.json({ score: 0, advice: [], error: "JSON parse failed" });
    }

    const cleanedAdvice = (parsed.advice || []).map((a: string) => cleanText(a));

    let score = Number(parsed.score);
    if (isNaN(score)) score = 5;
    if (score > 10) score = Math.round(score / 10);
    if (score < 0) score = 0;
    if (score > 10) score = 10;

    return NextResponse.json({ score, advice: cleanedAdvice });

  } catch (err) {
    console.error("AI SCORE ERROR:", err);
    return NextResponse.json({ score: 0, advice: [], error: String(err) });
  }
}
