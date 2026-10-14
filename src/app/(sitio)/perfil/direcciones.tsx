"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Aviso, Insignia } from "@/components/ui";
import type { Ciudad, Direccion } from "@/lib/tipos";
import { eliminarDireccion, marcarDireccionPrincipal } from "../_componentes/acciones-cuenta";
import { FormularioDireccion } from "../_componentes/formulario-direccion";

export function Direcciones({ direcciones, ciudades }: { direcciones: Direccion[]; ciudades: Ciudad[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<string | "nueva" | null>(direcciones.length ? null : "nueva");
  const [confirmarBorrar, setConfirmarBorrar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(accion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciar(async () => {
      const r = await accion();
      if (!r.ok) setError(r.error ?? "Algo salió mal");
      setConfirmarBorrar(null);
      router.refresh();
    });
  }

  function alGuardar() {
    setEditando(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <Aviso tipo="error">{error}</Aviso>}

      {direcciones.map((d) =>
        editando === d.id ? (
          <div key={d.id} className="rounded-3xl bg-white p-5 ring-1 ring-linea">
            <FormularioDireccion ciudades={ciudades} inicial={d} alGuardar={alGuardar} alCancelar={() => setEditando(null)} />
          </div>
        ) : (
          <div key={d.id} className="flex items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-linea">
            <MapPin className="mt-1 size-4 shrink-0 text-dorado-600" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-dorado-600">{d.etiqueta}</span>
                {d.principal && <Insignia className="bg-ciruela-50 text-ciruela-700 ring-ciruela-100">Principal</Insignia>}
              </div>
              <p className="font-medium">{d.direccion}</p>
              <p className="text-sm text-humo">
                {[d.barrio, d.ciudad].filter(Boolean).join(" · ")}
                {d.indicaciones ? ` · ${d.indicaciones}` : ""}
              </p>
              {confirmarBorrar === d.id ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span>¿Eliminar esta dirección?</span>
                  <button
                    disabled={pendiente}
                    onClick={() => ejecutar(() => eliminarDireccion(d.id))}
                    className="font-semibold text-red-700"
                  >
                    Sí, eliminar
                  </button>
                  <button onClick={() => setConfirmarBorrar(null)} className="text-humo">
                    No
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <button onClick={() => setEditando(d.id)} className="inline-flex items-center gap-1 text-ciruela-700">
                    <Pencil className="size-3.5" /> Editar
                  </button>
                  {!d.principal && (
                    <button
                      disabled={pendiente}
                      onClick={() => ejecutar(() => marcarDireccionPrincipal(d.id))}
                      className="inline-flex items-center gap-1 text-ciruela-700"
                    >
                      <Star className="size-3.5" /> Hacer principal
                    </button>
                  )}
                  <button onClick={() => setConfirmarBorrar(d.id)} className="inline-flex items-center gap-1 text-humo">
                    <Trash2 className="size-3.5" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ),
      )}

      {editando === "nueva" ? (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-linea">
          <FormularioDireccion
            ciudades={ciudades}
            alGuardar={alGuardar}
            alCancelar={direcciones.length ? () => setEditando(null) : undefined}
          />
        </div>
      ) : (
        <button
          onClick={() => setEditando("nueva")}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-ciruela-300 p-4 text-sm font-medium text-ciruela-700"
        >
          <Plus className="size-4" /> Agregar dirección
        </button>
      )}
    </div>
  );
}
