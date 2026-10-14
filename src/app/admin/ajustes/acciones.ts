"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { mensajeError, numeroForm, textoForm, type Resultado } from "../_componentes/resultado";

function refrescar() {
  revalidatePath("/", "layout");
}

export async function guardarAjustes(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const enteros = [
    "anticipo_porcentaje",
    "horas_cancelacion",
    "minutos_traslado",
    "intervalo_minutos",
    "antelacion_minima_minutos",
    "dias_maximos_reserva",
    "visitas_cliente_frecuente",
    "minutos_expiracion_pago",
  ] as const;
  const datos: Record<string, unknown> = {
    whatsapp: textoForm(fd, "whatsapp").replace(/\D/g, "") || null,
    instrucciones_pago: textoForm(fd, "instrucciones_pago") || null,
    pagos_en_linea: fd.get("pagos_en_linea") === "on",
    domicilio_habilitado: fd.get("domicilio_habilitado") === "on",
    salon_habilitado: fd.get("salon_habilitado") === "on",
    salon_direccion: textoForm(fd, "salon_direccion") || null,
    salon_ciudad: textoForm(fd, "salon_ciudad") || null,
    actualizado_en: new Date().toISOString(),
  };
  for (const campo of enteros) {
    const n = numeroForm(fd, campo);
    if (!Number.isInteger(n) || n < 0) return { ok: false, error: "Revisa los números: deben ser enteros positivos." };
    datos[campo] = n;
  }
  if (!datos.domicilio_habilitado && !datos.salon_habilitado) {
    return { ok: false, error: "Debes tener activo al menos el domicilio o el salón." };
  }
  if (datos.salon_habilitado && !datos.salon_direccion) {
    return { ok: false, error: "Escribe la dirección del salón para poder activarlo." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ajustes").update(datos).eq("id", 1);
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true, mensaje: "Ajustes guardados ♡" };
}

export async function agregarCiudad(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const nombre = textoForm(fd, "nombre");
  if (!nombre) return { ok: false, error: "Escribe el nombre de la ciudad." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("ciudades").insert({ nombre, activa: true });
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}

export async function alternarCiudad(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("ciudades")
    .update({ activa: textoForm(fd, "activa") !== "true" })
    .eq("id", Number(textoForm(fd, "id")));
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}

export async function agregarAdmin(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const email = textoForm(fd, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Escribe un correo válido." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("correos_admin").insert({ email });
  if (error) return { ok: false, error: mensajeError(error) };
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function quitarAdmin(_: Resultado | null, fd: FormData): Promise<Resultado> {
  const yo = await exigirAdmin();
  const email = textoForm(fd, "email").toLowerCase();
  if (email === yo.email?.toLowerCase()) return { ok: false, error: "No puedes quitarte a ti misma." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("correos_admin").delete().eq("email", email);
  if (error) return { ok: false, error: mensajeError(error) };
  // Si ya tenía cuenta, vuelve a ser clienta
  await supabase.from("perfiles").update({ rol: "cliente" }).eq("email", email);
  revalidatePath("/admin/ajustes");
  return { ok: true };
}
