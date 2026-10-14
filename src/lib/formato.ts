import { ZONA_HORARIA } from "./marca";

// Bogotá es UTC-5 todo el año (no tiene horario de verano)
const DESFASE = "-05:00";

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatoPesos(valor: number) {
  return pesos.format(valor);
}

export function formatoDuracion(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? "1 hora" : `${h} horas`;
  return `${h} h ${m} min`;
}

function formatear(fecha: Date | string, opciones: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_HORARIA, ...opciones }).format(
    typeof fecha === "string" ? new Date(fecha) : fecha,
  );
}

/** "3:30 p. m." */
export function formatoHora(fecha: Date | string) {
  return formatear(fecha, { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "sábado, 18 de octubre" */
export function formatoFechaLarga(fecha: Date | string) {
  return formatear(fecha, { weekday: "long", day: "numeric", month: "long" });
}

/** "sáb 18 oct" */
export function formatoFechaCorta(fecha: Date | string) {
  return formatear(fecha, { weekday: "short", day: "numeric", month: "short" });
}

/** "octubre de 2026" */
export function formatoMesAnio(fecha: Date | string) {
  return formatear(fecha, { month: "long", year: "numeric" });
}

/** Fecha local de Bogotá como "YYYY-MM-DD" */
export function fechaLocal(fecha: Date | string = new Date()) {
  // en-CA produce exactamente "YYYY-MM-DD"
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof fecha === "string" ? new Date(fecha) : fecha);
}

/** Convierte "2026-10-18" + "14:30" (hora de Bogotá) a Date */
export function aFecha(fechaISO: string, hora = "00:00") {
  return new Date(`${fechaISO}T${hora.slice(0, 5)}:00${DESFASE}`);
}

/** Suma días a una fecha "YYYY-MM-DD" */
export function sumarDias(fechaISO: string, dias: number) {
  const d = new Date(`${fechaISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Día de la semana (0 domingo ... 6 sábado) de una fecha "YYYY-MM-DD" */
export function diaSemana(fechaISO: string) {
  return new Date(`${fechaISO}T12:00:00Z`).getUTCDay();
}

/** Lunes de la semana de una fecha "YYYY-MM-DD" */
export function inicioSemana(fechaISO: string) {
  const dia = diaSemana(fechaISO);
  return sumarDias(fechaISO, dia === 0 ? -6 : 1 - dia);
}

/** "08:00:00" -> "8:00 a. m." */
export function formatoHoraTexto(hora: string) {
  return formatoHora(aFecha("2026-01-01", hora));
}

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Enlaces para abrir una dirección en Google Maps y Waze */
export function enlacesMapa(direccion: string, ciudad?: string | null, lat?: number | null, lng?: number | null) {
  const consulta = encodeURIComponent([direccion, ciudad, "Colombia"].filter(Boolean).join(", "));
  const coords = lat != null && lng != null ? `${lat},${lng}` : null;
  return {
    google: coords
      ? `https://www.google.com/maps/dir/?api=1&destination=${coords}`
      : `https://www.google.com/maps/dir/?api=1&destination=${consulta}`,
    waze: coords ? `https://waze.com/ul?ll=${coords}&navigate=yes` : `https://waze.com/ul?q=${consulta}&navigate=yes`,
  };
}

export function enlaceWhatsapp(numero: string, mensaje: string) {
  const limpio = numero.replace(/\D/g, "");
  const conPais = limpio.length === 10 ? `57${limpio}` : limpio;
  return `https://wa.me/${conPais}?text=${encodeURIComponent(mensaje)}`;
}
