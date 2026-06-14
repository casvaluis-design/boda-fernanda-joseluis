import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// Resetear RSVP — borra la respuesta y pone status en pending
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ guestId: string }> }) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { guestId } = await params;
  const client = getServiceClient();
  await client.from("rsvp_responses").delete().eq("guest_id", guestId);
  await client.from("guests").update({ status: "pending" }).eq("id", guestId);
  return NextResponse.json({ success: true });
}

// Editar RSVP — actualiza la respuesta existente
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ guestId: string }> }) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { guestId } = await params;
  const body = await request.json();
  const client = getServiceClient();
  const { error } = await client
    .from("rsvp_responses")
    .update(body)
    .eq("guest_id", guestId);
  if (error) return NextResponse.json({ error: "Error al actualizar RSVP" }, { status: 500 });
  // Sincronizar status del guest
  if (body.attending !== undefined) {
    await client.from("guests").update({ status: body.attending ? "confirmed" : "declined" }).eq("id", guestId);
  }
  return NextResponse.json({ success: true });
}
