"use client";

import { useState } from "react";
import { Campo, Entrada, cx } from "@/components/ui";
import { BotonEnviar, FormularioAccion } from "../_componentes/formulario-accion";
import { agregarExcepcion } from "./acciones";

export function FormularioExcepcion() {
  const [tipo, setTipo] = useState<"disponible" | "bloqueado">("disponible");
  const [diaCompleto, setDiaCompleto] = useState(false);
  const sinHoras = tipo === "bloqueado" && diaCompleto;

  return (
    <FormularioAccion accion={agregarExcepcion} className="mt-5 space-y-4">
      <input type="hidden" name="tipo" value={tipo} />
      <div className="grid grid-cols-2 gap-1 rounded-full bg-white p-1 ring-1 ring-linea">
        {(
          [
            ["disponible", "Abrir espacio extra"],
            ["bloqueado", "Bloquear"],
          ] as const
        ).map(([valor, texto]) => (
          <button
            type="button"
            key={valor}
            onClick={() => setTipo(valor)}
            className={cx(
              "rounded-full py-2 text-sm font-medium transition",
              tipo === valor ? "bg-ciruela-700 text-white" : "text-humo",
            )}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta={tipo === "bloqueado" ? "Desde el día" : "Fecha"}>
          <Entrada type="date" name="fecha" required />
        </Campo>
        {tipo === "bloqueado" ? (
          <Campo etiqueta="Hasta el día" ayuda="Opcional, para vacaciones">
            <Entrada type="date" name="fecha_hasta" />
          </Campo>
        ) : (
          <div />
        )}
      </div>

      {tipo === "bloqueado" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="dia_completo"
            checked={diaCompleto}
            onChange={(e) => setDiaCompleto(e.target.checked)}
            className="size-4 accent-ciruela-700"
          />
          Todo el día
        </label>
      )}

      {!sinHoras && (
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Desde">
            <Entrada type="time" name="hora_inicio" required defaultValue={tipo === "disponible" ? "09:00" : ""} />
          </Campo>
          <Campo etiqueta="Hasta">
            <Entrada type="time" name="hora_fin" required defaultValue={tipo === "disponible" ? "13:00" : ""} />
          </Campo>
        </div>
      )}

      <Campo etiqueta="Nota (solo la ves tú)">
        <Entrada name="nota" placeholder={tipo === "disponible" ? "Ej: domingo especial" : "Ej: cita médica"} />
      </Campo>

      <BotonEnviar className="w-full" variante={tipo === "disponible" ? "primario" : "secundario"}>
        {tipo === "disponible" ? "Abrir este espacio" : "Bloquear"}
      </BotonEnviar>
    </FormularioAccion>
  );
}
