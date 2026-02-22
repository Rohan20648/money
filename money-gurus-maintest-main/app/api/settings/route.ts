import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const CURRENCIES = [
  { code: "INR", symbol: "₹",    label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$",    label: "US Dollar ($)" },
  { code: "EUR", symbol: "€",    label: "Euro (€)" },
  { code: "GBP", symbol: "£",    label: "British Pound (£)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
  { code: "SGD", symbol: "S$",   label: "Singapore Dollar (S$)" },
  { code: "AUD", symbol: "A$",   label: "Australian Dollar (A$)" },
  { code: "CAD", symbol: "C$",   label: "Canadian Dollar (C$)" },
];

export async function POST(req: Request) {
  try {
    const { uid, username, phone, currency } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const sel = CURRENCIES.find(c => c.code === currency);
    const updates: any = { updatedAt: new Date().toISOString() };
    if (username) updates.username = username;
    if (phone)    updates.phone    = phone;
    if (sel) {
      updates.currency       = sel.code;
      updates.currencySymbol = sel.symbol;
    }

    await adminDb.collection("users").doc(uid).update(updates);
    return NextResponse.json({ success: true, currencySymbol: sel?.symbol });
  } catch (err) {
    console.error("SETTINGS ERROR:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
