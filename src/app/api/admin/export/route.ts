import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = getServiceClient();
  const { data: guests } = await client.from("guests").select("*");
  const { data: responses } = await client.from("rsvp_responses").select("*");

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const header = ["Nombre", "Email", "Teléfono", "Tipo", "Max Acompañantes", "Estado", "Asistentes Confirmados", "Menús", "Alergias", "Mensaje", "Link RSVP", "Fecha Respuesta"];

  const rows = (guests ?? []).map((g) => {
    const resp = (responses ?? []).find((r) => r.guest_id === g.id);
    const members = resp?.members ?? [];
    return [
      g.name,
      g.email ?? "",
      g.phone ?? "",
      g.guest_type,
      g.max_companions,
      g.status,
      resp ? (resp.attending ? members.length : "No asiste") : "Sin respuesta",
      members.map((m: { menu_preference?: string; name?: string }) => `${m.name}: ${m.menu_preference || "Sin pref"}`).join(" | "),
      members.filter((m: { allergies?: string }) => m.allergies).map((m: { allergies?: string; name?: string }) => `${m.name}: ${m.allergies}`).join(" | "),
      resp?.message ?? "",
      `${base}/rsvp/${g.token}`,
      resp?.submitted_at ? new Date(resp.submitted_at).toLocaleDateString("es-MX") : "",
    ];
  });

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados-boda.csv"`,
    },
  });
}
