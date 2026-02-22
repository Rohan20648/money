import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { groupCode, uid } = await req.json();
    if (!groupCode) return NextResponse.json({ error: "Missing group code" }, { status: 400 });

    const code = groupCode.toUpperCase().trim();

    // Sync calling user's latest score before returning results
    if (uid) {
      const [portfolioSnap, userSnap] = await Promise.all([
        adminDb.collection("portfolios").doc(uid).get(),
        adminDb.collection("users").doc(uid).get(),
      ]);
      if (portfolioSnap.exists) {
        const score = portfolioSnap.data()?.score || 0;
        const username = userSnap.exists ? userSnap.data()?.username : "User";
        await adminDb
          .collection("leaderboards").doc(code)
          .collection("members").doc(uid)
          .set({ username, score, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }

    const snap = await adminDb
      .collection("leaderboards").doc(code)
      .collection("members").get();

    const members: any[] = [];
    snap.forEach(doc => members.push({ id: doc.id, ...doc.data() }));
    members.sort((a, b) => b.score - a.score);

    return NextResponse.json({ members, code });
  } catch (err) {
    console.error("LEADERBOARD SCORES ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
