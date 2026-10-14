"use server";

import { revalidatePath } from "next/cache";
import { obtenerPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Direccion } from "@/lib/tipos";

type Resultado<T = undefined> = { ok: true; datos?: T } | { ok: false; error: string };

function texto(valor: FormDataEntryValue | null) {
  const t = String(valor ?? "").trim();
  return t.length ? t : null;
}

/** Guarda nombre, teléfono, cumpleaños y la aceptación del tratamiento de datos. */
export async function guardarDatosPersonales(formulario: FormData): Promise<Resultado> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };

  const nombre = texto(formulario.get("nombre"));
  const telefono = texto(formulario.get("telefono"))?.replace(/[^\d+]/g, "") ?? null;
  const acepto = formulario.get("acepto") === "on";

  if (!nombre || nombre.length < 2) return { ok: false, error: "Escribe tu nombre" };
  if (!telefono || telefono.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Escribe un celular válido de 10 dígitos" };
  }
  if (!acepto && !perfil.acepto_datos_en) {
    return { ok: false, error: "Debes aceptar la política de tratamiento de datos" };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("perfiles")
    .update({
      nombre,
      telefono,
      fecha_nacimiento: texto(formulario.get("fecha_nacimiento")),
      acepto_datos_en: perfil.acepto_datos_en ?? new Date().toISOString(),
    })
    .eq("id", perfil.id);

  if (error) return { ok: false, error: "No pudimos guardar tus datos. Intenta de nuevo." };
  revalidatePath("/perfil");
  revalidatePath("/reservar");
  return { ok: true };
}

function datosDireccion(formulario: FormData) {
  return {
    etiqueta: texto(formulario.get("etiqueta")) ?? "Casa",
    direccion: texto(formulario.get("direccion")),
    barrio: texto(formulario.get("barrio")),
    ciudad: texto(formulario.get("ciudad")),
    indicaciones: texto(formulario.get("indicaciones")),
  };
}

export async function guardarDireccion(formulario: FormData): Promise<Resultado<Direccion>> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };

  const datos = datosDireccion(formulario);
  if (!datos.direccion) return { ok: false, error: "Escribe la dirección" };
  if (!datos.ciudad) return { ok: false, error: "Elige la ciudad" };

  const supabase = await crearClienteServidor();
  const id = texto(formulario.get("id"));

  if (id) {
    const { data, error } = await supabase
      .from("direcciones")
      .update(datos)
      .eq("id", id)
      .eq("cliente_id", perfil.id)
      .select()
      .single<Direccion>();
    if (error || !data) return { ok: false, error: "No pudimos actualizar la dirección" };
    revalidatePath("/perfil");
    return { ok: true, datos: data };
  }

  const { count } = await supabase
    .from("direcciones")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", perfil.id);

  const { data, error } = await supabase
    .from("direcciones")
    .insert({ ...datos, cliente_id: perfil.id, principal: !count })
    .select()
    .single<Direccion>();
  if (error || !data) return { ok: false, error: "No pudimos guardar la dirección" };
  revalidatePath("/perfil");
  return { ok: true, datos: data };
}

export async function eliminarDireccion(id: string): Promise<Resultado> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("direcciones").delete().eq("id", id).eq("cliente_id", perfil.id);
  if (error) return { ok: false, error: "No pudimos eliminar la dirección" };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function marcarDireccionPrincipal(id: string): Promise<Resultado> {
  const perfil = await obtenerPerfil();
  if (!perfil) return { ok: false, error: "Tu sesión terminó. Vuelve a ingresar." };
  const supabase = await crearClienteServidor();
  await supabase.from("direcciones").update({ principal: false }).eq("cliente_id", perfil.id).neq("id", id);
  const { error } = await supabase
    .from("direcciones")
    .update({ principal: true })
    .eq("id", id)
    .eq("cliente_id", perfil.id);
  if (error) return { ok: false, error: "No pudimos actualizar la dirección" };
  revalidatePath("/perfil");
  return { ok: true };
}
