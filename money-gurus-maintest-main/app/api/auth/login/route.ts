import { NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function POST(req: Request) {
  const { username, userType } = await req.json();

  if (!users.has(username)) {
    users.set(username, {
      username,
      userType,
    });
  }

  return NextResponse.json({
    success: true,
    user: users.get(username),
  });
}

