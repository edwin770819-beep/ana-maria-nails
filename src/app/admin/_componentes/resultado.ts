// Resultado común de las Server Actions del panel.
export type Resultado = { ok: true; mensaje?: string } | { ok: false; error: string };

type ErrorSupabase = { code?: string; message?: string } | null | undefined;

/** Traduce errores de Supabase/Postgres a mensajes amables. */
export function mensajeError(error: ErrorSupabase, porDefecto = "No se pudo guardar. Intenta de nuevo.") {
  if (!error) return porDefecto;
  if (error.code === "23P01") {
    return "Ese horario se cruza con otra cita (incluyendo el tiempo de traslado). Elige otra hora.";
  }
  if (error.code === "23505") return "Ese registro ya existe.";
  if (error.code === "23514") return "Algún dato no es válido. Revisa los valores.";
  // Las funciones de la base de datos lanzan mensajes ya escritos para las personas
  if (error.code === "P0001" && error.message) return error.message;
  return porDefecto;
}

export function textoForm(fd: FormData, campo: string) {
  const valor = fd.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export function numeroForm(fd: FormData, campo: string) {
  const valor = Number(textoForm(fd, campo).replace(/[^\d.-]/g, ""));
  return Number.isFinite(valor) ? valor : NaN;
}
