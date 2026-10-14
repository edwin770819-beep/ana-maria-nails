import { Eye, EyeOff, Images, Trash2 } from "lucide-react";
import { Tarjeta, TituloSeccion, Vacio, cx } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Diseno } from "@/lib/tipos";
import { BotonConfirmar } from "../_componentes/boton-confirmar";
import { FormularioAccion } from "../_componentes/formulario-accion";
import { alternarDiseno, borrarDiseno } from "./acciones";
import { SubirDisenos } from "./subir-disenos";

export const metadata = { title: "Galería" };

export default async function PaginaGaleria() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("disenos").select("*").order("orden").order("creado_en", { ascending: false });
  const disenos = (data ?? []) as Diseno[];

  return (
    <div className="space-y-6">
      <TituloSeccion
        antetitulo="Tu portafolio"
        titulo="Galería de diseños"
        descripcion="Sube fotos de tus trabajos. Tus clientas podrán inspirarse y elegir un diseño al agendar."
      />

      <Tarjeta className="p-5 sm:p-6">
        <SubirDisenos />
      </Tarjeta>

      {disenos.length === 0 ? (
        <Vacio icono={<Images className="size-10" />} titulo="Tu galería está vacía">
          Las fotos de tus diseños son lo que más enamora a una clienta nueva. ¡Sube las primeras!
        </Vacio>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {disenos.map((d) => (
            <div key={d.id} className={cx("group overflow-hidden rounded-3xl bg-white ring-1 ring-linea", !d.activo && "opacity-50")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.imagen_url} alt={d.titulo} className="aspect-square w-full object-cover" loading="lazy" />
              <div className="flex items-center gap-1 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.titulo}</p>
                  <p className="truncate text-xs text-humo">{d.categoria}</p>
                </div>
                <FormularioAccion accion={alternarDiseno}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="activo" value={String(d.activo)} />
                  <button
                    type="submit"
                    aria-label={d.activo ? "Ocultar" : "Mostrar"}
                    className="flex size-8 items-center justify-center rounded-full text-humo hover:bg-ciruela-50 hover:text-ciruela-700"
                  >
                    {d.activo ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </FormularioAccion>
                <FormularioAccion accion={borrarDiseno}>
                  <input type="hidden" name="id" value={d.id} />
                  <BotonConfirmar etiqueta="Borrar" confirmar="¿Borrar?">
                    <Trash2 className="size-4" />
                  </BotonConfirmar>
                </FormularioAccion>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
