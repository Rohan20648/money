import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, monthId } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    let portfolioData: any = null;

    // Try to load a specific history month if monthId is provided
    if (monthId) {
      const histSnap = await adminDb
        .collection("portfolios")
        .doc(uid)
        .collection("history")
        .doc(monthId)
        .get();

      if (histSnap.exists) {
        portfolioData = histSnap.data();
        console.log("Loaded history doc:", monthId);
      } else {
        console.log("History doc not found for monthId:", monthId);
      }
    }

    // Fallback: load the latest portfolio doc
    if (!portfolioData) {
      const latestSnap = await adminDb
        .collection("portfolios")
        .doc(uid)
        .get();

      if (latestSnap.exists) {
        portfolioData = latestSnap.data();
        console.log("Loaded latest portfolio doc");
      }
    }

    if (!portfolioData) {
      return NextResponse.json({ error: "No portfolio found" }, { status: 404 });
    }

    return NextResponse.json({ portfolio: portfolioData });

  } catch (err) {
    console.error("PORTFOLIO FETCH ERROR:", err);
    return NextResponse.json(
      { error: "Server error: " + String(err) },
      { status: 500 }
    );
  }
}
