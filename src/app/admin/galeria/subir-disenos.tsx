"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { subirFotoPublica } from "../_componentes/subir-imagen";
import { crearDiseno } from "./acciones";

const CATEGORIAS = ["Nail art", "Francesa", "Minimalista", "Novias", "Temporada", "Acrílicas", "Pies"];

/** Permite subir varias fotos a la vez; cada una queda como un diseño. */
export function SubirDisenos() {
  const entrada = useRef<HTMLInputElement>(null);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (!archivos.length) return;
    setError(null);
    try {
      for (const [i, archivo] of archivos.entries()) {
        setProgreso(`Subiendo ${i + 1} de ${archivos.length}…`);
        const url = await subirFotoPublica(archivo, "disenos");
        const nombre = titulo.trim() || categoria;
        const r = await crearDiseno(archivos.length > 1 ? `${nombre} ${i + 1}` : nombre, categoria, url);
        if (!r.ok) throw new Error(r.error);
      }
      setTitulo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setProgreso(null);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Nombre del diseño" ayuda="Opcional">
          <Entrada value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: francesa con brillo" />
        </Campo>
        <Campo etiqueta="Categoría">
          <Entrada list="categorias-disenos" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <datalist id="categorias-disenos">
            {CATEGORIAS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Campo>
      </div>
      <input ref={entrada} type="file" accept="image/*" multiple className="hidden" onChange={alElegir} />
      <Boton type="button" className="w-full" disabled={!!progreso} onClick={() => entrada.current?.click()}>
        {progreso ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {progreso}
          </>
        ) : (
          <>
            <ImagePlus className="size-4" /> Subir fotos
          </>
        )}
      </Boton>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </div>
  );
}
