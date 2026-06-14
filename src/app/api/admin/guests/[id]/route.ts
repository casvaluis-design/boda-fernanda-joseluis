import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const { error } = await getServiceClient().from("guests").update(body).eq("id", id);
  if (error) return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  // Cascade borra también el rsvp_response por FK
  const { error } = await getServiceClient().from("guests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  return NextResponse.json({ success: true });
}
