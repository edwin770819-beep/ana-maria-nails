"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import type { Perfil } from "@/lib/tipos";
import { guardarDatosPersonales } from "./acciones-cuenta";

export function FormularioDatos({
  perfil,
  conCumpleanos = true,
  textoBoton = "Guardar mis datos",
}: {
  perfil: Perfil;
  conCumpleanos?: boolean;
  textoBoton?: string;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  function enviar(formulario: FormData) {
    setMensaje(null);
    iniciar(async () => {
      const r = await guardarDatosPersonales(formulario);
      if (r.ok) {
        setMensaje({ tipo: "exito", texto: "¡Listo! Tus datos quedaron guardados." });
        router.refresh();
      } else {
        setMensaje({ tipo: "error", texto: r.error });
      }
    });
  }

  return (
    <form action={enviar} className="space-y-4">
      {mensaje && <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>}
      <Campo etiqueta="Nombre completo">
        <Entrada name="nombre" required defaultValue={perfil.nombre ?? ""} autoComplete="name" />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Celular / WhatsApp" ayuda="Ana María te escribirá a este número">
          <Entrada
            name="telefono"
            required
            type="tel"
            inputMode="tel"
            placeholder="300 123 4567"
            defaultValue={perfil.telefono ?? ""}
            autoComplete="tel-national"
          />
        </Campo>
        {conCumpleanos && (
          <Campo etiqueta="Cumpleaños (opcional)" ayuda="Para consentirte en tu día ♡">
            <Entrada name="fecha_nacimiento" type="date" defaultValue={perfil.fecha_nacimiento ?? ""} />
          </Campo>
        )}
      </div>
      {!perfil.acepto_datos_en ? (
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-linea">
          <input name="acepto" type="checkbox" required className="mt-0.5 size-4 accent-ciruela-700" />
          <span className="text-humo">
            Autorizo el tratamiento de mis datos personales para agendar y gestionar mis citas, según la{" "}
            <Link href="/privacidad" target="_blank" className="font-medium text-ciruela-700 underline">
              política de tratamiento de datos
            </Link>{" "}
            (Ley 1581 de 2012).
          </span>
        </label>
      ) : null}
      <Boton type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : textoBoton}
      </Boton>
    </form>
  );
}
