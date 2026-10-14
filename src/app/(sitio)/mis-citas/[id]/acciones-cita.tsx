"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, X } from "lucide-react";
import { Aviso, AreaTexto, Boton } from "@/components/ui";
import { formatoPesos } from "@/lib/formato";
import { cancelarCita } from "../acciones";

export function BotonesPago({
  citaId,
  anticipo,
  saldo,
  yaPagoAlgo,
}: {
  citaId: string;
  anticipo: number;
  saldo: number;
  yaPagoAlgo: boolean;
}) {
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pagar(tipo: "anticipo" | "total" | "saldo") {
    setCargando(tipo);
    setError(null);
    try {
      const res = await fetch("/api/pagos/wompi/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId, tipo }),
      });
      const cuerpo = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !cuerpo.url) throw new Error(cuerpo.error ?? "No pudimos iniciar el pago");
      window.location.href = cuerpo.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar el pago");
      setCargando(null);
    }
  }

  return (
    <div className="space-y-2.5">
      {error && <Aviso tipo="error">{error}</Aviso>}
      {anticipo > 0 && (
        <Boton className="w-full" disabled={!!cargando} onClick={() => pagar("anticipo")}>
          <CreditCard className="size-4" />
          {cargando === "anticipo" ? "Abriendo pago…" : `Pagar anticipo · ${formatoPesos(anticipo)}`}
        </Boton>
      )}
      <Boton
        className="w-full"
        variante={anticipo > 0 ? "secundario" : "primario"}
        disabled={!!cargando}
        onClick={() => pagar(yaPagoAlgo ? "saldo" : "total")}
      >
        {cargando === "total" || cargando === "saldo"
          ? "Abriendo pago…"
          : yaPagoAlgo
            ? `Pagar saldo · ${formatoPesos(saldo)}`
            : `Pagar todo de una vez · ${formatoPesos(saldo)}`}
      </Boton>
      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-humo">
        <ShieldCheck className="size-3.5" /> Pago seguro con Wompi · PSE, Nequi, tarjeta, Bancolombia
      </p>
    </div>
  );
}

export function CancelarCita({ citaId, horas }: { citaId: string; horas: number }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  if (!abierto) {
    return (
      <>
        <p className="mt-2 text-sm text-humo">Puedes cancelar sin problema hasta {horas} horas antes.</p>
        <Boton variante="peligro" tamano="sm" className="mt-3" onClick={() => setAbierto(true)}>
          <X className="size-4" /> Cancelar mi cita
        </Boton>
      </>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {error && <Aviso tipo="error">{error}</Aviso>}
      <AreaTexto
        placeholder="¿Nos cuentas por qué? (opcional)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        maxLength={300}
        className="min-h-20"
      />
      <div className="flex flex-wrap gap-2">
        <Boton
          variante="peligro"
          tamano="sm"
          disabled={pendiente}
          onClick={() =>
            iniciar(async () => {
              const r = await cancelarCita(citaId, motivo);
              if (r.ok) router.refresh();
              else setError(r.error);
            })
          }
        >
          {pendiente ? "Cancelando…" : "Sí, cancelar"}
        </Boton>
        <Boton variante="fantasma" tamano="sm" onClick={() => setAbierto(false)}>
          No, mantener mi cita
        </Boton>
      </div>
    </div>
  );
}
