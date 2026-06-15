"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getSupabaseClient,
  type Guest,
  type EventKey,
  type Accommodation,
  EVENTS,
} from "@/lib/supabase";
import { TalaveraBorderTop, TalaveraDivider } from "@/components/invitation/TalaveraBorder";
import { TalaveraBgPattern, TalaveraBand } from "@/components/invitation/TalaveraDecor";
import { SalonSection, AgendaSection, PhotosSection, HospedajeSection, RegalosSection, WEDDING_DATE } from "@/components/invitation/InvitationSections";
import { Navbar } from "@/components/invitation/Navbar";
import {
  CheckCircle, XCircle, Minus, Plus,
  Glasses, Music, Church,
  Check, X, Hotel, Home,
} from "lucide-react";

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    function update() {
      const diff = WEDDING_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-5 justify-center">
      {[["Días", t.days], ["Horas", t.hours], ["Min", t.minutes], ["Seg", t.seconds]].map(([label, value]) => (
        <div key={String(label)} className="flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", fontFamily: "var(--font-playfair)", fontSize: "1.8rem", color: "white" }}>
            {String(value).padStart(2, "0")}
          </div>
          <span className="text-xs mt-2 uppercase" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-jost)", letterSpacing: "0.2em" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase" style={{ color: "var(--text-muted)", fontFamily: "var(--font-jost)", letterSpacing: "0.2em" }}>{label}</p>
      {children}
    </div>
  );
}

function ChoiceBtn({ active, color, onClick, children }: {
  active: boolean; color: "blue" | "terra" | "gold"; onClick: () => void; children: React.ReactNode;
}) {
  const c = { blue: "var(--talavera-blue)", terra: "var(--talavera-cobalt)", gold: "var(--talavera-blue-light)" }[color];
  return (
    <button type="button" onClick={onClick}
      className="py-4 border-2 text-sm uppercase transition-all duration-200"
      style={{ fontFamily: "var(--font-jost)", letterSpacing: "0.12em", borderColor: active ? c : `${c}40`, background: active ? c : "transparent", color: active ? "#FAF6F0" : c }}>
      {children}
    </button>
  );
}

function Counter({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-0">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-12 h-12 flex items-center justify-center border-2 transition-all disabled:opacity-30"
        style={{ borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)" }}>
        <Minus size={16} />
      </button>
      <div className="w-20 h-12 flex items-center justify-center border-y-2 border-x-0"
        style={{ borderColor: "var(--talavera-blue)", fontFamily: "var(--font-playfair)", fontSize: "1.6rem", color: "var(--talavera-blue)" }}>
        {value}
      </div>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-12 flex items-center justify-center border-2 transition-all disabled:opacity-30"
        style={{ borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)" }}>
        <Plus size={16} />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RSVPPage() {
  const params = useParams();
  const token = params.token as string;
  const isDemo = token === "demo";
  const rsvpRef = useRef<HTMLDivElement>(null);

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [attending, setAttending] = useState<boolean | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [allergies, setAllergies] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<EventKey[]>([]);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setGuest({ id: "demo", name: "Invitado Demo", guest_type: "family", max_companions: 3, token: "demo", status: "pending", hotel_assignment: "none", notes: "", created_at: new Date().toISOString() });
        setLoading(false);
        return;
      }
      const { data, error } = await getSupabaseClient().from("guests").select("*").eq("token", token).single();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setGuest(data);
      const { data: existing } = await getSupabaseClient().from("rsvp_responses").select("id").eq("guest_id", data.id).single();
      if (existing) setAlreadySubmitted(true);
      setLoading(false);
    }
    load();
  }, [token, isDemo]);

  function toggleEvent(k: EventKey) {
    setSelectedEvents((p) => p.includes(k) ? p.filter((e) => e !== k) : [...p, k]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guest || attending === null) return;
    setError("");
    if (attending) {
      if (selectedEvents.length === 0) { setError("Selecciona al menos un evento."); return; }
      if (!accommodation) { setError("Indica dónde te hospedarás."); return; }
    }
    setSubmitting(true);
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true); setSubmitting(false); return;
    }
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, attending, attendee_count: attending ? attendeeCount : 0, allergies: attending ? allergies : "", events: attending ? selectedEvents : [], accommodation: attending ? accommodation : "none", message: message || null }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al guardar. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
      <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem", color: "var(--text-muted)" }}>Cargando tu invitación...</p>
    </div>
  );

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="text-center">
        <img src="/images/logo-boda-azul.png" alt="F & JL" style={{ width: 80, height: 80, objectFit: "contain", margin: "0 auto 2rem" }} />
        <p style={{ fontFamily: "var(--font-playfair)", fontSize: "1.8rem", color: "var(--talavera-blue)" }}>Invitación no encontrada</p>
        <p className="mt-3" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-muted)", fontSize: "1.1rem", fontStyle: "italic" }}>
          Revisa el link que te enviamos o contáctanos.
        </p>
      </div>
    </div>
  );

  const maxPeople = guest ? guest.max_companions + 1 : 1;

  return (
    <main className="flex flex-col" style={{ background: "var(--cream)", color: "var(--text-dark)" }}>

      <Navbar rsvpHref="#rsvp-form" />

      {/* ══════════════════════════════════════════
          HERO — idéntico al homepage
      ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "var(--talavera-blue)" }}>
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-boda.jpg" alt="Fernanda y Jose Luis"
            className="w-full h-full object-cover object-center" />
        </div>
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(15,31,74,0.55) 0%, rgba(15,31,74,0.35) 50%, rgba(15,31,74,0.65) 100%)" }} />

        <div className="relative z-20 flex flex-col items-center text-center px-6 py-32">
          <div className="mb-8 animate-fade-in">
            <img src="/images/logo-boda-blanco.png" alt="F & JL"
              style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))" }} />
          </div>

          <p className="animate-fade-in-up delay-200 uppercase mb-6"
            style={{ color: "rgba(214,224,247,0.9)", fontFamily: "var(--font-jost)", fontSize: "clamp(0.9rem,2.5vw,1.1rem)", letterSpacing: "0.5em" }}>
            Nos casamos
          </p>
          <h1 className="animate-fade-in-up delay-400"
            style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(3.5rem,10vw,7rem)", fontWeight: 400, lineHeight: 1, color: "white" }}>
            Fernanda
          </h1>
          <p className="animate-fade-in-up delay-400 my-3"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.5rem,3vw,2.5rem)", fontStyle: "italic", color: "rgba(214,224,247,0.8)" }}>
            &amp;
          </p>
          <h1 className="animate-fade-in-up delay-400"
            style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(3.5rem,10vw,7rem)", fontWeight: 400, lineHeight: 1, color: "white" }}>
            Jose Luis
          </h1>

          <div className="animate-fade-in-up delay-600 my-8">
            <img src="/images/patron-hero-6-1.svg" alt="" style={{ width: "clamp(260px,80vw,320px)", height: "auto", opacity: 0.9 }} />
          </div>

          <p className="animate-fade-in-up delay-800 uppercase mb-2"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "rgba(255,255,255,0.9)", letterSpacing: "0.2em" }}>
            17 de Octubre · 2026
          </p>
          <p className="animate-fade-in-up delay-1000"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontStyle: "italic", color: "rgba(214,224,247,0.85)" }}>
            Jiutepec, Morelos
          </p>

          <div className="animate-fade-in-up delay-1200 mt-16">
            <p className="uppercase text-xs mb-5"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-jost)", letterSpacing: "0.3em" }}>
              Faltan para la boda
            </p>
            <Countdown />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
            <div className="w-px h-12" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </section>

      <TalaveraBand />

      {/* ── SECCIONES ── */}
      <SalonSection />
      <AgendaSection />
      <PhotosSection />
      <HospedajeSection />
      <RegalosSection />

      {/* ══════════════════════════════════════════
          RSVP PERSONALIZADO
      ══════════════════════════════════════════ */}
      <section id="rsvp-form" ref={rsvpRef} className="relative w-full pt-20 pb-10 overflow-hidden"
        style={{ background: "var(--talavera-blue)" }}>
        <div className="relative z-10 flex flex-col items-center text-center px-6">

          <img src="/images/logo-boda-blanco.png" alt="F & JL"
            style={{ width: 120, height: 120, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))", marginBottom: "2rem" }} />

          <p className="uppercase mb-3"
            style={{ fontFamily: "var(--font-jost)", fontSize: "0.68rem", letterSpacing: "0.45em", color: "rgba(255,255,255,0.6)" }}>
            Confirmación de Asistencia
          </p>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 400, color: "white", lineHeight: 1.1, marginBottom: "1rem" }}>
            ¿Nos acompañas?
          </h2>

          {/* Saludo personalizado */}
          {guest && (
            <p className="mb-2" style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>
              Hola, <span style={{ color: "white", fontWeight: 500 }}>{guest.name}</span> — hemos reservado{" "}
              <span style={{ color: "white", fontWeight: 500 }}>{maxPeople} {maxPeople === 1 ? "lugar" : "lugares"}</span> para ti.
            </p>
          )}
        </div>
      </section>

      {/* ── Formulario ── */}
      <div className="w-full" style={{ background: "white" }}>
        <div className="max-w-xl mx-auto px-6 py-16">

          {/* Ya confirmó */}
          {alreadySubmitted && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto mb-4" size={48} style={{ color: "var(--talavera-blue-light)" }} />
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--text-dark)" }}>¡Ya confirmaste!</p>
              <p className="mt-3" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-muted)", fontSize: "1.1rem", fontStyle: "italic" }}>
                Ya recibimos tu respuesta. Si necesitas cambios contáctanos.
              </p>
            </div>
          )}

          {/* Enviado con éxito */}
          {submitted && (
            <div className="text-center py-8">
              {attending ? (
                <>
                  <CheckCircle className="mx-auto mb-5" size={52} style={{ color: "var(--talavera-blue-light)" }} />
                  <p style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--text-dark)", lineHeight: 1.2 }}>
                    ¡Nos vemos en<br />octubre 2026!
                  </p>
                  <p className="mt-4" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-muted)", fontSize: "1.15rem", fontStyle: "italic" }}>
                    Gracias <strong>{guest?.name}</strong>, ¡estamos felices de que nos acompañes!
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto mb-5" size={52} style={{ color: "var(--talavera-cobalt)" }} />
                  <p style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--text-dark)" }}>Recibimos tu respuesta</p>
                  <p className="mt-4" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-muted)", fontSize: "1.15rem", fontStyle: "italic" }}>
                    Lamentamos que no puedas acompañarnos, <strong>{guest?.name}</strong>. ¡Los llevamos en el corazón!
                  </p>
                </>
              )}
            </div>
          )}

          {/* Formulario */}
          {!alreadySubmitted && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* 1. Asistencia */}
              <FormSection label="¿Podrás acompañarnos?">
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceBtn active={attending === true} color="blue" onClick={() => setAttending(true)}>
                    <Check size={14} className="inline mr-1.5" />Sí, asistiré
                  </ChoiceBtn>
                  <ChoiceBtn active={attending === false} color="terra" onClick={() => setAttending(false)}>
                    <X size={14} className="inline mr-1.5" />No podré ir
                  </ChoiceBtn>
                </div>
              </FormSection>

              {/* Fecha límite y nota — solo se muestra antes de elegir */}
              {attending === null && (
                <div className="text-center">
                  <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.1rem,2vw,1.4rem)", fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.9 }}>
                    Por favor confirma tu asistencia antes del<br />
                    <span style={{ color: "var(--talavera-blue)", fontWeight: 500 }}>31 de julio de 2026</span>
                  </p>
                  <p className="mt-2" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem", fontStyle: "italic", color: "var(--text-muted)" }}>
                    Agradecemos su presencia sin niños.
                  </p>
                </div>
              )}

              {attending === true && (
                <>
                  {/* 2. Número de personas */}
                  <FormSection label="¿Cuántas personas asistirán?">
                    <p className="text-center text-xs mb-3" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.05em" }}>
                      Tienes <strong>{maxPeople} {maxPeople === 1 ? "lugar reservado" : "lugares reservados"}</strong> para este evento
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <Counter value={attendeeCount} min={1} max={maxPeople} onChange={setAttendeeCount} />
                      <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>
                        {attendeeCount === 1 ? "Solo tú" : `Tú + ${attendeeCount - 1} acompañante${attendeeCount - 1 > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </FormSection>

                  {/* 3. Alergias */}
                  <FormSection label="Alergias o restricciones alimentarias (opcional)">
                    <textarea rows={2} value={allergies} onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Ej. mariscos, gluten, vegetariano..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 bg-white outline-none focus:border-blue-300 resize-none"
                      style={{ fontFamily: "var(--font-jost)" }} />
                  </FormSection>

                  {/* 4. Eventos */}
                  <FormSection label="¿A qué eventos asistirás?">
                    <div className="space-y-2">
                      {EVENTS.map((ev) => {
                        const checked = selectedEvents.includes(ev.key);
                        const EventIcon = ev.key === "civil" ? Glasses : ev.key === "ceremonia" ? Church : Music;
                        return (
                          <button key={ev.key} type="button" onClick={() => toggleEvent(ev.key)}
                            className="w-full flex items-center gap-4 p-3.5 border-2 text-left transition-all duration-200"
                            style={{ borderColor: checked ? "var(--talavera-blue)" : "rgba(27,75,138,0.2)", background: checked ? "rgba(27,75,138,0.06)" : "white" }}>
                            <EventIcon size={20} style={{ color: checked ? "var(--talavera-blue)" : "var(--text-muted)", flexShrink: 0 }} />
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ fontFamily: "var(--font-jost)", color: "var(--text-dark)" }}>{ev.label}</p>
                              <p className="text-xs" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue-light)" }}>{ev.date}</p>
                              <p className="text-xs mt-0.5" style={{ fontFamily: "var(--font-jost)", color: "var(--text-muted)" }}>{ev.location}</p>
                            </div>
                            <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all"
                              style={{ borderColor: checked ? "var(--talavera-blue)" : "rgba(27,75,138,0.3)", background: checked ? "var(--talavera-blue)" : "white" }}>
                              {checked && <Check size={11} color="white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormSection>

                  {/* 5. Hospedaje */}
                  <FormSection label="¿Dónde te hospedarás?">
                    <div className="grid grid-cols-2 gap-3">
                      <ChoiceBtn active={accommodation === "casa_begonias"} color="blue" onClick={() => setAccommodation("casa_begonias")}>
                        <Hotel size={14} className="inline mr-1.5" />Casa Begonias
                      </ChoiceBtn>
                      <ChoiceBtn active={accommodation === "otro"} color="gold" onClick={() => setAccommodation("otro")}>
                        <Home size={14} className="inline mr-1.5" />Otro lugar
                      </ChoiceBtn>
                    </div>
                    <p className="mt-3 text-xs text-center" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem", fontStyle: "italic", color: "var(--text-muted)" }}>
                      Esto nos ayudará a planear mejor la logística.
                    </p>
                  </FormSection>
                </>
              )}

              {/* 6. Mensaje */}
              {attending !== null && (
                <FormSection label="Mensaje para los novios (opcional)">
                  <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escríbenos algo..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 bg-white outline-none focus:border-blue-300 resize-none"
                    style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem" }} />
                </FormSection>
              )}

              {error && <p className="text-sm text-center text-red-500">{error}</p>}

              {attending !== null && (
                <button type="submit" disabled={submitting}
                  className="w-full py-4 text-sm uppercase transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--talavera-blue)", color: "white", fontFamily: "var(--font-jost)", letterSpacing: "0.2em" }}>
                  {submitting ? "Enviando..." : "Enviar confirmación"}
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full" style={{ background: "var(--talavera-blue)" }}>
        <div className="hidden sm:block w-full" style={{ height: 56, backgroundImage: "url('/images/patron-hero-4-2.svg')", backgroundRepeat: "repeat-x", backgroundSize: "229px 56px", backgroundPosition: "left center" }} />
        <div className="sm:hidden w-full" style={{ height: 36, backgroundImage: "url('/images/patron-hero-4-2.svg')", backgroundRepeat: "repeat-x", backgroundSize: "147px 36px", backgroundPosition: "left center" }} />
        <p className="text-center py-5 text-xs uppercase"
          style={{ fontFamily: "var(--font-jost)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em" }}>
          Fernanda &amp; Jose Luis · Octubre 2026
        </p>
      </div>

    </main>
  );
}
