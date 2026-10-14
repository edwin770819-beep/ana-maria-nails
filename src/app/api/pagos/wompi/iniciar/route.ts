import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServicio, crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerPerfil } from "@/lib/sesion";
import { urlCheckout, wompiConfigurado } from "@/lib/wompi";
import type { Ajustes, Cita } from "@/lib/tipos";

type Tipo = "anticipo" | "total" | "saldo";

// Crea un intento de pago y devuelve la URL del Web Checkout de Wompi.
export async function POST(request: NextRequest) {
  const perfil = await obtenerPerfil();
  if (!perfil) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  if (!wompiConfigurado()) {
    return NextResponse.json({ error: "Los pagos en línea aún no están activos" }, { status: 503 });
  }

  const { citaId, tipo } = (await request.json().catch(() => ({}))) as { citaId?: string; tipo?: Tipo };
  if (!citaId || !tipo || !["anticipo", "total", "saldo"].includes(tipo)) {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  // Con RLS: solo devuelve la cita si es de esta clienta
  const supabase = await crearClienteServidor();
  const [{ data: cita }, { data: ajustes }] = await Promise.all([
    supabase.from("citas").select("*").eq("id", citaId).eq("cliente_id", perfil.id).single<Cita>(),
    supabase.from("ajustes").select("*").eq("id", 1).single<Ajustes>(),
  ]);

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  if (!ajustes?.pagos_en_linea) {
    return NextResponse.json({ error: "Los pagos en línea aún no están activos" }, { status: 503 });
  }
  if (["cancelada", "no_asistio"].includes(cita.estado)) {
    return NextResponse.json({ error: "Esta cita ya no admite pagos" }, { status: 409 });
  }

  const pendiente = cita.precio - cita.monto_pagado;
  let monto = 0;
  if (tipo === "anticipo") {
    if (cita.monto_pagado > 0 || cita.monto_anticipo <= 0) {
      return NextResponse.json({ error: "El anticipo ya no aplica para esta cita" }, { status: 409 });
    }
    monto = cita.monto_anticipo;
  } else {
    monto = pendiente;
  }
  if (monto <= 0) return NextResponse.json({ error: "Esta cita ya está paga" }, { status: 409 });

  const referencia = `AM-${cita.id.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase();

  const servicio = crearClienteServicio();
  const { error } = await servicio.from("pagos").insert({
    cita_id: cita.id,
    referencia,
    tipo,
    proveedor: "wompi",
    monto,
    estado: "pendiente",
  });
  if (error) return NextResponse.json({ error: "No pudimos iniciar el pago" }, { status: 500 });

  const origen = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const url = urlCheckout({
    referencia,
    montoPesos: monto,
    urlRetorno: `${origen}/mis-citas/${cita.id}`,
    correo: perfil.email,
    nombre: perfil.nombre,
    telefono: perfil.telefono,
  });

  return NextResponse.json({ url });
}
