import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = getServiceClient();
  const { data: guests } = await client.from("guests").select("*").order("created_at", { ascending: false });
  const { data: responses } = await client.from("rsvp_responses").select("*");

  return NextResponse.json({ guests, responses });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const client = getServiceClient();

  const { data, error } = await client
    .from("guests")
    .insert({
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      guest_type: body.guest_type,
      max_companions: body.max_companions ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al crear invitado" }, { status: 500 });
  }

  return NextResponse.json({ guest: data });
}
