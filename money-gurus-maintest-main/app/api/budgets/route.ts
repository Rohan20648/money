import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, action, budgets, month, actuals } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    if (action === "save-budgets") {
      // Save category budget targets
      await adminDb.collection("budgets").doc(uid).set({ budgets, updatedAt: new Date().toISOString() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    if (action === "save-actuals") {
      // Save actual spending for a month
      await adminDb.collection("budgets").doc(uid)
        .collection("actuals").doc(month)
        .set({ actuals, month, updatedAt: new Date().toISOString() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    if (action === "get") {
      // Fetch budgets and optionally actuals for a month
      const budgetSnap = await adminDb.collection("budgets").doc(uid).get();
      const budgetData = budgetSnap.exists ? budgetSnap.data() : { budgets: [] };

      let actualsData = null;
      if (month) {
        const actualsSnap = await adminDb.collection("budgets").doc(uid)
          .collection("actuals").doc(month).get();
        actualsData = actualsSnap.exists ? actualsSnap.data()?.actuals : null;
      }

      return NextResponse.json({ budgets: budgetData?.budgets || [], actuals: actualsData });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("BUDGETS API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
