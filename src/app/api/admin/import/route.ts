import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest) {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function parseCompanions(value: string): number {
  const clean = String(value ?? "").trim().replace(/\+/g, "");
  const n = parseInt(clean);
  if (isNaN(n) || n < 0) return 0;
  if (n > 5) return 5;
  return n;
}

function parseGuestType(companions: number) {
  if (companions === 0) return "individual";
  if (companions === 1) return "couple";
  return "family";
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { rows } = body as { rows: Record<string, string>[] };

  if (!rows || !Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: "No se recibieron filas" }, { status: 400 });

  const client = getServiceClient();
  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    const name = (row["Nombre"] ?? row["nombre"] ?? "").trim();
    if (!name) { results.skipped++; continue; }

    const phone    = (row["Telefono"] ?? row["Teléfono"] ?? row["telefono"] ?? "").trim();
    const email    = (row["Email"] ?? row["email"] ?? "").trim();
    const compRaw  = row["Lugares"] ?? row["lugares"] ?? row["+"] ?? "0";
    const hotelRaw = (row["Hotel Alma"] ?? row["hotel_alma"] ?? row["Hotel"] ?? "").trim().toUpperCase();
    const notes    = (row["Notas"] ?? row["notas"] ?? "").trim();

    const max_companions  = parseCompanions(compRaw);
    const guest_type      = parseGuestType(max_companions);
    const hotel_assignment = (hotelRaw === "SI" || hotelRaw === "SÍ" || hotelRaw === "1" || hotelRaw === "YES") ? "hotel_alma" : "none";

    const { error } = await client.from("guests").insert({
      name,
      phone:            phone || null,
      email:            email || null,
      guest_type,
      max_companions,
      hotel_assignment,
      notes:            notes || "",
    });

    if (error) {
      results.errors.push(`${name}: ${error.message}`);
    } else {
      results.created++;
    }
  }

  return NextResponse.json(results);
}
