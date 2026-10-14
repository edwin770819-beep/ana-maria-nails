import { CalendarOff, CalendarPlus, Trash2, X } from "lucide-react";
import { Campo, Entrada, Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { DIAS_SEMANA, aFecha, fechaLocal, formatoFechaLarga, formatoHoraTexto } from "@/lib/formato";
import type { ExcepcionHorario, HorarioSemanal } from "@/lib/tipos";
import { BotonEnviar, FormularioAccion } from "../_componentes/formulario-accion";
import { agregarBloque, quitarBloque, quitarExcepcion } from "./acciones";
import { FormularioExcepcion } from "./formulario-excepcion";

export const metadata = { title: "Disponibilidad" };

const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

export default async function PaginaDisponibilidad() {
  const supabase = await crearClienteServidor();
  const [{ data: horario }, { data: excepciones }] = await Promise.all([
    supabase.from("horario_semanal").select("*").order("hora_inicio"),
    supabase.from("excepciones_horario").select("*").gte("fecha", fechaLocal()).order("fecha").order("hora_inicio"),
  ]);
  const bloques = (horario ?? []) as HorarioSemanal[];
  const proximas = (excepciones ?? []) as ExcepcionHorario[];

  return (
    <div className="space-y-8">
      <TituloSeccion
        antetitulo="Tu tiempo"
        titulo="Disponibilidad"
        descripcion="Define tu horario habitual. Las clientas solo verán los espacios que habilites aquí, y la app deja automáticamente el tiempo de traslado entre domicilios."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* Horario semanal */}
        <Tarjeta className="p-5 sm:p-6">
          <h2 className="font-titulo text-2xl text-ciruela-900">Horario semanal</h2>
          <p className="mt-1 text-sm text-humo">Puedes tener varios bloques por día (ej. 8–12 y 2–6).</p>
          <ul className="mt-5 divide-y divide-linea">
            {ORDEN_DIAS.map((dia) => {
              const delDia = bloques.filter((b) => b.dia_semana === dia);
              return (
                <li key={dia} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 font-medium">{DIAS_SEMANA[dia]}</span>
                    {delDia.length === 0 && <span className="text-sm text-humo">No atiendes</span>}
                    {delDia.map((b) => (
                      <FormularioAccion key={b.id} accion={quitarBloque} className="inline">
                        <input type="hidden" name="id" value={b.id} />
                        <span className="inline-flex items-center gap-1 rounded-full bg-ciruela-50 py-1 pl-3 pr-1 text-sm text-ciruela-800 ring-1 ring-ciruela-100">
                          {formatoHoraTexto(b.hora_inicio)} – {formatoHoraTexto(b.hora_fin)}
                          <button
                            type="submit"
                            aria-label="Quitar bloque"
                            className="flex size-6 items-center justify-center rounded-full hover:bg-ciruela-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      </FormularioAccion>
                    ))}
                  </div>
                  <details className="group mt-2">
                    <summary className="cursor-pointer list-none text-xs font-medium text-ciruela-600 hover:underline">
                      + Agregar horario
                    </summary>
                    <FormularioAccion accion={agregarBloque} className="mt-2 flex flex-wrap items-end gap-2">
                      <input type="hidden" name="dia_semana" value={dia} />
                      <Campo etiqueta="Desde" className="w-32">
                        <Entrada type="time" name="hora_inicio" defaultValue="08:00" required />
                      </Campo>
                      <Campo etiqueta="Hasta" className="w-32">
                        <Entrada type="time" name="hora_fin" defaultValue="17:00" required />
                      </Campo>
                      <BotonEnviar tamano="sm" className="mb-1.5">
                        Agregar
                      </BotonEnviar>
                    </FormularioAccion>
                  </details>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        {/* Excepciones */}
        <div className="space-y-6">
          <Tarjeta className="p-5 sm:p-6">
            <h2 className="font-titulo text-2xl text-ciruela-900">Días especiales</h2>
            <p className="mt-1 text-sm text-humo">
              ¿Te queda tiempo un domingo o antes de las 8? Ábrelo. ¿Una cita médica o vacaciones? Bloquéalo.
            </p>
            <FormularioExcepcion />
          </Tarjeta>

          <Tarjeta className="p-5 sm:p-6">
            <h2 className="font-titulo text-xl text-ciruela-900">Próximos días especiales</h2>
            {proximas.length === 0 ? (
              <div className="mt-4">
                <Vacio titulo="Sin días especiales">Tu horario semanal aplica todos los días.</Vacio>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {proximas.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-linea">
                    <span
                      className={
                        e.tipo === "disponible"
                          ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"
                          : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600"
                      }
                    >
                      {e.tipo === "disponible" ? <CalendarPlus className="size-4" /> : <CalendarOff className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">{formatoFechaLarga(aFecha(e.fecha, "12:00"))}</p>
                      <p className="truncate text-xs text-humo">
                        {e.tipo === "disponible" ? "Espacio extra" : "Bloqueado"} ·{" "}
                        {e.hora_inicio && e.hora_fin
                          ? `${formatoHoraTexto(e.hora_inicio)} – ${formatoHoraTexto(e.hora_fin)}`
                          : "todo el día"}
                        {e.nota && ` · ${e.nota}`}
                      </p>
                    </div>
                    <FormularioAccion accion={quitarExcepcion}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        aria-label="Quitar"
                        className="flex size-9 items-center justify-center rounded-full text-humo hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </FormularioAccion>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
