import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const format = searchParams.get("format") || "csv";

    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    // Fetch user info
    const userSnap = await adminDb.collection("users").doc(uid).get();
    const user = userSnap.exists ? userSnap.data() : { username: "User", currencySymbol: "₹" };
    const symbol = user?.currencySymbol || "₹";

    // Fetch history
    const snap = await adminDb
      .collection("portfolios").doc(uid)
      .collection("history").get();

    const rows: any[] = [];
    snap.forEach(doc => rows.push({ id: doc.id, ...doc.data() }));
    rows.sort((a, b) => b.createdAt?.localeCompare?.(a.createdAt) || 0);

    if (format === "csv") {
      const headers = ["Month", "Income", "Recurring Costs", "Leisure", "Savings", "Emergency Fund", "Investments", "Guru Score", "Savings Rate %"];
      const csvRows = rows.map(r => {
        const savingsRate = r.income > 0 ? Math.round((r.savings / r.income) * 100) : 0;
        return [
          r.month || "", r.income || 0, r.recurring || 0, r.leisure || 0,
          r.savings || 0, r.emergency || 0, r.investment || 0,
          r.score || 0, savingsRate,
        ].join(",");
      });

      const csv = [
        `MoneyGuru Financial History - ${user?.username || "User"}`,
        `Exported on: ${new Date().toLocaleDateString()}`,
        `Currency: ${symbol}`,
        "",
        headers.join(","),
        ...csvRows,
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="moneyguru-history-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      // Generate HTML that the browser will receive and can print to PDF
      const totalIncome = rows.reduce((s, r) => s + (r.income || 0), 0);
      const avgScore = rows.length > 0 ? (rows.reduce((s, r) => s + (r.score || 0), 0) / rows.length).toFixed(1) : "—";
      const bestMonth = rows.reduce((best, r) => (!best || r.score > best.score) ? r : best, null);

      const rowsHtml = rows.map((r, i) => {
        const savingsRate = r.income > 0 ? Math.round((r.savings / r.income) * 100) : 0;
        const scoreColor = r.score >= 8 ? "#22C55E" : r.score >= 5 ? "#C9A84C" : "#EF4444";
        return `
          <tr style="background: ${i % 2 === 0 ? "#0E1219" : "#141924"}">
            <td>${r.month || "—"}</td>
            <td>${symbol}${(r.income||0).toLocaleString()}</td>
            <td>${symbol}${(r.recurring||0).toLocaleString()}</td>
            <td>${symbol}${(r.leisure||0).toLocaleString()}</td>
            <td>${symbol}${(r.savings||0).toLocaleString()}</td>
            <td>${symbol}${(r.emergency||0).toLocaleString()}</td>
            <td>${symbol}${(r.investment||0).toLocaleString()}</td>
            <td>${savingsRate}%</td>
            <td style="color: ${scoreColor}; font-weight: 600; font-size: 18px">${r.score || 0}</td>
          </tr>`;
      }).join("");

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MoneyGuru Report - ${user?.username}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080B0F; color: #EEF0F4; font-family: 'DM Sans', sans-serif; font-weight: 300; padding: 48px; }
    .serif { font-family: 'DM Serif Display', serif; }
    .gold { color: #C9A84C; }
    header { border-bottom: 1px solid rgba(201,168,76,0.2); padding-bottom: 32px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { font-size: 48px; letter-spacing: -0.02em; line-height: 1.1; }
    .label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 4px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: rgba(255,255,255,0.04); border-radius: 16px; overflow: hidden; margin-bottom: 40px; }
    .stat { background: #0E1219; padding: 24px; }
    .stat-value { font-size: 32px; font-weight: 500; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(201,168,76,0.15); display: flex; justify-content: space-between; font-size: 12px; color: #374151; }
    @media print {
      body { background: white; color: #111; padding: 24px; }
      .stat { background: #f9f9f9; }
      table tr { background: white !important; }
      tr:nth-child(even) td { background: #f5f5f5; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <p class="label gold">MoneyGuru</p>
      <h1 class="serif">Financial Report</h1>
      <p style="color:#6B7280; margin-top: 8px; font-weight: 300">${user?.username || "User"} · Exported ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
    <div style="text-align: right">
      <p class="label">Currency</p>
      <p style="font-size: 24px; font-weight: 500">${symbol}</p>
    </div>
  </header>

  <div class="stats">
    <div class="stat">
      <p class="label">Total Months Tracked</p>
      <p class="stat-value serif gold">${rows.length}</p>
    </div>
    <div class="stat">
      <p class="label">Average Guru Score</p>
      <p class="stat-value serif gold">${avgScore}</p>
    </div>
    <div class="stat">
      <p class="label">Best Month</p>
      <p class="stat-value serif gold">${bestMonth?.month || "—"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Month</th><th>Income</th><th>Recurring</th><th>Leisure</th>
        <th>Savings</th><th>Emergency</th><th>Investments</th><th>Savings %</th><th>Score</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="footer">
    <span>MoneyGuru — Financial Discipline Tracker</span>
    <span>Generated ${new Date().toISOString().slice(0,10)}</span>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
