"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { claseBoton, cx } from "@/components/ui";
import type { Diseno } from "@/lib/tipos";

export function GaleriaFiltrable({ disenos }: { disenos: Diseno[] }) {
  const categorias = useMemo(() => ["Todos", ...new Set(disenos.map((d) => d.categoria))], [disenos]);
  const [filtro, setFiltro] = useState("Todos");
  const [abierto, setAbierto] = useState<Diseno | null>(null);
  const visibles = filtro === "Todos" ? disenos : disenos.filter((d) => d.categoria === filtro);

  return (
    <>
      <div className="sin-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className={cx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition",
              filtro === c ? "bg-ciruela-700 text-white ring-ciruela-700" : "bg-marfil text-ciruela-800 ring-linea hover:bg-ciruela-50",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        {visibles.map((d) => (
          <button
            key={d.id}
            onClick={() => setAbierto(d)}
            className="group relative mb-3 block w-full overflow-hidden rounded-3xl text-left sm:mb-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.imagen_url} alt={d.titulo} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ciruela-900/80 to-transparent p-3 pt-10 text-sm font-medium text-white">
              {d.titulo}
            </span>
          </button>
        ))}
      </div>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ciruela-900/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setAbierto(null)}
        >
          <div
            className="w-full max-w-md animate-aparecer overflow-hidden rounded-[2rem] bg-marfil shadow-flotante"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={abierto.imagen_url} alt={abierto.titulo} className="max-h-[60vh] w-full object-cover" />
              <button
                onClick={() => setAbierto(null)}
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-marfil/90 text-ciruela-800"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-dorado-600">{abierto.categoria}</p>
              <h3 className="font-titulo text-2xl text-ciruela-900">{abierto.titulo}</h3>
              <Link href={`/reservar?diseno=${abierto.id}`} className={claseBoton("primario", "md", "mt-4 w-full")}>
                <Heart className="size-4" />
                Quiero este diseño
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
