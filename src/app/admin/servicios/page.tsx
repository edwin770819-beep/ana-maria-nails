import Link from "next/link";
import { Clock, Pencil, Plus } from "lucide-react";
import { BotonEnlace, Insignia, PortadaServicio, Tarjeta, TituloSeccion, Vacio, cx } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatoDuracion, formatoPesos } from "@/lib/formato";
import type { Servicio } from "@/lib/tipos";
import { FormularioAccion } from "../_componentes/formulario-accion";
import { alternarServicio } from "./acciones";

export const metadata = { title: "Servicios" };

const MODALIDAD = { domicilio: "Solo domicilio", salon: "Solo salón", ambos: "Domicilio y salón" };

export default async function PaginaServicios() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("servicios").select("*").order("orden").order("nombre");
  const servicios = (data ?? []) as Servicio[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloSeccion
          antetitulo="Tu menú"
          titulo="Servicios y precios"
          descripcion="El precio incluye el domicilio. Lo que ocultes no aparecerá a tus clientas."
        />
        <BotonEnlace href="/admin/servicios/nuevo">
          <Plus className="size-4" /> Nuevo servicio
        </BotonEnlace>
      </div>

      {servicios.length === 0 ? (
        <Vacio titulo="Aún no tienes servicios">Crea el primero para que tus clientas puedan agendar.</Vacio>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {servicios.map((s) => (
            <Tarjeta key={s.id} className={cx("flex flex-col overflow-hidden", !s.activo && "opacity-60")}>
              <div className="aspect-[16/9]">
                <PortadaServicio imagen={s.imagen_url} nombre={s.nombre} />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-dorado-600">{s.categoria}</p>
                    <p className="font-titulo text-xl leading-tight text-ciruela-900">{s.nombre}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-ciruela-700">{formatoPesos(s.precio)}</p>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-humo">
                  <Clock className="size-3.5" /> {formatoDuracion(s.duracion_minutos)} · {MODALIDAD[s.modalidad]}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <FormularioAccion accion={alternarServicio}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="activo" value={String(s.activo)} />
                    <button type="submit">
                      <Insignia
                        className={
                          s.activo
                            ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                            : "bg-stone-100 text-stone-600 ring-stone-200"
                        }
                      >
                        {s.activo ? "Visible · ocultar" : "Oculto · mostrar"}
                      </Insignia>
                    </button>
                  </FormularioAccion>
                  <Link
                    href={`/admin/servicios/${s.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ciruela-700 hover:underline"
                  >
                    <Pencil className="size-3.5" /> Editar
                  </Link>
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
