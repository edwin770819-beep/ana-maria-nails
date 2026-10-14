import "server-only";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Cita, ExcepcionHorario, HorarioSemanal } from "@/lib/tipos";
import { rangoISO } from "./tiempo";

export type CitaAgenda = Cita & {
  perfil: { nombre: string | null; telefono: string | null; email: string | null } | null;
  diseno: { titulo: string; imagen_url: string } | null;
  foto_url: string | null;
};

/** Citas entre dos fechas locales (hasta exclusiva), con clienta, diseño y foto de referencia firmada. */
export async function citasEnRango(desde: string, hastaExclusiva: string, incluirCanceladas = false) {
  const supabase = await crearClienteServidor();
  const rango = rangoISO(desde, hastaExclusiva);
  let consulta = supabase
    .from("citas")
    .select("*, perfil:perfiles(nombre, telefono, email), diseno:disenos(titulo, imagen_url)")
    .gte("inicio", rango.desde)
    .lt("inicio", rango.hasta)
    .order("inicio");
  if (!incluirCanceladas) consulta = consulta.neq("estado", "cancelada");
  const { data } = await consulta;
  const citas = (data ?? []) as Omit<CitaAgenda, "foto_url">[];

  // URLs temporales para las fotos de referencia (bucket privado)
  const rutas = citas.map((c) => c.foto_referencia).filter((r): r is string => !!r);
  const firmadas = new Map<string, string>();
  if (rutas.length) {
    const { data: urls } = await supabase.storage.from("referencias").createSignedUrls(rutas, 60 * 60);
    urls?.forEach((u) => u.path && u.signedUrl && firmadas.set(u.path, u.signedUrl));
  }

  return citas.map((c) => ({
    ...c,
    foto_url: c.foto_referencia ? (firmadas.get(c.foto_referencia) ?? null) : null,
  })) as CitaAgenda[];
}

export async function disponibilidadEnRango(desde: string, hastaExclusiva: string) {
  const supabase = await crearClienteServidor();
  const [{ data: horario }, { data: excepciones }] = await Promise.all([
    supabase.from("horario_semanal").select("*").order("hora_inicio"),
    supabase.from("excepciones_horario").select("*").gte("fecha", desde).lt("fecha", hastaExclusiva),
  ]);
  return {
    horario: (horario ?? []) as HorarioSemanal[],
    excepciones: (excepciones ?? []) as ExcepcionHorario[],
  };
}

export function nombreClienta(c: Pick<CitaAgenda, "perfil" | "cliente_nombre">) {
  return c.perfil?.nombre || c.cliente_nombre || c.perfil?.email || "Clienta";
}

export function telefonoClienta(c: Pick<CitaAgenda, "perfil" | "cliente_telefono">) {
  return c.perfil?.telefono || c.cliente_telefono || null;
}
