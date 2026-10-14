import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BotonEnlace, Tarjeta, cx } from "@/components/ui";
import {
  aFecha,
  fechaLocal,
  formatoFechaCorta,
  formatoFechaLarga,
  formatoMesAnio,
  formatoPesos,
  inicioSemana,
  sumarDias,
} from "@/lib/formato";
import { citasEnRango, disponibilidadEnRango } from "./_componentes/datos";
import { diasEntre, esFechaValida, primeroDelMes, sumarMeses } from "./_componentes/tiempo";
import { VistaDia, VistaMes, VistaSemana } from "./_componentes/vistas-agenda";

export const metadata = { title: "Agenda" };

type Vista = "dia" | "semana" | "mes";

export default async function PaginaAgenda({ searchParams }: PageProps<"/admin">) {
  const params = await searchParams;
  const vista: Vista = params.vista === "semana" || params.vista === "mes" ? params.vista : "dia";
  const hoy = fechaLocal();
  const fecha = esFechaValida(params.fecha) ? params.fecha : hoy;
  const conCanceladas = params.canceladas === "1";

  // Rango de fechas según la vista
  let desde: string;
  let dias: string[];
  let anterior: string;
  let siguiente: string;
  let titulo: string;

  if (vista === "dia") {
    desde = fecha;
    dias = [fecha];
    anterior = sumarDias(fecha, -1);
    siguiente = sumarDias(fecha, 1);
    titulo = formatoFechaLarga(aFecha(fecha, "12:00"));
  } else if (vista === "semana") {
    desde = inicioSemana(fecha);
    dias = diasEntre(desde, 7);
    anterior = sumarDias(desde, -7);
    siguiente = sumarDias(desde, 7);
    titulo = `${formatoFechaCorta(aFecha(dias[0], "12:00"))} – ${formatoFechaCorta(aFecha(dias[6], "12:00"))}`;
  } else {
    const primero = primeroDelMes(fecha);
    const ultimo = sumarDias(sumarMeses(primero, 1), -1);
    desde = inicioSemana(primero);
    const totalDias = Math.ceil(((Date.parse(ultimo) - Date.parse(desde)) / 86400000 + 1) / 7) * 7;
    dias = diasEntre(desde, totalDias);
    anterior = sumarMeses(primero, -1);
    siguiente = sumarMeses(primero, 1);
    titulo = formatoMesAnio(aFecha(primero, "12:00"));
  }
  const hasta = sumarDias(dias[dias.length - 1], 1);

  const [citas, disp] = await Promise.all([
    citasEnRango(desde, hasta, conCanceladas || vista === "dia"),
    disponibilidadEnRango(desde, hasta),
  ]);

  // Resumen del periodo visible (en mes, solo los días del mes)
  const delPeriodo = citas.filter(
    (c) =>
      c.estado !== "cancelada" &&
      c.estado !== "no_asistio" &&
      (vista !== "mes" || fechaLocal(c.inicio).slice(0, 7) === fecha.slice(0, 7)),
  );
  const esperado = delPeriodo.reduce((s, c) => s + c.precio, 0);
  const cobrado = delPeriodo.reduce((s, c) => s + c.monto_pagado, 0);

  const url = (cambios: Record<string, string | null>) => {
    const p = new URLSearchParams({ vista, fecha, ...(conCanceladas ? { canceladas: "1" } : {}) });
    Object.entries(cambios).forEach(([k, v]) => (v === null ? p.delete(k) : p.set(k, v)));
    return `/admin?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dorado-600">Tu agenda</p>
          <h1 className="font-titulo text-3xl capitalize text-ciruela-900 sm:text-4xl">{titulo}</h1>
        </div>
        <BotonEnlace href={`/admin/citas/nueva?fecha=${fecha}`} tamano="sm" className="hidden md:inline-flex">
          <Plus className="size-4" /> Nueva cita
        </BotonEnlace>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-linea">
          {(["dia", "semana", "mes"] as Vista[]).map((v) => (
            <Link
              key={v}
              href={url({ vista: v })}
              className={cx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                v === vista ? "bg-ciruela-700 text-white" : "text-humo hover:text-ciruela-700",
              )}
            >
              {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={url({ fecha: anterior })}
            aria-label="Anterior"
            className="flex size-9 items-center justify-center rounded-full bg-white ring-1 ring-linea hover:bg-ciruela-50"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={url({ fecha: hoy })}
            className={cx(
              "rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-linea",
              fecha === hoy ? "bg-ciruela-50 text-ciruela-700" : "bg-white hover:bg-ciruela-50",
            )}
          >
            Hoy
          </Link>
          <Link
            href={url({ fecha: siguiente })}
            aria-label="Siguiente"
            className="flex size-9 items-center justify-center rounded-full bg-white ring-1 ring-linea hover:bg-ciruela-50"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { etiqueta: vista === "dia" ? "Citas del día" : "Citas", valor: String(delPeriodo.length) },
          { etiqueta: "Ingreso esperado", valor: formatoPesos(esperado) },
          { etiqueta: "Ya cobrado", valor: formatoPesos(cobrado), color: "text-emerald-700" },
          { etiqueta: "Por cobrar", valor: formatoPesos(Math.max(esperado - cobrado, 0)), color: "text-ciruela-700" },
        ].map((r) => (
          <Tarjeta key={r.etiqueta} className="p-4">
            <p className="text-xs text-humo">{r.etiqueta}</p>
            <p className={cx("mt-1 font-titulo text-2xl sm:text-3xl", r.color ?? "text-ciruela-900")}>{r.valor}</p>
          </Tarjeta>
        ))}
      </div>

      {vista !== "dia" && (
        <Link
          href={url({ canceladas: conCanceladas ? null : "1" })}
          className="inline-block text-xs font-medium text-humo underline-offset-2 hover:underline"
        >
          {conCanceladas ? "Ocultar citas canceladas" : "Mostrar citas canceladas"}
        </Link>
      )}

      {vista === "dia" && <VistaDia fecha={fecha} citas={citas} disp={disp} />}
      {vista === "semana" && <VistaSemana dias={dias} citas={citas} disp={disp} />}
      {vista === "mes" && <VistaMes mes={fecha} dias={dias} citas={citas} />}
    </div>
  );
}
