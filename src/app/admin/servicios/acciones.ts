"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { mensajeError, numeroForm, textoForm, type Resultado } from "../_componentes/resultado";

function refrescar() {
  revalidatePath("/admin/servicios");
  revalidatePath("/", "layout");
}

export async function guardarServicio(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = textoForm(fd, "id");
  const modalidad = textoForm(fd, "modalidad");
  const datos = {
    nombre: textoForm(fd, "nombre"),
    descripcion: textoForm(fd, "descripcion") || null,
    categoria: textoForm(fd, "categoria") || "Manos",
    duracion_minutos: numeroForm(fd, "duracion_minutos"),
    precio: numeroForm(fd, "precio"),
    modalidad: ["domicilio", "salon", "ambos"].includes(modalidad) ? modalidad : "ambos",
    activo: fd.get("activo") === "on",
    orden: numeroForm(fd, "orden") || 0,
    imagen_url: textoForm(fd, "imagen_url") || null,
  };

  if (!datos.nombre) return { ok: false, error: "Escribe el nombre del servicio." };
  if (!(datos.duracion_minutos >= 10 && datos.duracion_minutos <= 480)) {
    return { ok: false, error: "La duración debe estar entre 10 y 480 minutos." };
  }
  if (!(datos.precio >= 0)) return { ok: false, error: "Escribe un precio válido." };

  const supabase = await crearClienteServidor();
  const { error } = id
    ? await supabase.from("servicios").update(datos).eq("id", id)
    : await supabase.from("servicios").insert(datos);
  if (error) return { ok: false, error: mensajeError(error) };

  refrescar();
  redirect("/admin/servicios");
}

export async function alternarServicio(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("servicios")
    .update({ activo: textoForm(fd, "activo") !== "true" })
    .eq("id", textoForm(fd, "id"));
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}
