import "server-only";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Ajustes, Ciudad, Diseno, Servicio } from "@/lib/tipos";

// Lecturas públicas. Si Supabase falla o aún no está configurado, devuelven
// valores vacíos para que las páginas se vean bien de todas formas.

export async function obtenerServicios(): Promise<Servicio[]> {
  try {
    const supabase = await crearClienteServidor();
    const { data } = await supabase
      .from("servicios")
      .select("*")
      .eq("activo", true)
      .order("orden")
      .order("nombre");
    return (data as Servicio[]) ?? [];
  } catch {
    return [];
  }
}

export async function obtenerDisenos(limite?: number): Promise<Diseno[]> {
  try {
    const supabase = await crearClienteServidor();
    let consulta = supabase.from("disenos").select("*").eq("activo", true).order("orden").order("creado_en", {
      ascending: false,
    });
    if (limite) consulta = consulta.limit(limite);
    const { data } = await consulta;
    return (data as Diseno[]) ?? [];
  } catch {
    return [];
  }
}

export async function obtenerAjustes(): Promise<Ajustes | null> {
  try {
    const supabase = await crearClienteServidor();
    const { data } = await supabase.from("ajustes").select("*").eq("id", 1).single();
    return (data as Ajustes) ?? null;
  } catch {
    return null;
  }
}

export async function obtenerCiudades(): Promise<Ciudad[]> {
  try {
    const supabase = await crearClienteServidor();
    const { data } = await supabase.from("ciudades").select("*").eq("activa", true).order("nombre");
    return (data as Ciudad[]) ?? [];
  } catch {
    return [];
  }
}

/** Agrupa servicios por categoría manteniendo el orden. */
export function agruparPorCategoria<T extends { categoria: string }>(items: T[]) {
  const grupos = new Map<string, T[]>();
  for (const item of items) {
    grupos.set(item.categoria, [...(grupos.get(item.categoria) ?? []), item]);
  }
  return [...grupos.entries()];
}
