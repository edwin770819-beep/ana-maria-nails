"use client";

import { useState } from "react";
import { cx } from "@/components/ui";

/** Interruptor tipo iOS que se envía en un formulario como "on" cuando está activo. */
export function Interruptor({
  nombre,
  inicial,
  etiqueta,
  descripcion,
}: {
  nombre: string;
  inicial: boolean;
  etiqueta: string;
  descripcion?: string;
}) {
  const [activo, setActivo] = useState(inicial);
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium text-tinta">{etiqueta}</span>
        {descripcion && <span className="mt-0.5 block text-xs text-humo">{descripcion}</span>}
      </span>
      <input
        type="checkbox"
        name={nombre}
        checked={activo}
        onChange={(e) => setActivo(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cx(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          activo ? "bg-ciruela-600" : "bg-stone-300",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            activo ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </span>
    </label>
  );
}
