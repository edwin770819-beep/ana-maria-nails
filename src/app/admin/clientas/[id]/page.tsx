import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cake, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AreaTexto, InsigniaEstado, InsigniaPago, Tarjeta, Vacio } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { aFecha, enlaceWhatsapp, fechaLocal, formatoFechaCorta, formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import type { Cita, Direccion, Perfil } from "@/lib/tipos";
import { BotonEnviar, FormularioAccion } from "../../_componentes/formulario-accion";
import { BotonFrecuente } from "../_frecuente";
import { guardarNota } from "../acciones";

export const metadata = { title: "Clienta" };

export default async function PaginaClienta({ params }: PageProps<"/admin/clientas/[id]">) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", id).maybeSingle();
  if (!perfil) notFound();
  const p = perfil as Perfil;

  const [{ data: citasData }, { data: direccionesData }, { data: nota }, { data: ajustes }] = await Promise.all([
    supabase.from("citas").select("*").eq("cliente_id", id).order("inicio", { ascending: false }),
    supabase.from("direcciones").select("*").eq("cliente_id", id).order("principal", { ascending: false }),
    supabase.from("notas_clientas").select("nota").eq("cliente_id", id).maybeSingle(),
    supabase.from("ajustes").select("visitas_cliente_frecuente").eq("id", 1).single(),
  ]);
  const citas = (citasData ?? []) as Cita[];
  const direcciones = (direccionesData ?? []) as Direccion[];
  const completadas = citas.filter((c) => c.estado === "completada");
  const gastado = completadas.reduce((s, c) => s + c.monto_pagado, 0);
  const umbral = ajustes?.visitas_cliente_frecuente ?? 3;

  // Servicio favorito
  const conteo = new Map<string, number>();
  completadas.forEach((c) => c.servicio_nombre && conteo.set(c.servicio_nombre, (conteo.get(c.servicio_nombre) ?? 0) + 1));
  const favorito = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-6">
      <Link href="/admin/clientas" className="inline-flex items-center gap-1.5 text-sm text-humo hover:text-ciruela-700">
        <ArrowLeft className="size-4" /> Clientas
      </Link>

      {/* Ficha */}
      <Tarjeta className="fondo-satinado overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-ciruela-600 to-ciruela-900 font-titulo text-3xl text-white">
            {(p.nombre || p.email || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-titulo text-3xl text-ciruela-900">{p.nombre || "Sin nombre"}</h1>
            <p className="text-sm text-humo">Clienta desde {formatoFechaLarga(p.creado_en)}</p>
          </div>
          <BotonFrecuente id={p.id} manual={p.frecuente_manual} porVisitas={completadas.length >= umbral} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          {p.telefono && (
            <>
              <a
                href={enlaceWhatsapp(p.telefono, `Hola ${p.nombre?.split(" ")[0] ?? ""} ♡`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-linea"
              >
                <MessageCircle className="size-4 text-emerald-600" /> WhatsApp
              </a>
              <a href={`tel:${p.telefono}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-linea">
                <Phone className="size-4 text-ciruela-600" /> {p.telefono}
              </a>
            </>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-linea">
              <Mail className="size-4 text-ciruela-600" /> {p.email}
            </a>
          )}
          {p.fecha_nacimiento && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-linea">
              <Cake className="size-4 text-dorado-500" /> {formatoFechaLarga(aFecha(p.fecha_nacimiento, "12:00")).split(",")[1]}
            </span>
          )}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { e: "Visitas", v: String(completadas.length) },
            { e: "Total pagado", v: formatoPesos(gastado) },
            { e: "Su favorito", v: favorito ?? "—" },
          ].map((x) => (
            <div key={x.e} className="rounded-2xl bg-white/80 p-3 ring-1 ring-linea">
              <p className="text-xs text-humo">{x.e}</p>
              <p className="truncate font-titulo text-xl text-ciruela-900">{x.v}</p>
            </div>
          ))}
        </div>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          {/* Nota privada */}
          <Tarjeta className="p-5">
            <h2 className="font-titulo text-xl text-ciruela-900">Notas privadas</h2>
            <p className="text-xs text-humo">Solo tú las ves: alergias, forma de uña, colores favoritos, mascotas…</p>
            <FormularioAccion accion={guardarNota} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={p.id} />
              <AreaTexto name="nota" defaultValue={nota?.nota ?? ""} className="min-h-32" placeholder="Ej: alérgica al acetona, le gusta la forma almendra…" />
              <BotonEnviar tamano="sm">Guardar nota</BotonEnviar>
            </FormularioAccion>
          </Tarjeta>

          {/* Direcciones */}
          <Tarjeta className="p-5">
            <h2 className="font-titulo text-xl text-ciruela-900">Direcciones</h2>
            {direcciones.length === 0 ? (
              <p className="mt-2 text-sm text-humo">Aún no ha guardado direcciones.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {direcciones.map((d) => (
                  <li key={d.id} className="flex gap-2 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-ciruela-500" />
                    <span>
                      <span className="font-medium">{d.etiqueta}:</span> {d.direccion}
                      {d.barrio && `, ${d.barrio}`} · {d.ciudad}
                      {d.indicaciones && <span className="block text-xs text-humo">{d.indicaciones}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>

        {/* Historial */}
        <Tarjeta className="p-5">
          <h2 className="font-titulo text-xl text-ciruela-900">Historial de citas</h2>
          {citas.length === 0 ? (
            <div className="mt-3">
              <Vacio titulo="Sin citas todavía" />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-linea">
              {citas.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin?vista=dia&fecha=${fechaLocal(c.inicio)}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 hover:opacity-80"
                  >
                    <span>
                      <span className="block text-sm font-medium">{c.servicio_nombre}</span>
                      <span className="block text-xs capitalize text-humo">
                        {formatoFechaCorta(c.inicio)} · {formatoHora(c.inicio)} · {formatoPesos(c.precio)}
                      </span>
                    </span>
                    <span className="flex gap-1.5">
                      <InsigniaEstado estado={c.estado} />
                      <InsigniaPago estado={c.estado_pago} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
