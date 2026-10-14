import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeart, ChevronRight, MapPin } from "lucide-react";
import { BotonEnlace, InsigniaEstado, InsigniaPago, TituloSeccion, Vacio } from "@/components/ui";
import { exigirPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import type { Cita } from "@/lib/tipos";

export const metadata: Metadata = { title: "Mis citas" };

const ACTIVAS = ["pendiente_pago", "confirmada", "en_camino", "en_curso"];

export default async function PaginaMisCitas() {
  const perfil = await exigirPerfil("/mis-citas");
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("citas")
    .select("*")
    .eq("cliente_id", perfil.id)
    .order("inicio", { ascending: false })
    .limit(100);

  const citas = (data as Cita[]) ?? [];
  const ahora = new Date().toISOString();
  const proximas = citas
    .filter((c) => ACTIVAS.includes(c.estado) && c.fin >= ahora)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const historial = citas.filter((c) => !proximas.includes(c));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloSeccion
          antetitulo={`Hola, ${perfil.nombre?.split(" ")[0] ?? "bonita"} ♡`}
          titulo="Mis citas"
        />
        <BotonEnlace href="/reservar" tamano="sm">
          <CalendarHeart className="size-4" /> Nueva cita
        </BotonEnlace>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-humo">Próximas</h2>
        {proximas.length === 0 ? (
          <Vacio icono={<CalendarHeart className="size-8" />} titulo="No tienes citas próximas">
            ¿Qué tal si te consientes esta semana?
            <div className="mt-5">
              <BotonEnlace href="/reservar" tamano="sm">
                Agendar mi cita
              </BotonEnlace>
            </div>
          </Vacio>
        ) : (
          <ul className="space-y-3">
            {proximas.map((c) => (
              <ItemCita key={c.id} cita={c} destacada />
            ))}
          </ul>
        )}
      </section>

      {historial.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-humo">Historial</h2>
          <ul className="space-y-3">
            {historial.map((c) => (
              <ItemCita key={c.id} cita={c} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ItemCita({ cita, destacada = false }: { cita: Cita; destacada?: boolean }) {
  return (
    <li>
      <Link
        href={`/mis-citas/${cita.id}`}
        className={
          destacada
            ? "flex items-center gap-4 rounded-3xl bg-marfil p-5 ring-1 ring-linea shadow-suave transition hover:shadow-flotante"
            : "flex items-center gap-4 rounded-3xl bg-white/60 p-4 ring-1 ring-linea transition hover:bg-marfil"
        }
      >
        <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-ciruela-50 py-2 text-ciruela-800">
          <span className="text-[0.65rem] uppercase">
            {new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", month: "short" }).format(new Date(cita.inicio)).replace(".", "")}
          </span>
          <span className="font-titulo text-2xl leading-none">
            {new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "numeric" }).format(new Date(cita.inicio))}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-titulo text-xl text-ciruela-900">{cita.servicio_nombre}</p>
          <p className="text-sm capitalize text-humo">
            {formatoFechaLarga(cita.inicio)} · {formatoHora(cita.inicio)}
          </p>
          {destacada && cita.direccion_texto && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-humo">
              <MapPin className="size-3" /> {cita.direccion_texto}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <InsigniaEstado estado={cita.estado} />
            {cita.estado !== "cancelada" && cita.precio > 0 && <InsigniaPago estado={cita.estado_pago} />}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-sm font-semibold text-ciruela-800">{formatoPesos(cita.precio)}</span>
          <ChevronRight className="size-4 text-humo" />
        </div>
      </Link>
    </li>
  );
}
