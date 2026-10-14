import { aFecha, sumarDias } from "@/lib/formato";
import type { ExcepcionHorario, HorarioSemanal } from "@/lib/tipos";

/** Minutos desde la medianoche (hora de Bogotá, UTC-5) de una fecha ISO. */
export function minutosLocales(iso: string) {
  const d = new Date(iso);
  return ((d.getUTCHours() - 5 + 24) % 24) * 60 + d.getUTCMinutes();
}

/** "08:30:00" -> 510 */
export function horaAMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Primer día del mes de una fecha "YYYY-MM-DD". */
export function primeroDelMes(fecha: string) {
  return `${fecha.slice(0, 7)}-01`;
}

/** Primer día del mes desplazado n meses. */
export function sumarMeses(fecha: string, n: number) {
  const [a, m] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + n, 1)).toISOString().slice(0, 10);
}

/** Rango en ISO (UTC) para consultar desde una fecha local hasta otra (exclusiva). */
export function rangoISO(desde: string, hastaExclusiva: string) {
  return { desde: aFecha(desde).toISOString(), hasta: aFecha(hastaExclusiva).toISOString() };
}

export function esFechaValida(valor: unknown): valor is string {
  return typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(valor));
}

export function diasEntre(desde: string, cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => sumarDias(desde, i));
}

export type Ventanas = {
  diaBloqueado: boolean;
  abiertas: [number, number][];
  bloqueadas: [number, number][];
};

/** Franjas habilitadas y bloqueadas de un día, en minutos locales. */
export function ventanasDelDia(fecha: string, horario: HorarioSemanal[], excepciones: ExcepcionHorario[]): Ventanas {
  const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  const delDia = excepciones.filter((e) => e.fecha === fecha);
  const diaBloqueado = delDia.some((e) => e.tipo === "bloqueado" && !e.hora_inicio);
  const abiertas: [number, number][] = [];
  if (!diaBloqueado) {
    horario
      .filter((h) => h.dia_semana === dia)
      .forEach((h) => abiertas.push([horaAMinutos(h.hora_inicio), horaAMinutos(h.hora_fin)]));
  }
  delDia
    .filter((e) => e.tipo === "disponible" && e.hora_inicio && e.hora_fin)
    .forEach((e) => abiertas.push([horaAMinutos(e.hora_inicio!), horaAMinutos(e.hora_fin!)]));
  const bloqueadas = delDia
    .filter((e) => e.tipo === "bloqueado" && e.hora_inicio && e.hora_fin)
    .map((e) => [horaAMinutos(e.hora_inicio!), horaAMinutos(e.hora_fin!)] as [number, number]);
  return { diaBloqueado, abiertas, bloqueadas };
}

/** "3:30" y "p. m." por separado, para mostrar la hora en grande. */
export function partesHora(iso: string) {
  const minutos = minutosLocales(iso);
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { hora: `${h12}:${String(m).padStart(2, "0")}`, sufijo: h < 12 ? "a. m." : "p. m." };
}
