import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, monthId } = await req.json();

    if (!uid || !monthId) {
      return NextResponse.json({ error: "Missing uid or monthId" }, { status: 400 });
    }

    // Delete from history subcollection
    await adminDb
      .collection("portfolios")
      .doc(uid)
      .collection("history")
      .doc(monthId)
      .delete();

    // Check if there are remaining entries — if so, update main doc with latest
    const remaining = await adminDb
      .collection("portfolios")
      .doc(uid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!remaining.empty) {
      const latest = remaining.docs[0].data();
      await adminDb
        .collection("portfolios")
        .doc(uid)
        .set(latest, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE MONTH ERROR:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
