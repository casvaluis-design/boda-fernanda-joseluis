"use client";

import { useEffect, useState, useCallback } from "react";
import { type Guest, type RSVPResponse, type EventKey, EVENTS } from "@/lib/supabase";
import {
  CheckCircle, Clock, XCircle, Users, Download, RefreshCw,
  Plus, AlertTriangle, Copy, Check, Hotel, Pencil, Trash2,
  RotateCcw, FileEdit, X, StickyNote, Upload, FileDown,
} from "lucide-react";

interface GuestWithResponse extends Guest { rsvp?: RSVPResponse }
type FilterStatus = "all" | "confirmed" | "declined" | "pending";

// ─── Small components ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="border p-4 flex items-center gap-3" style={{ borderColor: "rgba(27,75,138,0.2)", background: "white" }}>
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-playfair)", color: "var(--text-dark)" }}>{value}</p>
        <p className="text-xs uppercase" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>{label}</p>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      title="Copiar link" className="p-1.5 rounded hover:bg-gray-100 transition-colors"
      style={{ color: copied ? "var(--talavera-blue-light)" : "var(--talavera-blue)" }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function WABtn({ phone, name, link }: { phone?: string; name: string; link: string }) {
  if (!phone) return <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sin tel.</span>;
  const msg = encodeURIComponent(`Hola ${name},\n\nFernanda y Jose Luis te invitan a confirmar tu asistencia a su boda.\n\nConfirma aqui: ${link}`);
  return (
    <a href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-opacity hover:opacity-75"
      style={{ background: "#25D366", color: "white", fontFamily: "var(--font-jost)", whiteSpace: "nowrap" }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      WhatsApp
    </a>
  );
}

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white border w-full max-w-md my-auto" style={{ borderColor: "rgba(27,75,138,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(27,75,138,0.1)" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.2rem", color: "var(--talavera-blue)" }}>{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [authError, setAuthError] = useState("");


  const [guests, setGuests] = useState<GuestWithResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [eventFilter, setEventFilter] = useState<EventKey | "all">("all");
  const [hospFilter, setHospFilter] = useState<"all" | "casa_begonias" | "otro" | "none">("all");
  const [search, setSearch] = useState("");

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [editGuest, setEditGuest] = useState<GuestWithResponse | null>(null);
  const [deleteGuest, setDeleteGuest] = useState<GuestWithResponse | null>(null);
  const [editRsvp, setEditRsvp] = useState<GuestWithResponse | null>(null);
  const [resetRsvp, setResetRsvp] = useState<GuestWithResponse | null>(null);

  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "", guest_type: "individual", max_companions: 0 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data
  const loadData = useCallback(async (pw: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/guests", { headers: { "x-admin-password": pw } });
    if (!res.ok) { setLoading(false); return; }
    const { guests: gData, responses } = await res.json();
    if (gData) setGuests(gData.map((g: Guest) => ({ ...g, rsvp: responses?.find((r: RSVPResponse) => r.guest_id === g.id) })));
    setLoading(false);
  }, []);

  // Restaurar sesión desde sessionStorage al cargar
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (!saved) return;
    fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: saved }),
    }).then((res) => {
      if (res.ok) { setAdminPw(saved); setAuthed(true); loadData(saved); }
      else sessionStorage.removeItem("admin_pw");
    });
  }, [loadData]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { sessionStorage.setItem("admin_pw", password); setAdminPw(password); setAuthed(true); loadData(password); }
    else setAuthError("Contraseña incorrecta.");
  }

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault(); setAdding(true);
    await fetch("/api/admin/guests", {
      method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify(newGuest),
    });
    await loadData(adminPw);
    setShowAdd(false); setNewGuest({ name: "", email: "", phone: "", guest_type: "individual", max_companions: 0 }); setAdding(false);
  }

  async function handleEditGuest(e: React.FormEvent) {
    e.preventDefault(); if (!editGuest) return; setSaving(true);
    await fetch(`/api/admin/guests/${editGuest.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ name: editGuest.name, phone: editGuest.phone, email: editGuest.email, guest_type: editGuest.guest_type, max_companions: editGuest.max_companions, notes: editGuest.notes }),
    });
    await loadData(adminPw); setEditGuest(null); setSaving(false);
  }

  async function handleDeleteGuest() {
    if (!deleteGuest) return; setSaving(true);
    await fetch(`/api/admin/guests/${deleteGuest.id}`, { method: "DELETE", headers: { "x-admin-password": adminPw } });
    await loadData(adminPw); setDeleteGuest(null); setSaving(false);
  }

  async function handleResetRsvp() {
    if (!resetRsvp) return; setSaving(true);
    await fetch(`/api/admin/rsvp/${resetRsvp.id}`, { method: "DELETE", headers: { "x-admin-password": adminPw } });
    await loadData(adminPw); setResetRsvp(null); setSaving(false);
  }

  async function handleEditRsvp(e: React.FormEvent) {
    e.preventDefault(); if (!editRsvp?.rsvp) return; setSaving(true);
    await fetch(`/api/admin/rsvp/${editRsvp.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ attending: editRsvp.rsvp.attending, attendee_count: editRsvp.rsvp.attendee_count, events: editRsvp.rsvp.events, accommodation: editRsvp.rsvp.accommodation, allergies: editRsvp.rsvp.allergies, message: editRsvp.rsvp.message }),
    });
    await loadData(adminPw); setEditRsvp(null); setSaving(false);
  }

  async function toggleHotelAlma(guestId: string, current: string) {
    const next = current === "hotel_alma" ? "none" : "hotel_alma";
    setGuests((prev) => prev.map((g) => g.id === guestId ? { ...g, hotel_assignment: next as Guest["hotel_assignment"] } : g));
    await fetch(`/api/admin/guests/${guestId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ hotel_assignment: next }),
    });
  }

  function downloadTemplate() {
    const header = ["Nombre", "Telefono", "Email", "Lugares", "Hotel Alma", "Notas"];
    const examples = [
      ["María González", "5211234567", "maria@ejemplo.com", "0", "NO", ""],
      ["Carlos y Ana López", "5219876543", "", "+1", "NO", "Amigos de la universidad"],
      ["Familia Martínez", "5215554433", "", "+3", "SI", "Tíos de Fernanda"],
    ];
    const csv = [header, ...examples].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla-invitados.csv"; a.click(); URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    setImporting(true); setImportResult(null);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) { setImporting(false); return; }

    // Parse CSV (maneja comillas)
    function parseCSVLine(line: string): string[] {
      const result: string[] = [];
      let current = ""; let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; }
        else if (line[i] === "," && !inQuotes) { result.push(current.trim()); current = ""; }
        else { current += line[i]; }
      }
      result.push(current.trim());
      return result;
    }

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h.replace(/^﻿/, "").trim()] = (values[i] ?? "").replace(/^"|"$/g, ""); });
      return obj;
    }).filter((r) => Object.values(r).some((v) => v));

    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ rows }),
    });
    const result = await res.json();
    setImportResult(result);
    await loadData(adminPw);
    setImporting(false);
  }

  function exportCSV() {
    const base = window.location.origin;
    const header = ["Nombre", "Teléfono", "Tipo", "Estado", "Asistentes", "Eventos", "Hospedaje (invitado)", "Hotel Alma (interno)", "Alergias", "Mensaje", "Notas internas", "Link RSVP"];
    const rows = guests.map((g) => {
      const evLabels = (g.rsvp?.events ?? []).map((k) => EVENTS.find((e) => e.key === k)?.label ?? k).join(" | ");
      const hosped = g.rsvp?.accommodation === "casa_begonias" ? "Casa Begonias" : g.rsvp?.accommodation === "otro" ? "Otro" : "";
      return [g.name, g.phone ?? "", g.guest_type, g.status,
        g.rsvp ? (g.rsvp.attending ? g.rsvp.attendee_count : "No asiste") : "Sin respuesta",
        evLabels, hosped, g.hotel_assignment === "hotel_alma" ? "Hotel Alma" : "",
        g.rsvp?.allergies ?? "", g.rsvp?.message ?? "", g.notes ?? "", `${base}/rsvp/${g.token}`];
    });
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `invitados-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm px-8 py-12 bg-white border" style={{ borderColor: "rgba(27,75,138,0.2)" }}>
        <h1 className="text-center mb-2" style={{ fontFamily: "var(--font-playfair)", fontSize: "1.6rem", color: "var(--talavera-blue)" }}>Panel Admin</h1>
        <p className="text-center text-xs uppercase mb-6" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.2em" }}>Fernanda &amp; Jose Luis · 2026</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 outline-none text-sm" style={{ fontFamily: "var(--font-jost)" }} />
          {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
          <button type="submit" className="w-full py-3 text-sm uppercase"
            style={{ background: "var(--talavera-blue)", color: "#FAF6F0", fontFamily: "var(--font-jost)", letterSpacing: "0.2em" }}>Entrar</button>
        </form>
      </div>
    </div>
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const confirmed  = guests.filter((g) => g.status === "confirmed");
  const declined   = guests.filter((g) => g.status === "declined");
  const pending    = guests.filter((g) => g.status === "pending");
  // Total personas esperadas = suma de (max_companions + 1) de todos los grupos
  const totalPersonasEsperadas = guests.reduce((a, g) => a + (g.max_companions ?? 0) + 1, 0);
  // Grupos = número de registros
  const totalGrupos = guests.length;
  // Personas confirmadas/declinadas = suma del attendee_count reportado en el RSVP
  const personasConfirmadas = confirmed.reduce((a, g) => a + (g.rsvp?.attendee_count ?? 0), 0);
  const personasDeclinadas  = declined.reduce((a, g) => a + (g.rsvp?.attendee_count ?? (g.max_companions ?? 0) + 1), 0);
  const totalPeople = personasConfirmadas;
  const eventCounts = EVENTS.map((ev) => ({
    ...ev,
    count: confirmed.filter((g) => g.rsvp?.events?.includes(ev.key)).length,
    people: confirmed.filter((g) => g.rsvp?.events?.includes(ev.key)).reduce((a, g) => a + (g.rsvp?.attendee_count ?? 0), 0),
  }));
  const hospBegonias = confirmed.filter((g) => g.rsvp?.accommodation === "casa_begonias").length;
  const hospOtro     = confirmed.filter((g) => g.rsvp?.accommodation === "otro").length;
  const hospAlma     = guests.filter((g) => g.hotel_assignment === "hotel_alma").length;
  const allergies    = confirmed.filter((g) => g.rsvp?.allergies).map((g) => ({ guest: g.name, allergy: g.rsvp!.allergies }));

  const filtered = guests.filter((g) => {
    const st = filter === "all" || g.status === filter;
    const sr = g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone?.includes(search) ?? false);
    const ev = eventFilter === "all" || (g.rsvp?.events ?? []).includes(eventFilter as EventKey);
    const ho = hospFilter === "all" || (hospFilter === "none" ? !g.rsvp?.accommodation || g.rsvp.accommodation === "none" : g.rsvp?.accommodation === hospFilter);
    return st && sr && ev && ho;
  });

  const statusColor = { confirmed: "var(--talavera-blue-light)", declined: "var(--talavera-cobalt)", pending: "var(--talavera-blue-light)" };
  const statusLabel = { confirmed: "Confirmado", declined: "Declinado", pending: "Pendiente" };
  const base = typeof window !== "undefined" ? window.location.origin : "";

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#F5F5F0" }}>

      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "rgba(27,75,138,0.15)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.4rem", color: "var(--talavera-blue)" }}>Panel de Invitados</h1>
          <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>Fernanda &amp; Jose Luis · Oct 2026</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setRefreshing(true); loadData(adminPw).then(() => setRefreshing(false)); }}
            className="px-3 py-2 border text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            style={{ borderColor: "rgba(27,75,138,0.3)", color: "var(--talavera-blue)", fontFamily: "var(--font-jost)" }}>
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={exportCSV} className="px-3 py-2 border text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            style={{ borderColor: "rgba(27,75,138,0.3)", color: "var(--talavera-blue)", fontFamily: "var(--font-jost)" }}>
            <Download size={12} /> Exportar CSV
          </button>
          <button onClick={() => setShowImport(true)} className="px-3 py-2 border text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            style={{ borderColor: "rgba(27,75,138,0.3)", color: "var(--talavera-blue)", fontFamily: "var(--font-jost)" }}>
            <Upload size={12} /> Importar CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 text-xs flex items-center gap-1.5 hover:opacity-80"
            style={{ background: "var(--talavera-blue)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>
            <Plus size={12} /> Agregar invitado
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total personas esperadas" value={totalPersonasEsperadas} icon={<Users size={20} />}       color="var(--talavera-blue)" />
          <StatCard label="Grupos / Familias"        value={totalGrupos}            icon={<Users size={20} />}       color="var(--talavera-blue)" />
          <StatCard label="Personas confirmadas"     value={personasConfirmadas}    icon={<CheckCircle size={20} />} color="var(--talavera-blue-light)" />
          <StatCard label="Personas declinadas"      value={personasDeclinadas}     icon={<XCircle size={20} />}     color="var(--talavera-cobalt)" />
          <StatCard label="Grupos sin respuesta"     value={pending.length}         icon={<Clock size={20} />}       color="var(--talavera-blue-light)" />
        </div>

        {/* Personas + Eventos + Hospedaje */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border p-5" style={{ borderColor: "rgba(27,75,138,0.2)" }}>
            <p className="text-xs uppercase mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.15em" }}>Total personas confirmadas</p>
            <p style={{ fontFamily: "var(--font-playfair)", fontSize: "2.8rem", color: "var(--text-dark)", lineHeight: 1 }}>{totalPeople}</p>
          </div>
          <div className="bg-white border p-5" style={{ borderColor: "rgba(27,75,138,0.2)" }}>
            <p className="text-xs uppercase mb-3" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.15em" }}>Asistentes por evento</p>
            <div className="space-y-2">
              {eventCounts.map((ev) => (
                <div key={ev.key} className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>{ev.label}</span>
                  <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>
                    {ev.people} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({ev.count})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border p-5" style={{ borderColor: "rgba(27,75,138,0.2)" }}>
            <p className="text-xs uppercase mb-3" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.15em" }}>Hospedaje</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>Casa Begonias</span>
                <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>{hospBegonias}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>Otro lugar</span>
                <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>{hospOtro}</span>
              </div>
              <div className="flex items-center justify-between pt-2 mt-1 border-t" style={{ borderColor: "rgba(27,75,138,0.1)" }}>
                <span className="text-sm flex items-center gap-1.5" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)" }}>
                  <Hotel size={13} /> Hotel Alma
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(27,75,138,0.08)", color: "var(--talavera-blue)", fontSize: "0.65rem" }}>INTERNO</span>
                </span>
                <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)" }}>{hospAlma}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alergias */}
        {allergies.length > 0 && (
          <div className="bg-white border p-5" style={{ borderColor: "rgba(201,168,76,0.4)" }}>
            <p className="text-xs uppercase mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue-light)", letterSpacing: "0.15em" }}>
              <AlertTriangle size={13} /> Alergias y restricciones
            </p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span key={i} className="text-xs px-2.5 py-1 border"
                  style={{ fontFamily: "var(--font-jost)", borderColor: "rgba(196,98,45,0.3)", color: "var(--talavera-cobalt)" }}>
                  <strong>{a.guest}</strong>: {a.allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Buscar nombre o teléfono..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 bg-white text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <div className="flex gap-2 flex-wrap">
              {(["all", "confirmed", "declined", "pending"] as FilterStatus[]).map((s) => (
                <button key={s} onClick={() => setFilter(s)} className="px-3 py-2 text-xs uppercase border transition-colors"
                  style={{ fontFamily: "var(--font-jost)", letterSpacing: "0.1em", background: filter === s ? "var(--talavera-blue)" : "white", color: filter === s ? "#FAF6F0" : "var(--text-muted)", borderColor: filter === s ? "var(--talavera-blue)" : "rgba(0,0,0,0.1)" }}>
                  {s === "all" ? "Todos" : s === "confirmed" ? "Confirmados" : s === "declined" ? "Declinados" : "Pendientes"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs uppercase" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.15em" }}>Evento:</span>
            {([{ key: "all", label: "Todos" }, ...EVENTS.map((e) => ({ key: e.key, label: e.label }))] as { key: EventKey | "all"; label: string }[]).map((ev) => (
              <button key={ev.key} onClick={() => setEventFilter(ev.key)} className="px-3 py-1.5 text-xs border transition-colors"
                style={{ fontFamily: "var(--font-jost)", background: eventFilter === ev.key ? "var(--talavera-blue-light)" : "white", color: eventFilter === ev.key ? "#FAF6F0" : "var(--text-muted)", borderColor: eventFilter === ev.key ? "var(--talavera-blue-light)" : "rgba(0,0,0,0.1)" }}>
                {ev.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs uppercase" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.15em" }}>Hospedaje:</span>
            {([
              { key: "all", label: "Todos" },
              { key: "casa_begonias", label: "Casa Begonias" },
              { key: "otro", label: "Otro lugar" },
              { key: "none", label: "Sin selección" },
            ] as { key: "all" | "casa_begonias" | "otro" | "none"; label: string }[]).map((h) => (
              <button key={h.key} onClick={() => setHospFilter(h.key)} className="px-3 py-1.5 text-xs border transition-colors"
                style={{ fontFamily: "var(--font-jost)", background: hospFilter === h.key ? "var(--talavera-blue)" : "white", color: hospFilter === h.key ? "#FAF6F0" : "var(--text-muted)", borderColor: hospFilter === h.key ? "var(--talavera-blue)" : "rgba(0,0,0,0.1)" }}>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border overflow-x-auto" style={{ borderColor: "rgba(27,75,138,0.2)" }}>
          {loading ? (
            <div className="p-10 text-center" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-muted)" }}>Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(27,75,138,0.1)", background: "rgba(27,75,138,0.03)" }}>
                  {["Nombre", "Tipo", "Estado", "Personas", "Eventos", "Hospedaje", "Hotel Alma", "Alergias", "Mensaje", "Notas", "Acciones"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs uppercase whitespace-nowrap"
                      style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => {
                  const evLabels = (g.rsvp?.events ?? []).map((k: EventKey) => EVENTS.find((e) => e.key === k)?.label ?? k).join(", ");
                  const link = `${base}/rsvp/${g.token}`;
                  const hosped = g.rsvp?.accommodation === "casa_begonias" ? "C. Begonias" : g.rsvp?.accommodation === "otro" ? "Otro" : "—";
                  return (
                    <tr key={g.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "white" : "rgba(0,0,0,0.01)" }}>
                      <td className="px-3 py-3 font-medium whitespace-nowrap" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>{g.name}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        {g.max_companions === 0 ? "Solo 1" : `+${g.max_companions} (${g.max_companions + 1} total)`}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ fontFamily: "var(--font-jost)", background: `${statusColor[g.status]}20`, color: statusColor[g.status] }}>
                          {statusLabel[g.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-center" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        {g.rsvp ? (g.rsvp.attending ? g.rsvp.attendee_count : "✗") : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs max-w-[160px]" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        <span className="truncate block">{evLabels || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>{hosped}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => toggleHotelAlma(g.id, g.hotel_assignment)}
                          className="flex items-center gap-1 px-2 py-1 text-xs border transition-all"
                          style={{ fontFamily: "var(--font-jost)", borderColor: g.hotel_assignment === "hotel_alma" ? "var(--talavera-blue)" : "rgba(0,0,0,0.12)", background: g.hotel_assignment === "hotel_alma" ? "var(--talavera-blue)" : "transparent", color: g.hotel_assignment === "hotel_alma" ? "#FAF6F0" : "var(--text-muted)" }}>
                          <Hotel size={11} />{g.hotel_assignment === "hotel_alma" ? "Alma" : "—"}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-xs max-w-[140px]" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-cobalt)" }}>
                        {g.rsvp?.allergies ? <span className="truncate flex items-center gap-1"><AlertTriangle size={11} />{g.rsvp.allergies}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td className="px-3 py-3 text-xs max-w-[180px]" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        {g.rsvp?.message ? <span className="truncate block" title={g.rsvp.message}>{g.rsvp.message}</span> : <span>—</span>}
                      </td>
                      <td className="px-3 py-3 text-xs max-w-[140px]" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        {g.notes ? <span className="truncate flex items-center gap-1"><StickyNote size={11} />{g.notes}</span> : <span>—</span>}
                      </td>
                      {/* Acciones */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <WABtn phone={g.phone} name={g.name} link={link} />
                          <CopyBtn text={link} />
                          <button onClick={() => setEditGuest({ ...g })} title="Editar invitado"
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--talavera-blue)" }}>
                            <Pencil size={13} />
                          </button>
                          {g.rsvp && (
                            <>
                              <button onClick={() => setEditRsvp({ ...g })} title="Editar RSVP"
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--talavera-blue-light)" }}>
                                <FileEdit size={13} />
                              </button>
                              <button onClick={() => setResetRsvp(g)} title="Resetear RSVP"
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--talavera-blue-light)" }}>
                                <RotateCcw size={13} />
                              </button>
                            </>
                          )}
                          <button onClick={() => setDeleteGuest(g)} title="Eliminar invitado"
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--talavera-cobalt)" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cormorant)" }}>No se encontraron invitados</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL: Importar CSV ── */}
      {showImport && (
        <ModalWrapper title="Importar invitados desde CSV" onClose={() => { setShowImport(false); setImportResult(null); }}>
          <div className="space-y-4">
            {/* Paso 1: descargar plantilla */}
            <div className="border rounded-sm p-4 space-y-2" style={{ borderColor: "rgba(27,75,138,0.15)", background: "rgba(27,75,138,0.02)" }}>
              <p className="text-xs uppercase font-medium" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.12em" }}>
                Paso 1 — Descarga la plantilla
              </p>
              <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                Llena la plantilla en Excel y guárdala como CSV (UTF-8).
              </p>
              <button onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-2 border text-xs transition-colors hover:bg-gray-50"
                style={{ fontFamily: "var(--font-jost)", borderColor: "rgba(27,75,138,0.3)", color: "var(--talavera-blue)" }}>
                <FileDown size={13} /> Descargar plantilla.csv
              </button>
              <div className="text-xs space-y-0.5 pt-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                <p><strong>Columnas:</strong> Nombre · Telefono · Email · Lugares · Hotel Alma · Notas</p>
                <p><strong>Lugares:</strong> 0 = solo 1 persona · +1 = 2 personas · +2 = 3… hasta +5</p>
                <p><strong>Hotel Alma:</strong> SI / NO</p>
              </div>
            </div>

            {/* Paso 2: subir archivo */}
            <div className="border rounded-sm p-4 space-y-2" style={{ borderColor: "rgba(27,75,138,0.15)", background: "rgba(27,75,138,0.02)" }}>
              <p className="text-xs uppercase font-medium" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.12em" }}>
                Paso 2 — Sube tu archivo CSV
              </p>
              <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed p-6 cursor-pointer transition-colors ${importing ? "opacity-50 pointer-events-none" : "hover:border-blue-300"}`}
                style={{ borderColor: "rgba(27,75,138,0.25)" }}>
                <Upload size={22} style={{ color: "var(--talavera-blue)" }} />
                <span className="text-xs text-center" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                  {importing ? "Importando..." : "Haz clic o arrastra tu archivo CSV aquí"}
                </span>
                <input type="file" accept=".csv" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
              </label>
            </div>

            {/* Resultado */}
            {importResult && (
              <div className="border p-4 space-y-2 rounded-sm"
                style={{ borderColor: importResult.errors.length ? "rgba(196,98,45,0.3)" : "rgba(45,125,79,0.3)", background: importResult.errors.length ? "rgba(196,98,45,0.04)" : "rgba(45,125,79,0.04)" }}>
                <p className="text-xs font-medium uppercase" style={{ fontFamily: "var(--font-jost)", color: importResult.errors.length ? "var(--talavera-cobalt)" : "var(--talavera-blue-light)", letterSpacing: "0.1em" }}>
                  Resultado
                </p>
                <p className="text-sm" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>
                  <strong>{importResult.created}</strong> invitados creados
                  {importResult.skipped > 0 && <span style={{ color: "var(--text-muted)" }}> · {importResult.skipped} omitidos</span>}
                </p>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {importResult.errors.map((e, i) => (
                      <p key={i} className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-cobalt)" }}>⚠ {e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => { setShowImport(false); setImportResult(null); }}
              className="w-full py-2.5 border text-xs uppercase"
              style={{ fontFamily: "var(--font-jost)", borderColor: "rgba(0,0,0,0.15)" }}>
              Cerrar
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── MODAL: Agregar invitado ── */}
      {showAdd && (
        <ModalWrapper title="Agregar invitado" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAddGuest} className="space-y-3">
            <input required type="text" placeholder="Nombre completo *" value={newGuest.name}
              onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <input type="tel" placeholder="Teléfono WhatsApp (521XXXXXXXXXX)" value={newGuest.phone}
              onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <input type="email" placeholder="Email (opcional)" value={newGuest.email}
              onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                Lugares reservados
              </label>
              <select
                value={newGuest.max_companions}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setNewGuest({ ...newGuest, max_companions: n, guest_type: n === 0 ? "individual" : n === 1 ? "couple" : "family" });
                }}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none bg-white" style={{ fontFamily: "var(--font-jost)" }}>
                <option value={0}>Solo 1 (sin acompañantes)</option>
                <option value={1}>+1 — 2 personas en total</option>
                <option value={2}>+2 — 3 personas en total</option>
                <option value={3}>+3 — 4 personas en total</option>
                <option value={4}>+4 — 5 personas en total</option>
                <option value={5}>+5 — 6 personas en total</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border text-xs uppercase" style={{ fontFamily: "var(--font-jost)" }}>Cancelar</button>
              <button type="submit" disabled={adding} className="flex-1 py-2.5 text-xs uppercase disabled:opacity-50"
                style={{ background: "var(--talavera-blue)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>{adding ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ── MODAL: Editar invitado ── */}
      {editGuest && (
        <ModalWrapper title="Editar invitado" onClose={() => setEditGuest(null)}>
          <form onSubmit={handleEditGuest} className="space-y-3">
            <input required type="text" placeholder="Nombre completo *" value={editGuest.name}
              onChange={(e) => setEditGuest({ ...editGuest, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <input type="tel" placeholder="Teléfono WhatsApp" value={editGuest.phone ?? ""}
              onChange={(e) => setEditGuest({ ...editGuest, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <input type="email" placeholder="Email (opcional)" value={editGuest.email ?? ""}
              onChange={(e) => setEditGuest({ ...editGuest, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                Lugares reservados
              </label>
              <select
                value={editGuest.max_companions}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setEditGuest({ ...editGuest, max_companions: n, guest_type: n === 0 ? "individual" : n === 1 ? "couple" : "family" });
                }}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none bg-white" style={{ fontFamily: "var(--font-jost)" }}>
                <option value={0}>Solo 1 (sin acompañantes)</option>
                <option value={1}>+1 — 2 personas en total</option>
                <option value={2}>+2 — 3 personas en total</option>
                <option value={3}>+3 — 4 personas en total</option>
                <option value={4}>+4 — 5 personas en total</option>
                <option value={5}>+5 — 6 personas en total</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                Notas internas (solo visible en admin)
              </label>
              <textarea rows={2} placeholder='Ej. "Prima de Fernanda, viene desde CDMX"' value={editGuest.notes ?? ""}
                onChange={(e) => setEditGuest({ ...editGuest, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-jost)" }} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditGuest(null)} className="flex-1 py-2.5 border text-xs uppercase" style={{ fontFamily: "var(--font-jost)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-xs uppercase disabled:opacity-50"
                style={{ background: "var(--talavera-blue)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ── MODAL: Editar RSVP ── */}
      {editRsvp?.rsvp && (
        <ModalWrapper title={`Editar RSVP — ${editRsvp.name}`} onClose={() => setEditRsvp(null)}>
          <form onSubmit={handleEditRsvp} className="space-y-4">
            {/* Asistencia */}
            <div>
              <label className="text-xs uppercase block mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Asistencia</label>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button"
                    onClick={() => setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, attending: v } })}
                    className="py-2.5 border text-xs uppercase transition-all"
                    style={{ fontFamily: "var(--font-jost)", borderColor: editRsvp.rsvp!.attending === v ? "var(--talavera-blue)" : "rgba(0,0,0,0.15)", background: editRsvp.rsvp!.attending === v ? "var(--talavera-blue)" : "white", color: editRsvp.rsvp!.attending === v ? "#FAF6F0" : "var(--text-muted)" }}>
                    {v ? "Asistirá" : "No asistirá"}
                  </button>
                ))}
              </div>
            </div>
            {/* Número de personas */}
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Número de personas</label>
              <input type="number" min={1} max={editRsvp.max_companions + 1} value={editRsvp.rsvp!.attendee_count}
                onChange={(e) => setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, attendee_count: parseInt(e.target.value) || 1 } })}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            </div>
            {/* Eventos */}
            <div>
              <label className="text-xs uppercase block mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Eventos</label>
              <div className="space-y-1.5">
                {EVENTS.map((ev) => {
                  const checked = editRsvp.rsvp!.events?.includes(ev.key);
                  return (
                    <button key={ev.key} type="button"
                      onClick={() => {
                        const evs = editRsvp.rsvp!.events ?? [];
                        setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, events: checked ? evs.filter((k) => k !== ev.key) : [...evs, ev.key] } });
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 border text-left text-sm transition-all"
                      style={{ fontFamily: "var(--font-jost)", borderColor: checked ? "var(--talavera-blue)" : "rgba(0,0,0,0.12)", background: checked ? "rgba(27,75,138,0.06)" : "white", color: "var(--text-dark)" }}>
                      {ev.label}
                      {checked && <Check size={13} style={{ color: "var(--talavera-blue)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Hospedaje */}
            <div>
              <label className="text-xs uppercase block mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Hospedaje</label>
              <div className="grid grid-cols-2 gap-2">
                {[["casa_begonias", "Casa Begonias"], ["otro", "Otro lugar"]].map(([val, lbl]) => (
                  <button key={val} type="button"
                    onClick={() => setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, accommodation: val as RSVPResponse["accommodation"] } })}
                    className="py-2 border text-xs uppercase transition-all"
                    style={{ fontFamily: "var(--font-jost)", borderColor: editRsvp.rsvp!.accommodation === val ? "var(--talavera-blue)" : "rgba(0,0,0,0.12)", background: editRsvp.rsvp!.accommodation === val ? "var(--talavera-blue)" : "white", color: editRsvp.rsvp!.accommodation === val ? "#FAF6F0" : "var(--text-muted)" }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            {/* Alergias */}
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Alergias</label>
              <input type="text" value={editRsvp.rsvp!.allergies ?? ""}
                onChange={(e) => setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, allergies: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none" style={{ fontFamily: "var(--font-jost)" }} />
            </div>
            {/* Mensaje */}
            <div>
              <label className="text-xs uppercase block mb-1" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)", letterSpacing: "0.12em" }}>Mensaje</label>
              <textarea rows={2} value={editRsvp.rsvp!.message ?? ""}
                onChange={(e) => setEditRsvp({ ...editRsvp, rsvp: { ...editRsvp.rsvp!, message: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-200 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-jost)" }} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditRsvp(null)} className="flex-1 py-2.5 border text-xs uppercase" style={{ fontFamily: "var(--font-jost)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-xs uppercase disabled:opacity-50"
                style={{ background: "var(--talavera-blue-light)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>{saving ? "Guardando..." : "Guardar RSVP"}</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ── MODAL: Resetear RSVP ── */}
      {resetRsvp && (
        <ModalWrapper title="Resetear RSVP" onClose={() => setResetRsvp(null)}>
          <div className="space-y-4">
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem", color: "var(--text-muted)" }}>
              ¿Deseas borrar la respuesta de <strong style={{ color: "var(--text-dark)" }}>{resetRsvp.name}</strong>?
            </p>
            <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
              El invitado podrá volver a llenar el formulario desde su link. Su estado regresará a "Pendiente".
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setResetRsvp(null)} className="flex-1 py-2.5 border text-xs uppercase" style={{ fontFamily: "var(--font-jost)" }}>Cancelar</button>
              <button onClick={handleResetRsvp} disabled={saving} className="flex-1 py-2.5 text-xs uppercase disabled:opacity-50"
                style={{ background: "var(--talavera-blue-light)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>{saving ? "Reseteando..." : "Sí, resetear"}</button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* ── MODAL: Eliminar invitado ── */}
      {deleteGuest && (
        <ModalWrapper title="Eliminar invitado" onClose={() => setDeleteGuest(null)}>
          <div className="space-y-4">
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem", color: "var(--text-muted)" }}>
              ¿Deseas eliminar a <strong style={{ color: "var(--text-dark)" }}>{deleteGuest.name}</strong> de la lista?
            </p>
            <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
              Esta acción también borrará su respuesta RSVP y no se puede deshacer.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteGuest(null)} className="flex-1 py-2.5 border text-xs uppercase" style={{ fontFamily: "var(--font-jost)" }}>Cancelar</button>
              <button onClick={handleDeleteGuest} disabled={saving} className="flex-1 py-2.5 text-xs uppercase disabled:opacity-50"
                style={{ background: "var(--talavera-cobalt)", color: "#FAF6F0", fontFamily: "var(--font-jost)" }}>{saving ? "Eliminando..." : "Sí, eliminar"}</button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
