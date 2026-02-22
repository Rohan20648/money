import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password, userType } = await req.json();

  // For now just fake-success (you will replace with DB later)

  return NextResponse.json({
    username,
    userType,
    message: "User registered successfully",
  });
}
