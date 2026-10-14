"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { mensajeError, textoForm, type Resultado } from "../_componentes/resultado";

function refrescar() {
  revalidatePath("/admin/galeria");
  revalidatePath("/", "layout");
}

export async function crearDiseno(titulo: string, categoria: string, imagenUrl: string): Promise<Resultado> {
  await exigirAdmin();
  if (!titulo.trim() || !imagenUrl) return { ok: false, error: "Falta el título o la foto." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("disenos").insert({
    titulo: titulo.trim(),
    categoria: categoria.trim() || "Nail art",
    imagen_url: imagenUrl,
  });
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}

export async function alternarDiseno(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("disenos")
    .update({ activo: textoForm(fd, "activo") !== "true" })
    .eq("id", textoForm(fd, "id"));
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}

export async function borrarDiseno(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const id = textoForm(fd, "id");
  const { data: diseno } = await supabase.from("disenos").select("imagen_url").eq("id", id).single();
  const { error } = await supabase.from("disenos").delete().eq("id", id);
  if (error) return { ok: false, error: mensajeError(error, "No se pudo borrar.") };
  // Borra también la foto del almacenamiento
  const ruta = diseno?.imagen_url?.split("/storage/v1/object/public/publico/")[1];
  if (ruta) await supabase.storage.from("publico").remove([decodeURIComponent(ruta)]);
  refrescar();
  return { ok: true };
}
