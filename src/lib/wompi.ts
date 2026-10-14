import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Integración con Wompi (Bancolombia): Web Checkout + eventos (webhook).
// Documentación: https://docs.wompi.co

const LLAVE_PUBLICA = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
const SECRETO_INTEGRIDAD = process.env.WOMPI_INTEGRITY_SECRET ?? "";
const SECRETO_EVENTOS = process.env.WOMPI_EVENTS_SECRET ?? "";

export const wompiEsPruebas = LLAVE_PUBLICA.startsWith("pub_test_");
const API = wompiEsPruebas ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";

/** true si las llaves necesarias para cobrar están configuradas. */
export function wompiConfigurado() {
  return Boolean(LLAVE_PUBLICA && SECRETO_INTEGRIDAD);
}

function sha256(texto: string) {
  return createHash("sha256").update(texto).digest("hex");
}

/** Firma de integridad: SHA256(referencia + monto_en_centavos + moneda + secreto). */
export function firmaIntegridad(referencia: string, montoEnCentavos: number, moneda = "COP") {
  return sha256(`${referencia}${montoEnCentavos}${moneda}${SECRETO_INTEGRIDAD}`);
}

export function urlCheckout(opciones: {
  referencia: string;
  montoPesos: number;
  urlRetorno: string;
  correo?: string | null;
  nombre?: string | null;
  telefono?: string | null;
}) {
  const centavos = Math.round(opciones.montoPesos * 100);
  const params = new URLSearchParams({
    "public-key": LLAVE_PUBLICA,
    currency: "COP",
    "amount-in-cents": String(centavos),
    reference: opciones.referencia,
    "signature:integrity": firmaIntegridad(opciones.referencia, centavos),
    "redirect-url": opciones.urlRetorno,
  });
  if (opciones.correo) params.set("customer-data:email", opciones.correo);
  if (opciones.nombre) params.set("customer-data:full-name", opciones.nombre);
  if (opciones.telefono) {
    const limpio = opciones.telefono.replace(/\D/g, "").slice(-10);
    if (limpio.length === 10) {
      params.set("customer-data:phone-number", limpio);
      params.set("customer-data:phone-number-prefix", "+57");
    }
  }
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

export type EstadoPagoWompi = "aprobado" | "rechazado" | "anulado" | "error";

/** Traduce el estado de Wompi al de nuestra tabla `pagos`. PENDING devuelve null. */
export function traducirEstado(estado: string): EstadoPagoWompi | null {
  switch (estado) {
    case "APPROVED":
      return "aprobado";
    case "DECLINED":
      return "rechazado";
    case "VOIDED":
      return "anulado";
    case "ERROR":
      return "error";
    default:
      return null;
  }
}

export interface TransaccionWompi {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_method_type?: string;
  [clave: string]: unknown;
}

/** Consulta una transacción directamente en Wompi (fuente confiable). */
export async function consultarTransaccion(id: string): Promise<TransaccionWompi | null> {
  try {
    const res = await fetch(`${API}/transactions/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const cuerpo = (await res.json()) as { data?: TransaccionWompi };
    return cuerpo.data ?? null;
  } catch {
    return null;
  }
}

interface EventoWompi {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  signature: { properties: string[]; checksum: string };
}

/**
 * Valida el checksum de un evento: SHA256(valores de signature.properties
 * tomados de `data` + timestamp + secreto de eventos).
 */
export function eventoValido(evento: EventoWompi) {
  if (!SECRETO_EVENTOS || !evento?.signature?.properties || !evento.signature.checksum) return false;
  const valores = evento.signature.properties
    .map((ruta) =>
      ruta.split(".").reduce<unknown>((obj, clave) => (obj as Record<string, unknown> | undefined)?.[clave], evento.data),
    )
    .map((v) => String(v ?? ""))
    .join("");
  const calculado = Buffer.from(sha256(`${valores}${evento.timestamp}${SECRETO_EVENTOS}`));
  const recibido = Buffer.from(String(evento.signature.checksum).toLowerCase());
  return calculado.length === recibido.length && timingSafeEqual(calculado, recibido);
}

export type { EventoWompi };
