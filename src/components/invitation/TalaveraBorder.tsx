"use client";

// Paleta talavera azul — cobalto sobre blanco
const C = {
  cobalt:  "#1A3A8C",   // azul cobalto profundo
  medium:  "#2952B3",   // cobalto medio
  light:   "#4A72C4",   // azul claro
  pale:    "#D6E0F7",   // azul pálido (rellenos suaves)
  white:   "#FFFFFF",
};

export function TalaveraBorderTop() {
  return (
    <svg viewBox="0 0 800 56" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Líneas base */}
      <line x1="0" y1="28" x2="800" y2="28" stroke={C.cobalt} strokeWidth="1.8" />
      <line x1="0" y1="32" x2="800" y2="32" stroke={C.pale}   strokeWidth="0.8" />
      <line x1="0" y1="24" x2="800" y2="24" stroke={C.pale}   strokeWidth="0.8" />

      {/* Motivos florales repetidos */}
      {[60, 160, 260, 360, 460, 560, 660, 760].map((cx) => (
        <g key={cx} transform={`translate(${cx}, 28)`}>
          {/* Centro */}
          <circle cx="0" cy="0" r="7"  fill={C.white}  stroke={C.cobalt} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3.5" fill={C.cobalt} />
          {/* 8 pétalos alternando cobalt / light */}
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <ellipse key={angle} cx={0} cy={-12} rx="2.8" ry="5.5"
              fill={i % 2 === 0 ? C.cobalt : C.light}
              transform={`rotate(${angle})`} />
          ))}
          {/* Puntos decorativos */}
          <circle cx="22" cy="0" r="2" fill={C.pale}   stroke={C.cobalt} strokeWidth="0.8" />
          <circle cx="-22" cy="0" r="2" fill={C.pale}  stroke={C.cobalt} strokeWidth="0.8" />
        </g>
      ))}

      {/* Esquinas */}
      {[18, 782].map((x) => (
        <g key={x} transform={`translate(${x}, 28)`}>
          <circle cx="0" cy="0" r="9"  fill={C.white}  stroke={C.cobalt} strokeWidth="1.8" />
          <circle cx="0" cy="0" r="4.5" fill={C.cobalt} />
          {[0,90,180,270].map((a) => (
            <line key={a} x1="0" y1="-13" x2="0" y2="-9" stroke={C.cobalt} strokeWidth="1.2"
              transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function TalaveraDivider() {
  return (
    <svg viewBox="0 0 400 36" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto">
      <line x1="0"   y1="18" x2="155" y2="18" stroke={C.cobalt} strokeWidth="0.8" />
      <line x1="245" y1="18" x2="400" y2="18" stroke={C.cobalt} strokeWidth="0.8" />
      <line x1="0"   y1="21" x2="150" y2="21" stroke={C.pale}   strokeWidth="0.5" />
      <line x1="250" y1="21" x2="400" y2="21" stroke={C.pale}   strokeWidth="0.5" />

      {/* Centro: flor talavera */}
      <g transform="translate(200, 18)">
        <circle cx="0" cy="0" r="12" fill={C.white}  stroke={C.cobalt} strokeWidth="1.8" />
        <circle cx="0" cy="0" r="5"  fill={C.cobalt} />
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <ellipse key={angle} cx={0} cy={-18} rx="3.5" ry="7"
            fill={i % 2 === 0 ? C.cobalt : C.light}
            transform={`rotate(${angle})`} />
        ))}
        {[0,90,180,270].map((a) => (
          <ellipse key={a} cx={0} cy={-27} rx="2" ry="4"
            fill={C.pale} stroke={C.cobalt} strokeWidth="0.6"
            transform={`rotate(${a})`} />
        ))}
      </g>

      {/* Rombos decorativos */}
      {[135,152,168].map((x, i) => (
        <rect key={x} x={x-3.5} y={14.5} width="7" height="7"
          transform={`rotate(45,${x},18)`}
          fill={i === 1 ? C.cobalt : C.pale}
          stroke={C.cobalt} strokeWidth="0.8" />
      ))}
      {[232,248,265].map((x, i) => (
        <rect key={x} x={x-3.5} y={14.5} width="7" height="7"
          transform={`rotate(45,${x},18)`}
          fill={i === 1 ? C.cobalt : C.pale}
          stroke={C.cobalt} strokeWidth="0.8" />
      ))}
    </svg>
  );
}

export function TalaveraCenterpiece() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-36 h-36 mx-auto">
      {/* Anillos exteriores */}
      <circle cx="100" cy="100" r="94" fill="none" stroke={C.cobalt} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke={C.pale}   strokeWidth="1" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={C.cobalt} strokeWidth="0.8" />

      {/* 8 pétalos grandes — inspirados en la talavera de la imagen */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <g key={angle} transform={`rotate(${angle},100,100)`}>
          <ellipse cx="100" cy="24" rx="13" ry="24"
            fill={i % 2 === 0 ? C.cobalt : C.medium} opacity="0.9" />
          <ellipse cx="100" cy="24" rx="6"  ry="14"
            fill={C.white} opacity="0.35" />
        </g>
      ))}

      {/* Anillo intermedio */}
      <circle cx="100" cy="100" r="46" fill={C.white}  stroke={C.cobalt} strokeWidth="2" />
      <circle cx="100" cy="100" r="40" fill={C.pale}   stroke="none" />
      <circle cx="100" cy="100" r="39" fill="none"     stroke={C.cobalt} strokeWidth="0.8" />

      {/* 4 pétalos interiores — hoja de acanto */}
      {[0,90,180,270].map((angle) => (
        <g key={angle} transform={`rotate(${angle},100,100)`}>
          <ellipse cx="100" cy="70" rx="8" ry="16"
            fill={C.cobalt} opacity="0.85" />
          <ellipse cx="100" cy="70" rx="3.5" ry="9"
            fill={C.white} opacity="0.4" />
        </g>
      ))}

      {/* Puntos decorativos en el anillo */}
      {Array.from({ length: 20 }).map((_, i) => {
        const rad = (i * 18 * Math.PI) / 180;
        return (
          <circle key={i} cx={100 + 52 * Math.cos(rad)} cy={100 + 52 * Math.sin(rad)}
            r={i % 2 === 0 ? 2.8 : 1.8}
            fill={i % 4 === 0 ? C.cobalt : C.light} />
        );
      })}

      {/* Centro */}
      <circle cx="100" cy="100" r="18" fill={C.cobalt} />
      <circle cx="100" cy="100" r="12" fill={C.white}  />
      <circle cx="100" cy="100" r="7"  fill={C.medium} />
      <circle cx="100" cy="100" r="3"  fill={C.white}  />
    </svg>
  );
}

export function TalaveraSideOrnament({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 56 200" xmlns="http://www.w3.org/2000/svg" className="h-44"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <line x1="28" y1="0"   x2="28" y2="200" stroke={C.cobalt} strokeWidth="1.8" />
      <line x1="32" y1="0"   x2="32" y2="200" stroke={C.pale}   strokeWidth="0.7" />
      <line x1="24" y1="0"   x2="24" y2="200" stroke={C.pale}   strokeWidth="0.7" />

      {[22,62,102,142,182].map((cy, idx) => (
        <g key={cy} transform={`translate(28,${cy})`}>
          <circle cx="0" cy="0" r="8"  fill={C.white}  stroke={C.cobalt} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4"  fill={C.cobalt} />
          {[0,90,180,270].map((a) => (
            <ellipse key={a} cx={0} cy={-13} rx="3" ry="6"
              fill={idx % 2 === 0 ? C.cobalt : C.light}
              transform={`rotate(${a})`} />
          ))}
          {[45,135,225,315].map((a) => (
            <ellipse key={a} cx={0} cy={-11} rx="2" ry="4"
              fill={C.pale} stroke={C.cobalt} strokeWidth="0.5"
              transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}
