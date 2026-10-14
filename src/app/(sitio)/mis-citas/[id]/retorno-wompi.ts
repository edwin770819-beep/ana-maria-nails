import "server-only";
import { crearClienteServicio } from "@/lib/supabase/servidor";
import { consultarTransaccion, traducirEstado, wompiConfigurado } from "@/lib/wompi";

export type ResultadoRetorno = "aprobado" | "rechazado" | "anulado" | "error" | "pendiente" | null;

/**
 * Cuando la clienta vuelve del checkout (?id=<transacción>), consultamos la
 * transacción en Wompi y la registramos. Es idempotente: el webhook puede
 * llegar antes o después y no se duplica el pago.
 */
export async function procesarRetornoWompi(transaccionId: string, citaId: string): Promise<ResultadoRetorno> {
  if (!wompiConfigurado()) return null;
  const transaccion = await consultarTransaccion(transaccionId);
  if (!transaccion) return null;

  const servicio = crearClienteServicio();
  const { data: pago } = await servicio
    .from("pagos")
    .select("cita_id")
    .eq("referencia", transaccion.reference)
    .single<{ cita_id: string }>();
  if (!pago || pago.cita_id !== citaId) return null;

  const estado = traducirEstado(transaccion.status);
  if (!estado) return "pendiente";

  await servicio.rpc("confirmar_pago_wompi", {
    p_referencia: transaccion.reference,
    p_estado: estado,
    p_transaccion: transaccion.id,
    p_metodo: transaccion.payment_method_type ?? null,
    p_monto: Math.round(transaccion.amount_in_cents / 100),
    p_detalle: transaccion,
  });
  return estado;
}
