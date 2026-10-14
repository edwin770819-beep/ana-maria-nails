import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import { exigirPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Direccion } from "@/lib/tipos";
import { obtenerAjustes, obtenerCiudades, obtenerDisenos, obtenerServicios } from "../_componentes/datos";
import { FormularioDatos } from "../_componentes/formulario-datos";
import { Asistente } from "./asistente";

export const metadata: Metadata = { title: "Agendar cita" };

export default async function PaginaReservar({ searchParams }: PageProps<"/reservar">) {
  const perfil = await exigirPerfil("/reservar");
  const { servicio, diseno } = await searchParams;

  // Antes de reservar necesitamos nombre, celular y la autorización de datos
  if (!perfil.nombre || !perfil.telefono || !perfil.acepto_datos_en) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 md:py-16">
        <TituloSeccion
          antetitulo="Antes de empezar"
          titulo="Cuéntanos un poquito de ti"
          descripcion="Solo te lo pedimos una vez, para que Ana María pueda confirmar tu cita."
        />
        <Tarjeta className="mt-8 p-6">
          <FormularioDatos perfil={perfil} conCumpleanos={false} textoBoton="Continuar" />
        </Tarjeta>
      </div>
    );
  }

  const supabase = await crearClienteServidor();
  const [servicios, disenos, ajustes, ciudades, { data: direcciones }, { data: esFrecuente }] = await Promise.all([
    obtenerServicios(),
    obtenerDisenos(),
    obtenerAjustes(),
    obtenerCiudades(),
    supabase
      .from("direcciones")
      .select("*")
      .eq("cliente_id", perfil.id)
      .order("principal", { ascending: false })
      .order("creado_en"),
    supabase.rpc("es_frecuente", { p_cliente: perfil.id }),
  ]);

  if (!servicios.length || !ajustes) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vacio icono={<Sparkles className="size-8" />} titulo="La agenda abre muy pronto">
          Ana María está organizando sus servicios y horarios. ¡Vuelve en un ratico!
        </Vacio>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <Asistente
        servicios={servicios}
        disenos={disenos}
        ajustes={ajustes}
        ciudades={ciudades}
        direcciones={(direcciones as Direccion[]) ?? []}
        usuarioId={perfil.id}
        esFrecuente={esFrecuente === true}
        servicioInicial={typeof servicio === "string" ? servicio : null}
        disenoInicial={typeof diseno === "string" ? diseno : null}
      />
    </div>
  );
}
