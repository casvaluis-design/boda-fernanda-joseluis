"use client";

import { MapPin, Clock, ExternalLink, CreditCard, Gift } from "lucide-react";
import { TalaveraBgPattern, TalavераCorner, TalaveraBand } from "./TalaveraDecor";

// ─── Datos ────────────────────────────────────────────────────────────────────
export const WEDDING_DATE = new Date("2026-10-17T13:30:00");

export interface AgendaDay {
  num: number; title: string; date: string;
  location: string; city: string; time: string;
  dresscode?: { title: string; lines: string[]; insp?: string };
}

export const AGENDA: AgendaDay[] = [
  {
    num: 1, title: "Civil + Rompe Hielos",
    date: "Viernes 16 de octubre, 2026",
    location: "Jardín Alma", city: "Jiutepec, Morelos", time: "4:30 PM",
    dresscode: { title: "Tonos blancos / nude / beige", lines: ["Ligeros y cómodos", "Manta o guayabera"], insp: "#" },
  },
  {
    num: 2, title: "Ceremonia + Recepción",
    date: "Sábado 17 de octubre, 2026",
    location: "Jardín Alma", city: "Jiutepec, Morelos", time: "1:30 PM",
    dresscode: { title: "Formal", lines: ["Vestido largo para ellas", "Traje para ellos", "NO tenis · NO guayabera"], insp: "#" },
  },
];

// ─── Section title ────────────────────────────────────────────────────────────
export function SectionTitle({ label, title, light = false }: { label: string; title: string; light?: boolean }) {
  return (
    <div className="text-center mb-14">
      <p className="uppercase" style={{
        fontFamily: "var(--font-jost)",
        fontSize: "0.68rem",
        letterSpacing: "0.45em",
        color: light ? "rgba(255,255,255,0.6)" : "var(--talavera-blue)",
      }}>
        {label}
      </p>
      <h2 style={{
        fontFamily: "var(--font-playfair)",
        fontSize: "clamp(2.4rem,5vw,3.6rem)",
        fontWeight: 400,
        lineHeight: 1.1,
        color: light ? "white" : "var(--text-dark)",
        marginTop: "0.5rem",
      }}>
        {title}
      </h2>
      <div className="w-14 h-px mx-auto mt-5" style={{ background: light ? "rgba(255,255,255,0.4)" : "var(--talavera-blue-pale)" }} />
    </div>
  );
}

// ─── Agenda card ─────────────────────────────────────────────────────────────
function AgendaCard({ day }: { day: AgendaDay }) {
  return (
    <div className="relative flex flex-col border bg-white" style={{ borderColor: "var(--talavera-blue-pale)" }}>
      {/* Esquinas talavera */}
      <div className="absolute top-0 left-0"><TalavераCorner position="tl" size={36} /></div>
      <div className="absolute top-0 right-0"><TalavераCorner position="tr" size={36} /></div>
      <div className="absolute bottom-0 left-0"><TalavераCorner position="bl" size={36} /></div>
      <div className="absolute bottom-0 right-0"><TalavераCorner position="br" size={36} /></div>

      <div className="flex justify-center pt-8 pb-5">
        <div className="flex flex-col items-center justify-center px-5 py-2"
          style={{ background: "var(--talavera-blue)", color: "white" }}>
          <span style={{ fontSize: "0.6rem", fontFamily: "var(--font-jost)", letterSpacing: "0.25em", opacity: 0.75 }}>DÍA</span>
          <span style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair)", fontStyle: "italic", lineHeight: 1 }}>{day.num}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-8 pb-10 text-center gap-4">
        <h3 className="uppercase" style={{ fontFamily: "var(--font-jost)", fontSize: "0.8rem", letterSpacing: "0.2em", color: "var(--talavera-blue)", fontWeight: 500 }}>
          {day.title}
        </h3>
        <div className="w-10 h-px mx-auto" style={{ background: "var(--talavera-blue-pale)" }} />
        <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.25rem", color: "var(--text-muted)", fontStyle: "italic" }}>{day.date}</p>
        <div>
          <div className="flex items-center gap-2 justify-center">
            <MapPin size={14} style={{ color: "var(--talavera-blue)", flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-jost)", fontSize: "1rem", color: "var(--text-dark)", fontWeight: 500 }}>{day.location}</p>
          </div>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: "0.85rem", color: "var(--text-muted)" }}>{day.city}</p>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Clock size={14} style={{ color: "var(--talavera-blue)" }} />
          <p style={{ fontFamily: "var(--font-jost)", fontSize: "1rem", color: "var(--text-dark)", fontWeight: 500 }}>{day.time}</p>
        </div>
        <div className="flex-1" />
        {day.dresscode && (
          <div className="pt-5 border-t" style={{ borderColor: "var(--talavera-blue-pale)" }}>
            <p className="uppercase mb-2" style={{ fontFamily: "var(--font-jost)", fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--talavera-blue)" }}>Dresscode</p>
            <p className="font-medium mb-2" style={{ fontFamily: "var(--font-jost)", fontSize: "1rem", color: "var(--text-dark)" }}>{day.dresscode.title}</p>
            {day.dresscode.lines.map((l, i) => (
              <p key={i} style={{ fontFamily: "var(--font-jost)", fontSize: "0.88rem", color: "var(--text-muted)" }}>{l}</p>
            ))}
            {day.dresscode.insp && (
              <a href={day.dresscode.insp} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-5 px-5 py-2.5 uppercase border transition-opacity hover:opacity-70"
                style={{ fontFamily: "var(--font-jost)", fontSize: "0.72rem", letterSpacing: "0.18em", borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)" }}>
                Inspo Dresscode
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECCIONES
// ══════════════════════════════════════════════════════════════════════════════

// ─── Salón ────────────────────────────────────────────────────────────────────
export function SalonSection() {
  return (
    <section id="salon" className="w-full" style={{ background: "white" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
        {/* Foto full-height */}
        <div className="w-full h-72 lg:h-auto overflow-hidden">
          <img src="/images/jardin-alma.jpg" alt="Jardín Alma"
            className="w-full h-full object-cover" />
        </div>
        {/* Info */}
        <div className="relative flex flex-col justify-center px-10 py-16 lg:px-20">
          <TalaveraBgPattern opacity={0.04} />
          <div className="relative z-10">
            <p className="uppercase mb-3" style={{ fontFamily: "var(--font-jost)", fontSize: "0.68rem", letterSpacing: "0.45em", color: "var(--talavera-blue)" }}>
              Salón del Evento
            </p>
            <div className="w-14 h-px mb-8" style={{ background: "var(--talavera-blue)" }} />
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 400, color: "var(--text-dark)", lineHeight: 1.1 }}>
              Jardín Alma
            </h2>
            <p className="mt-2 mb-8" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.25rem", fontStyle: "italic", color: "var(--text-muted)" }}>
              Jiutepec, Morelos
            </p>
            <div className="flex items-start gap-3 mb-8">
              <MapPin size={16} style={{ color: "var(--talavera-blue)", marginTop: 3, flexShrink: 0 }} />
              <p style={{ fontFamily: "var(--font-jost)", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                Begonias 10, Atlacomulco, 62560 Jiutepec, Morelos
              </p>
            </div>
            <a href="https://maps.app.goo.gl/azzqHzQD5f1B9bJn8" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border uppercase transition-opacity hover:opacity-70 w-fit"
              style={{ fontFamily: "var(--font-jost)", fontSize: "0.75rem", letterSpacing: "0.18em", borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)" }}>
              <MapPin size={14} /> Ver en Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Agenda ───────────────────────────────────────────────────────────────────
export function AgendaSection() {
  return (
    <section id="agenda" className="w-full relative py-24" style={{ background: "var(--tile-bg)" }}>
      <TalaveraBgPattern opacity={0.05} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <SectionTitle label="Programa" title="Agenda de Eventos" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {AGENDA.map((day) => <AgendaCard key={day.num} day={day} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Fotos novios ─────────────────────────────────────────────────────────────
export function PhotosSection() {
  const photos = [
    { src: "/images/foto-4.png" },
    { src: "/images/foto-3.png" },
    { src: "/images/foto-2.png" },
  ];

  return (
    <section id="nosotros" className="w-full" style={{ background: "white" }}>
      {/* Tira de fotos horizontal */}
      <div className="grid grid-cols-3 gap-0">
        {photos.map((p, i) => (
          <div key={i} className="w-full h-96 overflow-hidden">
            <img src={p.src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* Quote */}
      <div className="relative py-20 px-6 text-center overflow-hidden" style={{ background: "var(--talavera-blue)" }}>
        <TalaveraBgPattern opacity={0.08} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontStyle: "italic", color: "rgba(255,255,255,0.9)", lineHeight: 1.8 }}>
            &ldquo;La magia de la conexión, la suerte de coincidir, el esfuerzo de permanecer y la bendición de ser un nosotros.&rdquo;
          </p>
          <div className="w-14 h-px mx-auto my-6" style={{ background: "rgba(255,255,255,0.4)" }} />
          <p className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-jost)", fontSize: "0.75rem", letterSpacing: "0.25em" }}>
            Fernanda &amp; Jose Luis
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Hospedaje ────────────────────────────────────────────────────────────────
export function HospedajeSection() {
  return (
    <section id="hospedaje" className="w-full" style={{ background: "white" }}>
      {/* Casa Begonias — split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
        <div className="w-full h-72 lg:h-auto overflow-hidden">
          <img src="/images/casa-begonias.jpg" alt="Casa Begonias"
            className="w-full h-full object-cover" />
        </div>
        <div className="relative flex flex-col justify-center px-10 py-16 lg:px-20">
          <TalaveraBgPattern opacity={0.04} />
          <div className="relative z-10">
            <p className="uppercase mb-3" style={{ fontFamily: "var(--font-jost)", fontSize: "0.68rem", letterSpacing: "0.45em", color: "var(--talavera-blue)" }}>
              Hospedaje
            </p>
            <div className="w-14 h-px mb-8" style={{ background: "var(--talavera-blue)" }} />
            <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 400, color: "var(--text-dark)", lineHeight: 1.1 }}>Casa Begonias</h3>
            <p className="mt-2 mb-6" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem", fontStyle: "italic", color: "var(--text-muted)" }}>
              Begonias 10, Atlacomulco · 62560 Jiutepec, Mor.
            </p>
            <p className="mb-6" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Este hotel está conectado directamente al Jardín Alma, a pasos del evento — la opción más cómoda para quedarse estos días.
            </p>
            <ul className="space-y-2 mb-8">
              {["Conectado al Jardín Alma", "Desayuno incluido"].map((item) => (
                <li key={item} className="flex items-start gap-3"
                  style={{ fontFamily: "var(--font-jost)", fontSize: "0.92rem", color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--talavera-blue)", fontSize: "1.1rem", lineHeight: 1 }}>·</span> {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <a href="#" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 uppercase transition-opacity hover:opacity-80"
                style={{ background: "var(--talavera-blue)", color: "white", fontFamily: "var(--font-jost)", fontSize: "0.75rem", letterSpacing: "0.18em" }}>
                <ExternalLink size={14} /> Reservar
              </a>
              <a href="https://maps.app.goo.gl/azzqHzQD5f1B9bJn8" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border uppercase transition-opacity hover:opacity-70"
                style={{ borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)", fontFamily: "var(--font-jost)", fontSize: "0.75rem", letterSpacing: "0.18em" }}>
                <MapPin size={14} /> Ver ubicación
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Nota otras opciones */}
      <div className="py-6 px-6 text-center" style={{ background: "var(--tile-bg)" }}>
        <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-light)" }}>
          * También puedes hospedarte en hoteles o Airbnb cercanos en la zona de Jiutepec y Cuernavaca.
        </p>
      </div>
    </section>
  );
}

// ─── Mesa de regalos ──────────────────────────────────────────────────────────
export function RegalosSection() {
  return (
    <section id="regalos" className="w-full relative py-24 overflow-hidden" style={{ background: "white" }}>
      <TalaveraBgPattern opacity={0.04} />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <SectionTitle label="Regalos" title="Mesa de Regalos" />
        <p className="text-center mb-14" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.25rem", fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.8 }}>
          Su presencia es el mejor regalo. Si desean obsequiarnos algo, aquí van algunas opciones:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Liverpool */}
          <div className="relative border p-10 text-center flex flex-col gap-5 items-center"
            style={{ borderColor: "var(--talavera-blue-pale)" }}>
            <div className="absolute top-0 left-0"><TalavераCorner position="tl" size={32} /></div>
            <div className="absolute top-0 right-0"><TalavераCorner position="tr" size={32} /></div>
            <div className="absolute bottom-0 left-0"><TalavераCorner position="bl" size={32} /></div>
            <div className="absolute bottom-0 right-0"><TalavераCorner position="br" size={32} /></div>
            <Gift size={32} style={{ color: "var(--talavera-blue)" }} />
            <div>
              <p className="uppercase text-xs mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.25em" }}>Mesa de Regalos</p>
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: "1.5rem", color: "var(--text-dark)" }}>Liverpool</p>
              <p className="mt-2" style={{ fontFamily: "var(--font-jost)", fontSize: "0.88rem", color: "var(--text-muted)" }}>Evento No. [PLACEHOLDER]</p>
            </div>
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border uppercase transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-jost)", fontSize: "0.75rem", letterSpacing: "0.15em", borderColor: "var(--talavera-blue)", color: "var(--talavera-blue)" }}>
              <ExternalLink size={14} /> Ver mesa en línea
            </a>
          </div>
          {/* Transferencia */}
          <div className="relative border p-10 text-center flex flex-col gap-5 items-center"
            style={{ borderColor: "var(--talavera-blue-pale)" }}>
            <div className="absolute top-0 left-0"><TalavераCorner position="tl" size={32} /></div>
            <div className="absolute top-0 right-0"><TalavераCorner position="tr" size={32} /></div>
            <div className="absolute bottom-0 left-0"><TalavераCorner position="bl" size={32} /></div>
            <div className="absolute bottom-0 right-0"><TalavераCorner position="br" size={32} /></div>
            <CreditCard size={32} style={{ color: "var(--talavera-blue)" }} />
            <div>
              <p className="uppercase text-xs mb-2" style={{ fontFamily: "var(--font-jost)", color: "var(--talavera-blue)", letterSpacing: "0.25em" }}>Transferencia</p>
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: "1.5rem", color: "var(--text-dark)" }}>BBVA / CLABE</p>
              <p className="mt-3" style={{ fontFamily: "var(--font-jost)", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
                Banco: [PLACEHOLDER]<br />
                Cuenta: [PLACEHOLDER]<br />
                CLABE: [PLACEHOLDER]<br />
                A nombre de: Fernanda / Jose Luis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
