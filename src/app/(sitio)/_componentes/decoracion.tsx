// Ilustraciones decorativas en SVG (mientras no hay fotos reales).

const ESMALTES = [
  ["#f3c9c3", "#e6a59d"],
  ["#8a3f66", "#5e2749"],
  ["#f8e6e2", "#ecd0c8"],
  ["#c09a5e", "#a37f45"],
  ["#d88d85", "#b96a63"],
];

/** Cinco uñas almendradas con distintos esmaltes, como una carta de colores. */
export function CartaEsmaltes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 300" className={className} aria-hidden>
      <defs>
        {ESMALTES.map(([a, b], i) => (
          <linearGradient key={i} id={`esmalte-${i}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
        <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#4a1e3a" floodOpacity="0.18" />
        </filter>
      </defs>
      {ESMALTES.map((_, i) => {
        const x = 40 + i * 62;
        const y = 70 + Math.abs(2 - i) * 22;
        const rot = (i - 2) * 9;
        return (
          <g key={i} transform={`rotate(${rot} ${x + 24} ${y + 80})`} filter="url(#sombra)">
            <path
              d={`M${x} ${y + 150} L${x} ${y + 60} C${x} ${y + 15} ${x + 12} ${y - 10} ${x + 24} ${y - 10} C${x + 36} ${y - 10} ${x + 48} ${y + 15} ${x + 48} ${y + 60} L${x + 48} ${y + 150} Z`}
              fill={`url(#esmalte-${i})`}
            />
            <path
              d={`M${x + 9} ${y + 70} C${x + 9} ${y + 30} ${x + 15} ${y + 8} ${x + 22} ${y + 4}`}
              stroke="url(#brillo)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      })}
      {[
        [30, 40, 3],
        [320, 60, 4],
        [300, 250, 2.5],
        [60, 260, 3.5],
        [180, 30, 2],
        [345, 160, 2],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#c09a5e" opacity="0.7" />
      ))}
    </svg>
  );
}

/** Pequeño destello dorado. */
export function Destello({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" fill="currentColor" />
    </svg>
  );
}
