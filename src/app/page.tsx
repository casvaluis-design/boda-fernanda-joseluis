"use client";

import { useEffect, useState } from "react";
import { TalaveraBorderTop, TalaveraDivider } from "@/components/invitation/TalaveraBorder";
import { TalaveraBgPattern, TalaveraBand } from "@/components/invitation/TalaveraDecor";
import { SalonSection, AgendaSection, PhotosSection, HospedajeSection, RegalosSection, WEDDING_DATE } from "@/components/invitation/InvitationSections";
import { Navbar } from "@/components/invitation/Navbar";

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

export default function InvitationPage() {
  return (
    <main className="flex flex-col" style={{ background: "var(--cream)", color: "var(--text-dark)" }}>

      <Navbar />

      {/* ══════════════════════════════════════════
          HERO — pantalla completa
      ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "var(--talavera-blue)" }}>

        {/* Foto hero */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-boda.jpg" alt="Fernanda y Jose Luis"
            className="w-full h-full object-cover object-center" />
        </div>

        {/* Overlay degradado */}
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(15,31,74,0.55) 0%, rgba(15,31,74,0.35) 50%, rgba(15,31,74,0.65) 100%)" }} />

        {/* Contenido */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 py-32">

          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img src="/images/logo-boda-blanco.png" alt="F & JL"
              style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))" }} />
          </div>

          {/* Nombres */}
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

          <div className="animate-fade-in-up delay-600 my-8 w-full max-w-xs">
            <TalaveraDivider />
          </div>

          <p className="animate-fade-in-up delay-800 uppercase mb-2"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "rgba(255,255,255,0.9)", letterSpacing: "0.2em" }}>
            17 de Octubre · 2026
          </p>
          <p className="animate-fade-in-up delay-1000"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontStyle: "italic", color: "rgba(214,224,247,0.85)" }}>
            Jiutepec, Morelos
          </p>

          {/* Countdown */}
          <div className="animate-fade-in-up delay-1200 mt-16">
            <p className="uppercase text-xs mb-5"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-jost)", letterSpacing: "0.3em" }}>
              Faltan para la boda
            </p>
            <Countdown />
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
            <div className="w-px h-12" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </section>

      {/* Cenefa talavera — solo después del hero */}
      <TalaveraBand />

      {/* ── SECCIONES ── */}
      <SalonSection />
      <AgendaSection />
      <PhotosSection />
      <HospedajeSection />
      <RegalosSection />

      {/* ══════════════════════════════════════════
          RSVP
      ══════════════════════════════════════════ */}
      <section id="rsvp" className="relative w-full py-28 overflow-hidden"
        style={{ background: "var(--talavera-blue)" }}>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <img src="/images/logo-boda-blanco.png" alt="F & JL"
            style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))" }} />
          <p className="uppercase mt-8 mb-3"
            style={{ fontFamily: "var(--font-jost)", fontSize: "0.68rem", letterSpacing: "0.45em", color: "rgba(255,255,255,0.6)" }}>
            Confirmación de Asistencia
          </p>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 400, color: "white", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            ¿Nos acompañas?
          </h2>
          <div className="w-14 h-px mb-8" style={{ background: "rgba(255,255,255,0.3)" }} />
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.1rem,2vw,1.4rem)", fontStyle: "italic", color: "rgba(255,255,255,0.85)", lineHeight: 1.9 }}>
            Por favor confirma tu asistencia antes del<br />
            <span style={{ color: "white", fontWeight: 500 }}>31 de julio de 2026</span>
          </p>
          <p className="mt-3 mb-4"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem", fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
            Agradecemos su presencia sin niños.
          </p>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1rem,1.8vw,1.2rem)", fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
            Revisa el link personalizado que te enviamos<br />para confirmar tu asistencia.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="w-full px-6 py-6" style={{ background: "var(--talavera-blue)" }}>
        <TalaveraBorderTop />
        <p className="text-center mt-4 text-xs uppercase"
          style={{ fontFamily: "var(--font-jost)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em" }}>
          Fernanda &amp; Jose Luis · Octubre 2026
        </p>
      </div>
    </main>
  );
}
