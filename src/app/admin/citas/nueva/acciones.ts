"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { aFecha } from "@/lib/formato";
import type { Direccion, Perfil } from "@/lib/tipos";
import { mensajeError, textoForm, type Resultado } from "../../_componentes/resultado";

export async function sugerirHorarios(servicioId: string, fecha: string, modalidad: string): Promise<string[]> {
  await exigirAdmin();
  if (!servicioId || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return [];
  const supabase = await crearClienteServidor();
  const { data } = await supabase.rpc("horarios_disponibles", {
    p_servicio: servicioId,
    p_fecha: fecha,
    p_modalidad: modalidad === "salon" ? "salon" : "domicilio",
  });
  return ((data ?? []) as { inicio: string }[]).map((h) => h.inicio);
}

export type ClientaEncontrada = Pick<Perfil, "id" | "nombre" | "email" | "telefono"> & {
  direcciones: Pick<Direccion, "id" | "etiqueta" | "direccion" | "barrio" | "ciudad" | "indicaciones" | "lat" | "lng">[];
};

export async function buscarClientas(texto: string): Promise<ClientaEncontrada[]> {
  await exigirAdmin();
  const q = texto.trim().replace(/[,%()]/g, " ");
  if (q.length < 2) return [];
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("perfiles")
    .select("id, nombre, email, telefono, direcciones(id, etiqueta, direccion, barrio, ciudad, indicaciones, lat, lng)")
    .or(`nombre.ilike.%${q}%,email.ilike.%${q}%,telefono.ilike.%${q}%`)
    .limit(8);
  return (data ?? []) as ClientaEncontrada[];
}

export async function crearCitaManual(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();

  const servicioId = textoForm(fd, "servicio_id");
  const fecha = textoForm(fd, "fecha");
  const hora = textoForm(fd, "hora");
  const modalidad = textoForm(fd, "modalidad") === "salon" ? "salon" : "domicilio";
  const clienteId = textoForm(fd, "cliente_id") || null;
  const nombre = textoForm(fd, "cliente_nombre");
  const telefono = textoForm(fd, "cliente_telefono");
  const direccionId = textoForm(fd, "direccion_id") || null;

  if (!servicioId) return { ok: false, error: "Elige el servicio." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return { ok: false, error: "Elige la fecha y la hora." };
  }
  if (!clienteId && !nombre) return { ok: false, error: "Elige una clienta o escribe su nombre." };

  const { data: servicio } = await supabase.from("servicios").select("precio, nombre").eq("id", servicioId).single();
  if (!servicio) return { ok: false, error: "Servicio no encontrado." };

  const { data: ajustes } = await supabase.from("ajustes").select("salon_direccion, salon_ciudad").eq("id", 1).single();

  const direccion = textoForm(fd, "direccion");
  if (modalidad === "domicilio" && !direccion) return { ok: false, error: "Escribe la dirección del domicilio." };

  const latTexto = textoForm(fd, "lat");
  const lngTexto = textoForm(fd, "lng");

  const { error } = await supabase.from("citas").insert({
    cliente_id: clienteId,
    cliente_nombre: nombre || null,
    cliente_telefono: telefono || null,
    servicio_id: servicioId,
    servicio_nombre: servicio.nombre,
    inicio: aFecha(fecha, hora).toISOString(),
    modalidad,
    direccion_id: modalidad === "domicilio" ? direccionId : null,
    direccion_texto: modalidad === "salon" ? ajustes?.salon_direccion : direccion,
    barrio: modalidad === "salon" ? null : textoForm(fd, "barrio") || null,
    ciudad: modalidad === "salon" ? ajustes?.salon_ciudad : textoForm(fd, "ciudad") || null,
    indicaciones: modalidad === "salon" ? null : textoForm(fd, "indicaciones") || null,
    lat: latTexto ? Number(latTexto) : null,
    lng: lngTexto ? Number(lngTexto) : null,
    estado: "confirmada",
    precio: servicio.precio,
    notas_cliente: textoForm(fd, "notas") || null,
  });
  if (error) return { ok: false, error: mensajeError(error, "No se pudo crear la cita.") };

  revalidatePath("/admin", "layout");
  redirect(`/admin?vista=dia&fecha=${fecha}`);
}
