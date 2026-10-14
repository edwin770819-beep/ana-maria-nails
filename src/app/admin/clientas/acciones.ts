"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { mensajeError, textoForm, type Resultado } from "../_componentes/resultado";

export async function alternarFrecuente(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const id = textoForm(fd, "id");
  const { error } = await supabase
    .from("perfiles")
    .update({ frecuente_manual: textoForm(fd, "frecuente") !== "true" })
    .eq("id", id);
  if (error) return { ok: false, error: mensajeError(error) };
  revalidatePath("/admin/clientas", "layout");
  return { ok: true };
}

export async function guardarNota(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("notas_clientas").upsert({
    cliente_id: textoForm(fd, "id"),
    nota: textoForm(fd, "nota") || null,
    actualizado_en: new Date().toISOString(),
  });
  if (error) return { ok: false, error: mensajeError(error) };
  revalidatePath(`/admin/clientas/${textoForm(fd, "id")}`);
  return { ok: true, mensaje: "Nota guardada ♡" };
}
