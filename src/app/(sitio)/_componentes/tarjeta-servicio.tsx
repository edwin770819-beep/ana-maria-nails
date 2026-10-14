import Link from "next/link";
import { CalendarHeart, Clock } from "lucide-react";
import { PortadaServicio, claseBoton } from "@/components/ui";
import { formatoDuracion, formatoPesos } from "@/lib/formato";
import type { Servicio } from "@/lib/tipos";

export function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-marfil ring-1 ring-linea shadow-suave transition hover:-translate-y-0.5 hover:shadow-flotante">
      <div className="relative aspect-[4/3] overflow-hidden">
        <PortadaServicio
          imagen={servicio.imagen_url}
          nombre={servicio.nombre}
          className="transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-marfil/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ciruela-700 backdrop-blur">
          {servicio.categoria}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-titulo text-2xl leading-tight text-ciruela-900">{servicio.nombre}</h3>
        {servicio.descripcion && <p className="mt-2 line-clamp-3 text-sm text-humo">{servicio.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xl font-semibold text-ciruela-800">{formatoPesos(servicio.precio)}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-humo">
              <Clock className="size-3.5" /> {formatoDuracion(servicio.duracion_minutos)} · domicilio incluido
            </p>
          </div>
          <Link href={`/reservar?servicio=${servicio.id}`} className={claseBoton("primario", "sm")}>
            <CalendarHeart className="size-4" />
            Agendar
          </Link>
        </div>
      </div>
    </article>
  );
}
