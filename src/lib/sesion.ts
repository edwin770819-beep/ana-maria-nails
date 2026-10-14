import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "./supabase/servidor";
import type { Perfil } from "./tipos";

/** Perfil de quien está navegando, o null si no ha iniciado sesión. Se calcula una vez por petición. */
export const obtenerPerfil = cache(async (): Promise<Perfil | null> => {
  try {
    const supabase = await crearClienteServidor();
    const { data } = await supabase.auth.getClaims();
    const id = data?.claims?.sub;
    if (!id) return null;
    const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", id).single();
    return (perfil as Perfil) ?? null;
  } catch {
    // Supabase sin configurar o caído: el sitio sigue funcionando como visitante
    return null;
  }
});

/** Exige sesión iniciada; si no, envía a /ingresar y vuelve después a `volverA`. */
export async function exigirPerfil(volverA: string) {
  const perfil = await obtenerPerfil();
  if (!perfil) redirect(`/ingresar?volver=${encodeURIComponent(volverA)}`);
  return perfil;
}

/** Exige que quien navega sea administradora. */
export async function exigirAdmin() {
  const perfil = await exigirPerfil("/admin");
  if (perfil.rol !== "admin") redirect("/");
  return perfil;
}
