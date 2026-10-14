"use client";

import { useState, useTransition } from "react";
import { Ban, Car, CheckCheck, CircleCheck, HandCoins, Sparkles, UserX } from "lucide-react";
import { Aviso, Boton, Campo, Entrada, Selector } from "@/components/ui";
import { formatoPesos } from "@/lib/formato";
import type { EstadoCita } from "@/lib/tipos";
import { cambiarEstadoCita, cancelarCitaAdmin, registrarPagoManual } from "../acciones";
import type { Resultado } from "./resultado";

const METODOS = ["Nequi", "Daviplata", "Efectivo", "Transferencia", "Bre-B"];

export function AccionesCita({ id, estado, saldo }: { id: string; estado: EstadoCita; saldo: number }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"pago" | "cancelar" | null>(null);
  const [monto, setMonto] = useState(String(saldo > 0 ? saldo : ""));
  const [metodo, setMetodo] = useState(METODOS[0]);
  const [motivo, setMotivo] = useState("");

  function ejecutar(accion: () => Promise<Resultado>, alTerminar?: () => void) {
    setError(null);
    iniciar(async () => {
      const r = await accion();
      if (!r.ok) setError(r.error);
      else alTerminar?.();
    });
  }

  const estado_ = (nuevo: EstadoCita) => () => ejecutar(() => cambiarEstadoCita(id, nuevo));
  const cerrada = estado === "completada" || estado === "cancelada" || estado === "no_asistio";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {estado === "pendiente_pago" && (
          <Boton tamano="sm" variante="dorado" disabled={pendiente} onClick={estado_("confirmada")}>
            <CircleCheck className="size-4" /> Confirmar
          </Boton>
        )}
        {(estado === "confirmada" || estado === "pendiente_pago") && (
          <Boton tamano="sm" variante="secundario" disabled={pendiente} onClick={estado_("en_camino")}>
            <Car className="size-4" /> En camino
          </Boton>
        )}
        {(estado === "confirmada" || estado === "en_camino") && (
          <Boton tamano="sm" variante="secundario" disabled={pendiente} onClick={estado_("en_curso")}>
            <Sparkles className="size-4" /> Llegué
          </Boton>
        )}
        {!cerrada && (
          <Boton tamano="sm" disabled={pendiente} onClick={estado_("completada")}>
            <CheckCheck className="size-4" /> Terminé
          </Boton>
        )}
        {estado !== "cancelada" && saldo > 0 && (
          <Boton
            tamano="sm"
            variante="secundario"
            disabled={pendiente}
            onClick={() => setPanel(panel === "pago" ? null : "pago")}
          >
            <HandCoins className="size-4" /> Registrar pago
          </Boton>
        )}
        {(estado === "confirmada" || estado === "pendiente_pago" || estado === "en_camino") && (
          <Boton tamano="sm" variante="fantasma" disabled={pendiente} onClick={estado_("no_asistio")}>
            <UserX className="size-4" /> No asistió
          </Boton>
        )}
        {!cerrada && (
          <Boton
            tamano="sm"
            variante="peligro"
            disabled={pendiente}
            onClick={() => setPanel(panel === "cancelar" ? null : "cancelar")}
          >
            <Ban className="size-4" /> Cancelar
          </Boton>
        )}
      </div>

      {panel === "pago" && (
        <div className="grid gap-3 rounded-2xl bg-rubor-50 p-4 ring-1 ring-rubor-100 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Campo etiqueta="Monto recibido" ayuda={`Saldo pendiente: ${formatoPesos(saldo)}`}>
            <Entrada inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))} />
          </Campo>
          <Campo etiqueta="Método">
            <Selector value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Selector>
          </Campo>
          <Boton
            disabled={pendiente || !monto}
            onClick={() => ejecutar(() => registrarPagoManual(id, Number(monto), metodo), () => setPanel(null))}
          >
            {pendiente ? "Guardando…" : "Guardar pago"}
          </Boton>
        </div>
      )}

      {panel === "cancelar" && (
        <div className="grid gap-3 rounded-2xl bg-red-50/60 p-4 ring-1 ring-red-100 sm:grid-cols-[1fr_auto] sm:items-end">
          <Campo etiqueta="Motivo (opcional)">
            <Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: la clienta reprogramó" />
          </Campo>
          <Boton
            variante="peligro"
            disabled={pendiente}
            onClick={() => ejecutar(() => cancelarCitaAdmin(id, motivo), () => setPanel(null))}
          >
            {pendiente ? "Cancelando…" : "Sí, cancelar cita"}
          </Boton>
        </div>
      )}

      {error && <Aviso tipo="error">{error}</Aviso>}
    </div>
  );
}
