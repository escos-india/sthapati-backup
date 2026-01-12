import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { message: "Manual authentication is currently disabled" },
    { status: 410 }
  );
}

