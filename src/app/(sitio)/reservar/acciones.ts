"use server";

import { revalidatePath } from "next/cache";
import { obtenerPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Cita, Modalidad } from "@/lib/tipos";

export async function reservar(datos: {
  servicioId: string;
  inicio: string;
  direccionId: string | null;
  modalidad: Modalidad;
  notas: string;
  disenoId: string | null;
  fotoReferencia: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };

  // La foto de referencia debe estar en la carpeta de la propia clienta
  if (datos.fotoReferencia && !datos.fotoReferencia.startsWith(`${perfil.id}/`)) {
    return { ok: false, error: "Foto de referencia no válida" };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("reservar_cita", {
    p_servicio: datos.servicioId,
    p_inicio: datos.inicio,
    p_direccion: datos.modalidad === "domicilio" ? datos.direccionId : null,
    p_modalidad: datos.modalidad,
    p_notas: datos.notas || null,
    p_diseno: datos.disenoId,
    p_foto_referencia: datos.fotoReferencia,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No pudimos agendar tu cita. Intenta de nuevo." };
  }

  revalidatePath("/mis-citas");
  return { ok: true, id: (data as Cita).id };
}
