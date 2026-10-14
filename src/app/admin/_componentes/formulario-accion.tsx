"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Aviso, Boton, cx } from "@/components/ui";
import type { Resultado } from "./resultado";

type Accion = (previo: Resultado | null, datos: FormData) => Promise<Resultado>;

/** Formulario que ejecuta una Server Action y muestra el resultado. */
export function FormularioAccion({
  accion,
  children,
  className,
  mostrarExito = true,
}: {
  accion: Accion;
  children: ReactNode;
  className?: string;
  mostrarExito?: boolean;
}) {
  const [estado, despachar] = useActionState(accion, null);
  return (
    <form action={despachar} className={className}>
      {children}
      {estado && !estado.ok && (
        <Aviso tipo="error" className="mt-3">
          {estado.error}
        </Aviso>
      )}
      {estado?.ok && mostrarExito && estado.mensaje && (
        <Aviso tipo="exito" className="mt-3">
          {estado.mensaje}
        </Aviso>
      )}
    </form>
  );
}

/** Botón de envío que se deshabilita mientras la acción está en curso. */
export function BotonEnviar({
  children,
  pendiente = "Guardando…",
  variante,
  tamano,
  className,
}: {
  children: ReactNode;
  pendiente?: string;
  variante?: "primario" | "secundario" | "fantasma" | "peligro" | "dorado";
  tamano?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" variante={variante} tamano={tamano} disabled={pending} className={cx(className)}>
      {pending ? pendiente : children}
    </Boton>
  );
}
