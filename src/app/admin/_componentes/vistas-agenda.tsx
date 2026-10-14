import Link from "next/link";
import { CalendarHeart, Share2 } from "lucide-react";
import { Tarjeta, Vacio, cx } from "@/components/ui";
import { DIAS_SEMANA, fechaLocal, formatoFechaLarga, formatoHora, aFecha } from "@/lib/formato";
import type { ExcepcionHorario, HorarioSemanal } from "@/lib/tipos";
import { nombreClienta, type CitaAgenda } from "./datos";
import { TarjetaCita } from "./tarjeta-cita";
import { minutosLocales, ventanasDelDia } from "./tiempo";

type Disponibilidad = { horario: HorarioSemanal[]; excepciones: ExcepcionHorario[] };

const COLOR_BLOQUE: Record<string, string> = {
  pendiente_pago: "bg-amber-100 text-amber-900 ring-amber-300",
  confirmada: "bg-ciruela-100 text-ciruela-900 ring-ciruela-300",
  en_camino: "bg-sky-100 text-sky-900 ring-sky-300",
  en_curso: "bg-violet-100 text-violet-900 ring-violet-300",
  completada: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelada: "bg-stone-100 text-stone-500 ring-stone-200 line-through",
  no_asistio: "bg-red-100 text-red-800 ring-red-200",
};

const enlaceDia = (fecha: string) => `/admin?vista=dia&fecha=${fecha}`;

/* ------------------------------------------------------------------ */
/* Vista DÍA: la ruta del día                                          */
/* ------------------------------------------------------------------ */
export function VistaDia({ fecha, citas, disp }: { fecha: string; citas: CitaAgenda[]; disp: Disponibilidad }) {
  const ventanas = ventanasDelDia(fecha, disp.horario, disp.excepciones);
  const activas = citas.filter((c) => c.estado !== "cancelada" && c.estado !== "no_asistio");

  const itinerario = [
    `Mi ruta de hoy, ${formatoFechaLarga(aFecha(fecha, "12:00"))} 💅`,
    "",
    ...activas.map(
      (c, i) =>
        `${i + 1}. ${formatoHora(c.inicio)} - ${formatoHora(c.fin)} · ${nombreClienta(c)}\n   ${[
          c.direccion_texto,
          c.barrio,
          c.ciudad,
        ]
          .filter(Boolean)
          .join(", ")}`,
    ),
    "",
    "Te aviso cuando termine ♡",
  ].join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-humo">
          {ventanas.diaBloqueado
            ? "Día bloqueado en tu disponibilidad."
            : ventanas.abiertas.length
              ? `Disponible: ${ventanas.abiertas
                  .map(([a, b]) => `${formatoHora(aFecha(fecha, hhmm(a)))} – ${formatoHora(aFecha(fecha, hhmm(b)))}`)
                  .join(" y ")}`
              : "Sin horario habilitado este día."}
        </p>
        {activas.length > 0 && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(itinerario)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-suave hover:bg-emerald-700"
          >
            <Share2 className="size-4" /> Compartir mi ruta de hoy
          </a>
        )}
      </div>

      {citas.length === 0 ? (
        <Vacio icono={<CalendarHeart className="size-10" />} titulo="Día libre de citas">
          Cuando tus clientas agenden, verás aquí tu ruta en orden con direcciones y accesos a Maps y Waze.
        </Vacio>
      ) : (
        <div className="space-y-4">
          {citas.map((c, i) => (
            <TarjetaCita key={c.id} cita={c} orden={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function hhmm(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Vista SEMANA                                                        */
/* ------------------------------------------------------------------ */
const HORA_INICIO = 6;
const HORA_FIN = 21;
const ALTO_HORA = 52; // px

export function VistaSemana({ dias, citas, disp }: { dias: string[]; citas: CitaAgenda[]; disp: Disponibilidad }) {
  const hoy = fechaLocal();
  const porDia = new Map<string, CitaAgenda[]>();
  dias.forEach((d) => porDia.set(d, []));
  citas.forEach((c) => porDia.get(fechaLocal(c.inicio))?.push(c));
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
  const alto = (HORA_FIN - HORA_INICIO) * ALTO_HORA;
  const aPx = (min: number) => ((min - HORA_INICIO * 60) / 60) * ALTO_HORA;

  return (
    <>
      {/* Celular: lista por día */}
      <div className="space-y-3 md:hidden">
        {dias.map((d) => {
          const lista = porDia.get(d) ?? [];
          return (
            <Link key={d} href={enlaceDia(d)} className="block">
              <Tarjeta className={cx("p-4", d === hoy && "ring-2 ring-ciruela-300")}>
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{formatoFechaLarga(aFecha(d, "12:00"))}</p>
                  <span className="text-xs text-humo">
                    {lista.length} {lista.length === 1 ? "cita" : "citas"}
                  </span>
                </div>
                {lista.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {lista.map((c) => (
                      <li
                        key={c.id}
                        className={cx("flex justify-between gap-2 rounded-xl px-3 py-1.5 text-sm ring-1", COLOR_BLOQUE[c.estado])}
                      >
                        <span className="truncate">
                          {formatoHora(c.inicio)} · {nombreClienta(c)}
                        </span>
                        <span className="shrink-0 truncate text-xs opacity-75">{c.servicio_nombre}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>
            </Link>
          );
        })}
      </div>

      {/* PC: cuadrícula con horas */}
      <Tarjeta className="hidden overflow-hidden md:block">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-linea bg-marfil">
          <div />
          {dias.map((d, i) => (
            <Link
              key={d}
              href={enlaceDia(d)}
              className={cx("py-3 text-center hover:bg-rubor-50", d === hoy && "bg-ciruela-50")}
            >
              <p className="text-xs uppercase tracking-wider text-humo">{DIAS_SEMANA[(i + 1) % 7].slice(0, 3)}</p>
              <p className={cx("font-titulo text-2xl", d === hoy ? "text-ciruela-700" : "text-tinta")}>
                {Number(d.slice(8))}
              </p>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]" style={{ height: alto }}>
          <div className="relative">
            {horas.map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[0.65rem] text-humo"
                style={{ top: (h - HORA_INICIO) * ALTO_HORA }}
              >
                {h === 12 ? "12 m" : h > 12 ? `${h - 12} pm` : `${h} am`}
              </span>
            ))}
          </div>
          {dias.map((d) => {
            const v = ventanasDelDia(d, disp.horario, disp.excepciones);
            return (
              <div key={d} className="relative border-l border-linea">
                {horas.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-linea/60"
                    style={{ top: (h - HORA_INICIO) * ALTO_HORA }}
                  />
                ))}
                {v.abiertas.map(([a, b], i) => (
                  <div
                    key={`a${i}`}
                    className="absolute inset-x-0 bg-rubor-50/80"
                    style={{ top: aPx(a), height: aPx(b) - aPx(a) }}
                  />
                ))}
                {v.bloqueadas.map(([a, b], i) => (
                  <div
                    key={`b${i}`}
                    className="absolute inset-x-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgb(0_0_0/0.04)_6px,rgb(0_0_0/0.04)_12px)]"
                    style={{ top: aPx(a), height: aPx(b) - aPx(a) }}
                  />
                ))}
                {(porDia.get(d) ?? []).map((c) => {
                  const ini = minutosLocales(c.inicio);
                  const fin = minutosLocales(c.fin);
                  const top = Math.max(aPx(ini), 0);
                  return (
                    <Link
                      key={c.id}
                      href={enlaceDia(d)}
                      className={cx(
                        "absolute inset-x-1 overflow-hidden rounded-lg px-1.5 py-1 text-[0.7rem] leading-tight ring-1 hover:z-10 hover:shadow-suave",
                        COLOR_BLOQUE[c.estado],
                      )}
                      style={{ top, height: Math.max(aPx(fin) - top, 22) }}
                    >
                      <p className="font-semibold">{formatoHora(c.inicio)}</p>
                      <p className="truncate">{nombreClienta(c)}</p>
                      <p className="truncate opacity-75">{c.servicio_nombre}</p>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Tarjeta>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Vista MES                                                           */
/* ------------------------------------------------------------------ */
export function VistaMes({ mes, dias, citas }: { mes: string; dias: string[]; citas: CitaAgenda[] }) {
  const hoy = fechaLocal();
  const porDia = new Map<string, CitaAgenda[]>();
  citas.forEach((c) => {
    const d = fechaLocal(c.inicio);
    porDia.set(d, [...(porDia.get(d) ?? []), c]);
  });

  return (
    <Tarjeta className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-linea bg-marfil text-center text-[0.68rem] font-semibold uppercase tracking-wider text-humo">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="py-2.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d) => {
          const lista = (porDia.get(d) ?? []).filter((c) => c.estado !== "cancelada");
          const delMes = d.slice(0, 7) === mes.slice(0, 7);
          return (
            <Link
              key={d}
              href={enlaceDia(d)}
              className={cx(
                "min-h-16 border-b border-r border-linea p-1.5 transition hover:bg-rubor-50 sm:min-h-24 sm:p-2",
                !delMes && "bg-stone-50/60 text-humo/60",
              )}
            >
              <span
                className={cx(
                  "inline-flex size-7 items-center justify-center rounded-full text-sm",
                  d === hoy && "bg-ciruela-700 font-semibold text-white",
                )}
              >
                {Number(d.slice(8))}
              </span>
              {lista.length > 0 && (
                <>
                  {/* Celular: puntos */}
                  <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {lista.slice(0, 4).map((c) => (
                      <span key={c.id} className="size-1.5 rounded-full bg-ciruela-500" />
                    ))}
                    {lista.length > 4 && <span className="text-[0.6rem] leading-none">+</span>}
                  </div>
                  {/* PC: mini lista */}
                  <ul className="mt-1 hidden space-y-0.5 sm:block">
                    {lista.slice(0, 3).map((c) => (
                      <li
                        key={c.id}
                        className={cx("truncate rounded-md px-1.5 py-0.5 text-[0.68rem] ring-1", COLOR_BLOQUE[c.estado])}
                      >
                        {formatoHora(c.inicio)} {nombreClienta(c).split(" ")[0]}
                      </li>
                    ))}
                    {lista.length > 3 && <li className="px-1 text-[0.68rem] text-humo">+{lista.length - 3} más</li>}
                  </ul>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </Tarjeta>
  );
}
