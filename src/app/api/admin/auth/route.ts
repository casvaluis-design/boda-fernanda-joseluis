import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.ADMIN_PASSWORD || "boda2025admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === PASSWORD) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false }, { status: 401 });
}
