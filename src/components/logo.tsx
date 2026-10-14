import { marca } from "@/lib/marca";
import { cx } from "./ui";

/** Monograma "AM" con un trazo de pincel dorado. */
export function Monograma({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cx("h-10 w-10", className)} aria-hidden>
      <defs>
        <linearGradient id="oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a37f45" />
          <stop offset="0.5" stopColor="#e2c48f" />
          <stop offset="1" stopColor="#a37f45" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#4a1e3a" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="url(#oro)" strokeWidth="1.2" />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontStyle="italic"
        fill="url(#oro)"
      >
        AM
      </text>
      <path d="M20 46c6 3 18 3 24 0" stroke="url(#oro)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <Monograma />
      {!compacto && (
        <span className="leading-none">
          <span className="block font-titulo text-[1.35rem] italic text-ciruela-900">{marca.nombre}</span>
          <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-dorado-600">
            {marca.apellidoMarca}
          </span>
        </span>
      )}
    </span>
  );
}
