import { TituloSeccion } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaLocal } from "@/lib/formato";
import type { Ajustes, Ciudad, Servicio } from "@/lib/tipos";
import { esFechaValida } from "../../_componentes/tiempo";
import { FormularioNuevaCita } from "./formulario";

export const metadata = { title: "Nueva cita" };

export default async function PaginaNuevaCita({ searchParams }: PageProps<"/admin/citas/nueva">) {
  const { fecha } = await searchParams;
  const supabase = await crearClienteServidor();
  const [{ data: servicios }, { data: ajustes }, { data: ciudades }] = await Promise.all([
    supabase.from("servicios").select("*").eq("activo", true).order("orden"),
    supabase.from("ajustes").select("*").eq("id", 1).single(),
    supabase.from("ciudades").select("*").eq("activa", true).order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <TituloSeccion
        antetitulo="Agenda manual"
        titulo="Nueva cita"
        descripcion="Para las clientas que te escriben por WhatsApp o te llaman. La cita queda confirmada de una vez."
      />
      <FormularioNuevaCita
        servicios={(servicios ?? []) as Servicio[]}
        ajustes={ajustes as Ajustes | null}
        ciudades={((ciudades ?? []) as Ciudad[]).map((c) => c.nombre)}
        fechaInicial={esFechaValida(fecha) ? fecha : fechaLocal()}
      />
    </div>
  );
}
