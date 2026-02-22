import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      uid,
      income,
      recurring,
      leisure,
      savings,
      emergency,
      investment,
      score,
      advice,
    } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });
    }

    // Use timestamp-based unique ID so multiple entries per month are possible
    const now = new Date();
    const monthLabel = now.toISOString().slice(0, 7); // e.g. "2026-02"
    const timestamp = now.getTime(); // unique number
    const monthId = `${monthLabel}-${timestamp}`; // e.g. "2026-02-1740154321000"

    const data = {
      income,
      recurring,
      leisure,
      savings,
      emergency,
      investment,
      score,
      advice: advice || [],
      month: monthLabel,  // human-readable label stays clean
      createdAt: now.toISOString(),
    };

    // Save to history subcollection with unique ID
    await adminDb
      .collection("portfolios")
      .doc(uid)
      .collection("history")
      .doc(monthId)
      .set(data);

    // Also update the main portfolio doc so portfolio page shows latest data
    await adminDb
      .collection("portfolios")
      .doc(uid)
      .set(data, { merge: true });

    return NextResponse.json({ success: true, monthId });

  } catch (err) {
    console.error("NEW MONTH API ERROR:", err);
    return NextResponse.json({ error: "Failed to save month" }, { status: 500 });
  }
}
