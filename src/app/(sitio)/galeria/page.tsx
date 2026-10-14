import type { Metadata } from "next";
import { Images } from "lucide-react";
import { BotonEnlace, TituloSeccion, Vacio } from "@/components/ui";
import { obtenerDisenos } from "../_componentes/datos";
import { GaleriaFiltrable } from "./galeria-filtrable";

export const metadata: Metadata = { title: "Galería de diseños" };

export default async function PaginaGaleria() {
  const disenos = await obtenerDisenos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
      <TituloSeccion
        antetitulo="Inspiración"
        titulo="Galería de diseños"
        descripcion="Toca el diseño que te enamore y agéndalo directamente. Ana María lo adapta a tu estilo."
      />
      {disenos.length === 0 ? (
        <div className="mt-10">
          <Vacio icono={<Images className="size-8" />} titulo="La galería se está llenando de magia">
            Muy pronto encontrarás aquí los trabajos y diseños de Ana María. Mientras tanto, puedes agendar y contarle
            tu idea o subir una foto de referencia.
            <div className="mt-5">
              <BotonEnlace href="/reservar" tamano="sm">
                Agendar mi cita
              </BotonEnlace>
            </div>
          </Vacio>
        </div>
      ) : (
        <GaleriaFiltrable disenos={disenos} />
      )}
    </div>
  );
}
