import { NextResponse } from "next/server";
import { users, portfolios } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Check user
  if (!users.has(username)) {
    return NextResponse.json({}, { status: 404 });
  }

  // Get portfolio
  const portfolio = portfolios.get(username);

  if (!portfolio) {
    return NextResponse.json({}, { status: 404 });
  }

  return NextResponse.json(portfolio);
}

