"use client";

const C = {
  cobalt: "#1A3A8C",
  medium: "#2952B3",
  light:  "#4A72C4",
  pale:   "#D6E0F7",
};

// ─── Patrón talavera de fondo (tile repetible) ────────────────────────────────
export function TalaveraBgPattern({ opacity = 0.045 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, opacity }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="talavera-tile" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Marco exterior */}
            <rect x="4" y="4" width="112" height="112" fill="none" stroke={C.cobalt} strokeWidth="2" />
            <rect x="10" y="10" width="100" height="100" fill="none" stroke={C.cobalt} strokeWidth="0.8" />
            {/* Flor central */}
            <g transform="translate(60,60)">
              <circle cx="0" cy="0" r="22" fill="none" stroke={C.cobalt} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill={C.cobalt} />
              {[0,45,90,135,180,225,270,315].map((a,i) => (
                <ellipse key={a} cx={0} cy={-16} rx="3" ry="6"
                  fill={i%2===0 ? C.cobalt : C.medium}
                  transform={`rotate(${a})`} />
              ))}
            </g>
            {/* Esquinas florales */}
            {[[18,18],[102,18],[18,102],[102,102]].map(([cx,cy],i) => (
              <g key={i} transform={`translate(${cx},${cy})`}>
                <circle cx="0" cy="0" r="7" fill="none" stroke={C.cobalt} strokeWidth="1" />
                <circle cx="0" cy="0" r="3" fill={C.cobalt} />
                {[0,90,180,270].map((a) => (
                  <ellipse key={a} cx={0} cy={-10} rx="2" ry="4"
                    fill={C.medium} transform={`rotate(${a})`} />
                ))}
              </g>
            ))}
            {/* Líneas diagonales decorativas */}
            <line x1="18" y1="18" x2="36" y2="36" stroke={C.cobalt} strokeWidth="0.5" />
            <line x1="102" y1="18" x2="84" y2="36" stroke={C.cobalt} strokeWidth="0.5" />
            <line x1="18" y1="102" x2="36" y2="84" stroke={C.cobalt} strokeWidth="0.5" />
            <line x1="102" y1="102" x2="84" y2="84" stroke={C.cobalt} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#talavera-tile)" />
      </svg>
    </div>
  );
}

// ─── Esquinas decorativas para tarjetas / secciones ───────────────────────────
export function TalavераCorner({ size = 40, position = "tl" }: { size?: number; position?: "tl" | "tr" | "bl" | "br" }) {
  const flip = {
    tl: "scale(1,1)",
    tr: "scale(-1,1)",
    bl: "scale(1,-1)",
    br: "scale(-1,-1)",
  }[position];

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip, transformOrigin: "center" }}>
      <path d="M2 2 L20 2 L20 4 L4 4 L4 20 L2 20 Z" fill={C.cobalt} />
      <path d="M2 2 L14 2 L14 4 L4 4 L4 14 L2 14 Z" fill={C.pale} />
      <circle cx="6" cy="6" r="3" fill={C.cobalt} />
      <circle cx="6" cy="6" r="1.5" fill="white" />
      {[0,90,180,270].map((a) => (
        <ellipse key={a} cx={6} cy={1} rx="1.2" ry="2.5"
          fill={C.medium} transform={`rotate(${a},6,6)`} />
      ))}
    </svg>
  );
}

// ─── Cenefa talavera horizontal (entre secciones) ────────────────────────────
export function TalaveraBand() {
  // Tile 80×80: fondo azul, flor central con pétalos, gotas en esquinas
  return (
    <div className="w-full overflow-hidden" style={{ height: 80, background: C.cobalt }}>
      <svg width="100%" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="talavera-band-tile" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Fondo */}
            <rect width="80" height="80" fill={C.cobalt} />
            {/* Marco interior */}
            <rect x="3" y="3" width="74" height="74" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
            <rect x="6" y="6" width="68" height="68" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            {/* Flor central — 4 pétalos grandes */}
            <g transform="translate(40,40)">
              {/* Pétalos principales N S E W */}
              <ellipse cx="0" cy="-16" rx="6" ry="13" fill="white" opacity="0.9" />
              <ellipse cx="0" cy="16"  rx="6" ry="13" fill="white" opacity="0.9" />
              <ellipse cx="-16" cy="0" rx="13" ry="6" fill="white" opacity="0.9" />
              <ellipse cx="16"  cy="0" rx="13" ry="6" fill="white" opacity="0.9" />
              {/* Pétalos diagonales pequeños */}
              <ellipse cx="-10" cy="-10" rx="4" ry="8" fill="white" opacity="0.55" transform="rotate(-45,−10,−10)" />
              <ellipse cx="10"  cy="-10" rx="4" ry="8" fill="white" opacity="0.55" transform="rotate(45,10,−10)" />
              <ellipse cx="-10" cy="10"  rx="4" ry="8" fill="white" opacity="0.55" transform="rotate(45,−10,10)" />
              <ellipse cx="10"  cy="10"  rx="4" ry="8" fill="white" opacity="0.55" transform="rotate(-45,10,10)" />
              {/* Círculo central */}
              <circle cx="0" cy="0" r="7" fill={C.cobalt} />
              <circle cx="0" cy="0" r="4" fill="white" opacity="0.9" />
              <circle cx="0" cy="0" r="2" fill={C.cobalt} />
            </g>
            {/* Gotas en las 4 esquinas */}
            {([[14,14],[66,14],[14,66],[66,66]] as [number,number][]).map(([cx,cy],i) => (
              <g key={i} transform={`translate(${cx},${cy})`}>
                <circle cx="0" cy="0" r="5" fill="white" opacity="0.8" />
                <circle cx="0" cy="0" r="2.5" fill={C.cobalt} />
                {/* gotitas alrededor */}
                {[0,90,180,270].map((a) => (
                  <ellipse key={a} cx="0" cy="-9" rx="1.8" ry="3.5"
                    fill="white" opacity="0.6" transform={`rotate(${a})`} />
                ))}
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="80" fill="url(#talavera-band-tile)" />
      </svg>
    </div>
  );
}

// ─── Marco talavera para el hero ──────────────────────────────────────────────
export function TalavераHeroFrame() {
  return (
    <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto" style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))" }}>
      {/* Líneas horizontales */}
      <line x1="0" y1="100" x2="160" y2="100" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="340" y1="100" x2="500" y2="100" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="0" y1="104" x2="155" y2="104" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="345" y1="104" x2="500" y2="104" stroke="white" strokeWidth="0.5" opacity="0.3" />
      {/* Centro: medallón */}
      <g transform="translate(250,100)">
        <circle cx="0" cy="0" r="50" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <circle cx="0" cy="0" r="44" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <ellipse key={a} cx={0} cy={-36} rx="5" ry="10"
            fill="white" opacity={i%2===0 ? 0.6 : 0.35}
            transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="16" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
        <circle cx="0" cy="0" r="6" fill="white" opacity="0.7" />
      </g>
      {/* Diamantes laterales */}
      {[130,165,370,405].map((x,i) => (
        <rect key={x} x={x-5} y={95} width="10" height="10"
          transform={`rotate(45,${x},100)`}
          fill={i%2===0 ? "white" : "none"}
          stroke="white" strokeWidth="0.8"
          opacity="0.6" />
      ))}
    </svg>
  );
}
