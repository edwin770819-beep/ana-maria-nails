import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServicio } from "@/lib/supabase/servidor";
import { eventoValido, traducirEstado, type EventoWompi, type TransaccionWompi } from "@/lib/wompi";

// Webhook de Wompi. Configurar en Wompi > Desarrolladores > URL de eventos:
//   https://<tu-dominio>/api/pagos/wompi/eventos
export async function POST(request: NextRequest) {
  const evento = (await request.json().catch(() => null)) as EventoWompi | null;
  if (!evento || !eventoValido(evento)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (evento.event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const transaccion = evento.data.transaction as TransaccionWompi | undefined;
  const estado = transaccion ? traducirEstado(transaccion.status) : null;
  if (!transaccion || !estado) return NextResponse.json({ ok: true });

  const supabase = crearClienteServicio();
  const { error } = await supabase.rpc("confirmar_pago_wompi", {
    p_referencia: transaccion.reference,
    p_estado: estado,
    p_transaccion: transaccion.id,
    p_metodo: transaccion.payment_method_type ?? null,
    p_monto: Math.round(transaccion.amount_in_cents / 100),
    p_detalle: transaccion,
  });

  // Respondemos 500 para que Wompi reintente si la base de datos falló
  if (error) return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
