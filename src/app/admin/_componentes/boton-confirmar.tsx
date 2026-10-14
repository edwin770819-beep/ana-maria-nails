"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";

/** Botón de envío que pide un segundo toque para confirmar (evita borrar por error). */
export function BotonConfirmar({
  children,
  confirmar = "¿Seguro?",
  etiqueta,
  className,
}: {
  children: ReactNode;
  confirmar?: string;
  etiqueta: string;
  className?: string;
}) {
  const [armado, setArmado] = useState(false);

  useEffect(() => {
    if (!armado) return;
    const t = setTimeout(() => setArmado(false), 3000);
    return () => clearTimeout(t);
  }, [armado]);

  return armado ? (
    <button
      type="submit"
      className="h-8 rounded-full bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700"
    >
      {confirmar}
    </button>
  ) : (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={() => setArmado(true)}
      className={cx(
        "flex size-8 items-center justify-center rounded-full text-humo hover:bg-red-50 hover:text-red-700",
        className,
      )}
    >
      {children}
    </button>
  );
}
