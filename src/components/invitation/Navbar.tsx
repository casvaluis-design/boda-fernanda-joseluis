"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { label: "Salón",    href: "#salon" },
  { label: "Agenda",   href: "#agenda" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Hospedaje",href: "#hospedaje" },
  { label: "Regalos",  href: "#regalos" },
  { label: "RSVP",     href: "#rsvp" },
];

export function Navbar({ rsvpHref = "#rsvp" }: { rsvpHref?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(href: string) {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--talavera-blue-pale)" : "none",
        backdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="transition-opacity hover:opacity-70">
          <img
            src={scrolled ? "/images/logo-boda-azul.png" : "/images/logo-boda-blanco.png"}
            alt="F & JL"
            style={{ height: 40, width: "auto" }}
          />
        </button>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)}
              className="text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
              style={{
                fontFamily: "var(--font-jost)",
                letterSpacing: "0.18em",
                color: scrolled ? "var(--text-dark)" : "white",
                textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.4)",
              }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA desktop */}
        <a href={rsvpHref}
          onClick={(e) => { e.preventDefault(); scrollTo("#rsvp"); }}
          className="hidden md:inline-block px-5 py-2 text-xs uppercase tracking-widest transition-all hover:opacity-80"
          style={{
            fontFamily: "var(--font-jost)",
            letterSpacing: "0.18em",
            background: scrolled ? "var(--talavera-blue)" : "rgba(255,255,255,0.15)",
            border: scrolled ? "none" : "1px solid rgba(255,255,255,0.6)",
            color: "white",
            backdropFilter: !scrolled ? "blur(4px)" : "none",
          }}>
          Confirmar
        </a>

        {/* Hamburger mobile */}
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setOpen(!open)}>
          {[0,1,2].map((i) => (
            <span key={i} className="block w-5 h-px transition-all"
              style={{ background: scrolled ? "var(--text-dark)" : "white" }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: "rgba(255,255,255,0.98)", borderTop: "1px solid var(--talavera-blue-pale)" }}>
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)}
              className="text-left text-xs uppercase"
              style={{ fontFamily: "var(--font-jost)", letterSpacing: "0.18em", color: "var(--text-dark)" }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
