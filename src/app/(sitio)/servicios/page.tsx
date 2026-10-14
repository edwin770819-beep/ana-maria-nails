import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { TituloSeccion, Vacio } from "@/components/ui";
import { agruparPorCategoria, obtenerServicios } from "../_componentes/datos";
import { TarjetaServicio } from "../_componentes/tarjeta-servicio";

export const metadata: Metadata = { title: "Servicios y precios" };

export default async function PaginaServicios() {
  const servicios = await obtenerServicios();
  const grupos = agruparPorCategoria(servicios);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
      <TituloSeccion
        antetitulo="Servicios y precios"
        titulo="Consiéntete de pies a cabeza"
        descripcion="Todos los precios incluyen el domicilio. Elige el tuyo y agenda en segundos."
      />

      {grupos.length > 0 && (
        <nav className="sin-scrollbar sticky top-16 z-30 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-crema/90 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          {grupos.map(([categoria]) => (
            <a
              key={categoria}
              href={`#${encodeURIComponent(categoria)}`}
              className="shrink-0 rounded-full bg-marfil px-4 py-2 text-sm font-medium text-ciruela-800 ring-1 ring-linea hover:bg-ciruela-50"
            >
              {categoria}
            </a>
          ))}
        </nav>
      )}

      {grupos.length === 0 ? (
        <div className="mt-10">
          <Vacio icono={<Sparkles className="size-8" />} titulo="Muy pronto verás aquí los servicios">
            Ana María está preparando su carta de servicios. ¡Vuelve en un ratico!
          </Vacio>
        </div>
      ) : (
        grupos.map(([categoria, items]) => (
          <section key={categoria} id={encodeURIComponent(categoria)} className="scroll-mt-32 pt-10">
            <h2 className="font-titulo text-3xl italic text-ciruela-800">{categoria}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <TarjetaServicio key={s.id} servicio={s} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
