"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { EstadoCita } from "@/lib/tipos";
import { mensajeError, type Resultado } from "./_componentes/resultado";

const ESTADOS_PERMITIDOS: EstadoCita[] = ["confirmada", "en_camino", "en_curso", "completada", "no_asistio"];

export async function cambiarEstadoCita(id: string, estado: EstadoCita): Promise<Resultado> {
  await exigirAdmin();
  if (!ESTADOS_PERMITIDOS.includes(estado)) return { ok: false, error: "Estado no válido." };
  const supabase = await crearClienteServidor();
  const cambios: Record<string, unknown> = { estado };
  // Al confirmar manualmente, la cita deja de vencer por falta de pago
  if (estado === "confirmada") cambios.expira_en = null;
  const { error } = await supabase.from("citas").update(cambios).eq("id", id);
  if (error) return { ok: false, error: mensajeError(error) };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function cancelarCitaAdmin(id: string, motivo: string): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cancelar_cita", { p_cita: id, p_motivo: motivo || null });
  if (error) return { ok: false, error: mensajeError(error, "No se pudo cancelar la cita.") };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function registrarPagoManual(id: string, monto: number, metodo: string): Promise<Resultado> {
  await exigirAdmin();
  if (!Number.isFinite(monto) || monto <= 0) return { ok: false, error: "Escribe un monto válido." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("registrar_pago_manual", {
    p_cita: id,
    p_monto: Math.round(monto),
    p_metodo: metodo,
  });
  if (error) return { ok: false, error: mensajeError(error, "No se pudo registrar el pago.") };
  revalidatePath("/admin", "layout");
  return { ok: true };
}
