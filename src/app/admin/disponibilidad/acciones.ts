"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { mensajeError, textoForm, type Resultado } from "../_componentes/resultado";

const HORA = /^\d{2}:\d{2}$/;

function refrescar() {
  revalidatePath("/admin", "layout");
}

export async function agregarBloque(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const dia = Number(textoForm(fd, "dia_semana"));
  const inicio = textoForm(fd, "hora_inicio");
  const fin = textoForm(fd, "hora_fin");
  if (!(dia >= 0 && dia <= 6) || !HORA.test(inicio) || !HORA.test(fin)) {
    return { ok: false, error: "Escribe la hora de inicio y de fin." };
  }
  if (fin <= inicio) return { ok: false, error: "La hora de fin debe ser después de la de inicio." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("horario_semanal").insert({ dia_semana: dia, hora_inicio: inicio, hora_fin: fin });
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true };
}

export async function quitarBloque(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("horario_semanal").delete().eq("id", Number(textoForm(fd, "id")));
  if (error) return { ok: false, error: mensajeError(error, "No se pudo quitar.") };
  refrescar();
  return { ok: true };
}

export async function agregarExcepcion(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const tipo = textoForm(fd, "tipo") === "bloqueado" ? "bloqueado" : "disponible";
  const fecha = textoForm(fd, "fecha");
  const diaCompleto = tipo === "bloqueado" && fd.get("dia_completo") === "on";
  const inicio = textoForm(fd, "hora_inicio");
  const fin = textoForm(fd, "hora_fin");
  const fechaHasta = textoForm(fd, "fecha_hasta") || fecha;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { ok: false, error: "Elige la fecha." };
  if (fechaHasta < fecha) return { ok: false, error: "La fecha final debe ser igual o posterior a la inicial." };
  if (!diaCompleto) {
    if (!HORA.test(inicio) || !HORA.test(fin)) return { ok: false, error: "Escribe la hora de inicio y de fin." };
    if (fin <= inicio) return { ok: false, error: "La hora de fin debe ser después de la de inicio." };
  }

  // Permite bloquear varios días seguidos (vacaciones)
  const filas = [];
  for (let d = new Date(`${fecha}T12:00:00Z`); d <= new Date(`${fechaHasta}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    filas.push({
      fecha: d.toISOString().slice(0, 10),
      tipo,
      hora_inicio: diaCompleto ? null : inicio,
      hora_fin: diaCompleto ? null : fin,
      nota: textoForm(fd, "nota") || null,
    });
    if (filas.length > 60) return { ok: false, error: "El rango es muy largo (máximo 60 días)." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("excepciones_horario").insert(filas);
  if (error) return { ok: false, error: mensajeError(error) };
  refrescar();
  return { ok: true, mensaje: tipo === "disponible" ? "¡Listo! Abriste ese espacio." : "Listo, quedó bloqueado." };
}

export async function quitarExcepcion(_: Resultado | null, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("excepciones_horario").delete().eq("id", Number(textoForm(fd, "id")));
  if (error) return { ok: false, error: mensajeError(error, "No se pudo quitar.") };
  refrescar();
  return { ok: true };
}
