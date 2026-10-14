import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AreaTexto, Campo, Entrada, Selector, Tarjeta, TituloSeccion } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Servicio } from "@/lib/tipos";
import { BotonEnviar, FormularioAccion } from "../../_componentes/formulario-accion";
import { Interruptor } from "../../_componentes/interruptor";
import { SubirImagen } from "../../_componentes/subir-imagen";
import { guardarServicio } from "../acciones";

export const metadata = { title: "Editar servicio" };

const CATEGORIAS = ["Manos", "Pies", "Combos", "Spa", "Diseño"];

export default async function PaginaEditarServicio({ params }: PageProps<"/admin/servicios/[id]">) {
  const { id } = await params;
  let servicio: Servicio | null = null;
  if (id !== "nuevo") {
    const supabase = await crearClienteServidor();
    const { data } = await supabase.from("servicios").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    servicio = data as Servicio;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/servicios" className="inline-flex items-center gap-1.5 text-sm text-humo hover:text-ciruela-700">
        <ArrowLeft className="size-4" /> Servicios
      </Link>
      <TituloSeccion titulo={servicio ? servicio.nombre : "Nuevo servicio"} />

      <FormularioAccion accion={guardarServicio} className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <input type="hidden" name="id" value={servicio?.id ?? ""} />
        <Tarjeta className="p-5">
          <p className="mb-3 text-sm font-medium">Foto del servicio</p>
          <SubirImagen nombre="imagen_url" inicial={servicio?.imagen_url} carpeta="servicios" />
          <p className="mt-3 text-xs text-humo">Una foto de un trabajo tuyo hace que el servicio se vea irresistible.</p>
        </Tarjeta>

        <Tarjeta className="space-y-4 p-5 sm:p-6">
          <Campo etiqueta="Nombre">
            <Entrada name="nombre" required defaultValue={servicio?.nombre} placeholder="Manicure semipermanente" />
          </Campo>
          <Campo etiqueta="Descripción">
            <AreaTexto
              name="descripcion"
              defaultValue={servicio?.descripcion ?? ""}
              placeholder="Qué incluye, cuánto dura el resultado…"
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Categoría">
              <Entrada name="categoria" list="categorias" defaultValue={servicio?.categoria ?? "Manos"} />
              <datalist id="categorias">
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Campo>
            <Campo etiqueta="Dónde se presta">
              <Selector name="modalidad" defaultValue={servicio?.modalidad ?? "ambos"}>
                <option value="ambos">Domicilio y salón</option>
                <option value="domicilio">Solo domicilio</option>
                <option value="salon">Solo salón</option>
              </Selector>
            </Campo>
            <Campo etiqueta="Duración (minutos)" ayuda="Entre 45 y 90 min normalmente">
              <Entrada
                name="duracion_minutos"
                type="number"
                min={10}
                max={480}
                step={5}
                required
                defaultValue={servicio?.duracion_minutos ?? 60}
              />
            </Campo>
            <Campo etiqueta="Precio (COP)" ayuda="Incluye el domicilio">
              <Entrada
                name="precio"
                type="number"
                min={0}
                step={1000}
                required
                defaultValue={servicio?.precio ?? ""}
                placeholder="55000"
              />
            </Campo>
            <Campo etiqueta="Orden en el menú" ayuda="Los números menores salen primero">
              <Entrada name="orden" type="number" defaultValue={servicio?.orden ?? 0} />
            </Campo>
          </div>
          <Interruptor
            nombre="activo"
            inicial={servicio?.activo ?? true}
            etiqueta="Visible para las clientas"
            descripcion="Si lo apagas, nadie podrá agendarlo."
          />
          <BotonEnviar className="w-full">Guardar servicio</BotonEnviar>
        </Tarjeta>
      </FormularioAccion>
    </div>
  );
}
