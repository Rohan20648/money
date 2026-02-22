import { NextResponse } from "next/server";
import { users, portfolios } from "@/lib/store";

export async function POST(req: Request) {
  const { username, portfolio } = await req.json();

  // Check if user exists
  if (!users.has(username)) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Save / update portfolio
  portfolios.set(username, portfolio);

  return NextResponse.json({
    success: true,
    portfolio: portfolios.get(username),
  });
}
