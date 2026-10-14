// Componentes visuales base. No usan hooks: sirven en componentes de servidor y de cliente.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { EstadoCita, EstadoPago } from "@/lib/tipos";
import { ETIQUETA_ESTADO, ETIQUETA_PAGO } from "@/lib/tipos";

export function cx(...clases: (string | false | null | undefined)[]) {
  return clases.filter(Boolean).join(" ");
}

type Variante = "primario" | "secundario" | "fantasma" | "peligro" | "dorado";
type Tamano = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-ciruela-700 text-white hover:bg-ciruela-800 shadow-suave",
  secundario: "bg-white text-ciruela-800 ring-1 ring-ciruela-100 hover:bg-ciruela-50",
  fantasma: "text-ciruela-700 hover:bg-ciruela-50",
  peligro: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  dorado: "bg-dorado-500 text-white hover:bg-dorado-600 shadow-suave",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export function claseBoton(variante: Variante = "primario", tamano: Tamano = "md", extra?: string) {
  // Si se pide "hidden" (p. ej. "hidden md:inline-flex"), no forzar inline-flex o ganaría sobre hidden
  const display = extra && /(^|\s)hidden(\s|$)/.test(extra) ? "" : "inline-flex";
  return cx(
    display,
    "items-center justify-center rounded-full font-medium transition-colors",
    "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciruela-500",
    VARIANTES[variante],
    TAMANOS[tamano],
    extra,
  );
}

export function Boton({
  variante = "primario",
  tamano = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variante?: Variante; tamano?: Tamano }) {
  return <button className={claseBoton(variante, tamano, className)} {...props} />;
}

export function BotonEnlace({
  variante = "primario",
  tamano = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; tamano?: Tamano }) {
  return <Link className={claseBoton(variante, tamano, className)} {...props} />;
}

export function Tarjeta({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-3xl bg-marfil ring-1 ring-linea shadow-suave", className)} {...props} />;
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  children,
  className,
}: {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-tinta">{etiqueta}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-sm text-red-700">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-humo">{ayuda}</span>
      ) : null}
    </label>
  );
}

const claseEntrada =
  "w-full rounded-2xl border border-linea bg-white px-4 py-3 text-[0.95rem] text-tinta placeholder:text-humo/70 outline-none transition focus:border-ciruela-300 focus:ring-4 focus:ring-ciruela-100";

export function Entrada({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(claseEntrada, className)} {...props} />;
}

export function AreaTexto({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(claseEntrada, "min-h-24 resize-y", className)} {...props} />;
}

export function Selector({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx(claseEntrada, "appearance-none pr-10", className)} {...props} />;
}

const COLOR_ESTADO: Record<EstadoCita, string> = {
  pendiente_pago: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmada: "bg-ciruela-50 text-ciruela-700 ring-ciruela-100",
  en_camino: "bg-sky-50 text-sky-800 ring-sky-200",
  en_curso: "bg-violet-50 text-violet-800 ring-violet-200",
  completada: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelada: "bg-stone-100 text-stone-600 ring-stone-200",
  no_asistio: "bg-red-50 text-red-700 ring-red-200",
};

const COLOR_PAGO: Record<EstadoPago, string> = {
  sin_pago: "bg-stone-50 text-stone-600 ring-stone-200",
  anticipo: "bg-dorado-200/50 text-dorado-600 ring-dorado-200",
  pagado: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

export function Insignia({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1", className)}
      {...props}
    />
  );
}

export function InsigniaEstado({ estado }: { estado: EstadoCita }) {
  return <Insignia className={COLOR_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Insignia>;
}

export function InsigniaPago({ estado }: { estado: EstadoPago }) {
  return <Insignia className={COLOR_PAGO[estado]}>{ETIQUETA_PAGO[estado]}</Insignia>;
}

export function TituloSeccion({
  antetitulo,
  titulo,
  descripcion,
  className,
}: {
  antetitulo?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {antetitulo && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-dorado-600">{antetitulo}</p>
      )}
      <h2 className="font-titulo text-3xl leading-tight text-ciruela-900 sm:text-4xl">{titulo}</h2>
      {descripcion && <p className="mt-3 max-w-2xl text-humo">{descripcion}</p>}
    </div>
  );
}

export function Vacio({ icono, titulo, children }: { icono?: ReactNode; titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-ciruela-100 bg-white/60 px-6 py-12 text-center">
      {icono && <div className="mb-3 text-ciruela-300">{icono}</div>}
      <p className="font-titulo text-xl text-ciruela-900">{titulo}</p>
      {children && <div className="mt-2 max-w-md text-sm text-humo">{children}</div>}
    </div>
  );
}

export function Aviso({
  tipo = "info",
  children,
  className,
}: {
  tipo?: "info" | "exito" | "error" | "alerta";
  children: ReactNode;
  className?: string;
}) {
  const colores = {
    info: "bg-ciruela-50 text-ciruela-800 ring-ciruela-100",
    exito: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    alerta: "bg-amber-50 text-amber-900 ring-amber-200",
  }[tipo];
  return <div className={cx("rounded-2xl px-4 py-3 text-sm ring-1", colores, className)}>{children}</div>;
}

/** Imagen de un servicio o, si no tiene, un degradado elegante con su inicial. */
export function PortadaServicio({
  imagen,
  nombre,
  className,
}: {
  imagen?: string | null;
  nombre: string;
  className?: string;
}) {
  if (imagen) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imagen} alt={nombre} className={cx("h-full w-full object-cover", className)} />;
  }
  return (
    <div
      className={cx(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-rubor-200 via-rubor-100 to-dorado-200",
        className,
      )}
    >
      <span className="font-titulo text-5xl text-ciruela-700/40">{nombre.charAt(0)}</span>
    </div>
  );
}
