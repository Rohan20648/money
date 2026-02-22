import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });
    }

    // ✅ get user profile
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const user = userDoc.exists ? userDoc.data() : null;

    // ✅ get monthly history
    const snap = await adminDb
      .collection("portfolios")
      .doc(uid)
      .collection("history")
      .get();

    const history: any[] = [];

    snap.forEach((doc) => {
      history.push({
        id: doc.id,      // 🔥 IMPORTANT FIX
        ...doc.data(),
      });
    });

    history.sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({
      user,
      history,
    });

  } catch (err) {
    console.error("HISTORY API ERROR:", err);

    return NextResponse.json({
      user: null,
      history: [],
    });
  }
}
