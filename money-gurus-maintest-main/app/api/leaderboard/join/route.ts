import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, username, groupCode } = await req.json();
    if (!uid || !username || !groupCode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const code = groupCode.toUpperCase().trim();

    // Get user's latest score from their main portfolio doc
    const portfolioSnap = await adminDb.collection("portfolios").doc(uid).get();
    const score = portfolioSnap.exists ? (portfolioSnap.data()?.score || 0) : 0;

    await adminDb
      .collection("leaderboards").doc(code)
      .collection("members").doc(uid)
      .set({ username, score, joinedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ success: true, code });
  } catch (err) {
    console.error("LEADERBOARD JOIN ERROR:", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
