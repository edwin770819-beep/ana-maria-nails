"use server";

import { revalidatePath } from "next/cache";
import { obtenerPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function cancelarCita(
  citaId: string,
  motivo: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cancelar_cita", { p_cita: citaId, p_motivo: motivo || null });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/mis-citas");
  revalidatePath(`/mis-citas/${citaId}`);
  return { ok: true };
}
