import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, attending, attendee_count, allergies, events, accommodation, message } = body;

  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const client = getServiceClient();

  // Buscar al invitado por token
  const { data: guest, error: guestError } = await client
    .from("guests").select("*").eq("token", token).single();

  if (guestError || !guest)
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });

  // Verificar que no haya respondido ya
  const { data: existing } = await client
    .from("rsvp_responses").select("id").eq("guest_id", guest.id).single();

  if (existing)
    return NextResponse.json({ error: "Ya se registró una respuesta para esta invitación" }, { status: 409 });

  // Insertar respuesta
  const { error: insertError } = await client.from("rsvp_responses").insert({
    guest_id: guest.id,
    attending,
    attendee_count: attending ? (attendee_count ?? 1) : 0,
    allergies: attending ? (allergies ?? "") : "",
    events: attending ? (events ?? []) : [],
    accommodation: attending ? (accommodation ?? "none") : "none",
    message: message || null,
  });

  if (insertError)
    return NextResponse.json({ error: "Error al guardar respuesta" }, { status: 500 });

  // Actualizar status del invitado (service role — sin restricciones RLS)
  await client.from("guests")
    .update({ status: attending ? "confirmed" : "declined" })
    .eq("id", guest.id);

  return NextResponse.json({ success: true });
}
