"use client";

import { useState, useTransition } from "react";
import { Aviso, Boton, Campo, Entrada, Selector, cx } from "@/components/ui";
import type { Ciudad, Direccion } from "@/lib/tipos";
import { guardarDireccion } from "./acciones-cuenta";

const ETIQUETAS = ["Casa", "Oficina", "Otra"];

export function FormularioDireccion({
  ciudades,
  inicial,
  alGuardar,
  alCancelar,
}: {
  ciudades: Ciudad[];
  inicial?: Direccion | null;
  alGuardar: (direccion: Direccion) => void;
  alCancelar?: () => void;
}) {
  const [etiqueta, setEtiqueta] = useState(inicial?.etiqueta ?? "Casa");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const opcionesCiudad = ciudades.length ? ciudades.map((c) => c.nombre) : ["Bogotá"];

  function enviar(formulario: FormData) {
    setError(null);
    formulario.set("etiqueta", etiqueta);
    if (inicial) formulario.set("id", inicial.id);
    iniciar(async () => {
      const r = await guardarDireccion(formulario);
      if (r.ok && r.datos) alGuardar(r.datos);
      else if (!r.ok) setError(r.error);
    });
  }

  return (
    <form action={enviar} className="space-y-4">
      {error && <Aviso tipo="error">{error}</Aviso>}
      <div className="flex flex-wrap gap-2">
        {ETIQUETAS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEtiqueta(e)}
            className={cx(
              "rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition",
              etiqueta === e ? "bg-ciruela-700 text-white ring-ciruela-700" : "bg-white text-ciruela-800 ring-linea",
            )}
          >
            {e}
          </button>
        ))}
      </div>
      <Campo etiqueta="Dirección" ayuda="Ej: Calle 127 # 15-30">
        <Entrada name="direccion" required defaultValue={inicial?.direccion} autoComplete="street-address" />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Barrio">
          <Entrada name="barrio" defaultValue={inicial?.barrio ?? ""} />
        </Campo>
        <Campo etiqueta="Ciudad">
          <Selector name="ciudad" defaultValue={inicial?.ciudad ?? opcionesCiudad[0]}>
            {opcionesCiudad.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Selector>
        </Campo>
      </div>
      <Campo etiqueta="Indicaciones para llegar" ayuda="Torre, apartamento, conjunto, portería, punto de referencia…">
        <Entrada name="indicaciones" defaultValue={inicial?.indicaciones ?? ""} />
      </Campo>
      <div className="flex gap-2">
        <Boton type="submit" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar dirección"}
        </Boton>
        {alCancelar && (
          <Boton type="button" variante="fantasma" onClick={alCancelar}>
            Cancelar
          </Boton>
        )}
      </div>
    </form>
  );
}
