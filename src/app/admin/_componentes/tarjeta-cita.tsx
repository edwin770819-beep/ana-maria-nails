import { Clock, MapPin, MessageCircle, Navigation, Phone, StickyNote } from "lucide-react";
import { InsigniaEstado, InsigniaPago, Tarjeta, cx } from "@/components/ui";
import { enlaceWhatsapp, enlacesMapa, formatoHora, formatoPesos } from "@/lib/formato";
import { AccionesCita } from "./acciones-cita";
import { nombreClienta, telefonoClienta, type CitaAgenda } from "./datos";
import { partesHora } from "./tiempo";

const enlaceChip =
  "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ciruela-800 ring-1 ring-ciruela-100 hover:bg-ciruela-50";

export function TarjetaCita({ cita, orden }: { cita: CitaAgenda; orden?: number }) {
  const nombre = nombreClienta(cita);
  const telefono = telefonoClienta(cita);
  const saldo = Math.max(cita.precio - cita.monto_pagado, 0);
  const mapa = cita.direccion_texto ? enlacesMapa(cita.direccion_texto, cita.ciudad, cita.lat, cita.lng) : null;
  const inicio = partesHora(cita.inicio);
  const apagada = cita.estado === "cancelada" || cita.estado === "no_asistio";

  return (
    <Tarjeta className={cx("overflow-hidden", apagada && "opacity-60")}>
      <div className="flex items-stretch">
        {/* Columna de hora */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 bg-gradient-to-b from-ciruela-700 to-ciruela-900 px-2 py-4 text-center text-white sm:w-24">
          {orden != null && (
            <span className="flex size-6 items-center justify-center rounded-full bg-white/15 text-xs">{orden}</span>
          )}
          <span className="font-titulo text-xl leading-none">{inicio.hora}</span>
          <span className="text-[0.65rem] uppercase tracking-wider text-white/70">{inicio.sufijo}</span>
          <span className="mt-1 flex items-center gap-1 text-[0.65rem] text-white/70">
            <Clock className="size-3" /> {formatoHora(cita.fin)}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-titulo text-xl leading-tight text-ciruela-900">{nombre}</p>
              <p className="text-sm text-humo">{cita.servicio_nombre}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <InsigniaEstado estado={cita.estado} />
              <InsigniaPago estado={cita.estado_pago} />
            </div>
          </div>

          {/* Contacto */}
          {telefono && (
            <div className="flex flex-wrap gap-2">
              <a
                className={enlaceChip}
                href={enlaceWhatsapp(telefono, `Hola ${nombre.split(" ")[0]}, te escribe Ana María ♡ `)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
              <a className={enlaceChip} href={`tel:${telefono.replace(/\s/g, "")}`}>
                <Phone className="size-3.5" /> {telefono}
              </a>
            </div>
          )}

          {/* Dirección */}
          {cita.direccion_texto && (
            <div className="rounded-2xl bg-rubor-50/70 p-3 text-sm ring-1 ring-rubor-100">
              <p className="flex items-start gap-2 font-medium text-tinta">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ciruela-500" />
                <span>
                  {cita.direccion_texto}
                  {cita.barrio && <span className="font-normal text-humo"> · {cita.barrio}</span>}
                  {cita.ciudad && <span className="font-normal text-humo"> · {cita.ciudad}</span>}
                </span>
              </p>
              {cita.indicaciones && <p className="ml-6 mt-1 text-humo">{cita.indicaciones}</p>}
              {mapa && (
                <div className="ml-6 mt-2 flex flex-wrap gap-2">
                  <a className={enlaceChip} href={mapa.google} target="_blank" rel="noreferrer">
                    <Navigation className="size-3.5" /> Google Maps
                  </a>
                  <a className={enlaceChip} href={mapa.waze} target="_blank" rel="noreferrer">
                    <Navigation className="size-3.5" /> Waze
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Notas, diseño y referencia */}
          {cita.notas_cliente && (
            <p className="flex items-start gap-2 text-sm text-tinta/80">
              <StickyNote className="mt-0.5 size-4 shrink-0 text-dorado-500" />
              <span className="italic">“{cita.notas_cliente}”</span>
            </p>
          )}
          {(cita.diseno || cita.foto_url) && (
            <div className="flex flex-wrap gap-3">
              {cita.diseno && (
                <a href={cita.diseno.imagen_url} target="_blank" rel="noreferrer" className="group w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cita.diseno.imagen_url}
                    alt={cita.diseno.titulo}
                    className="aspect-square w-24 rounded-2xl object-cover ring-1 ring-linea"
                  />
                  <span className="mt-1 block truncate text-[0.7rem] text-humo">Diseño: {cita.diseno.titulo}</span>
                </a>
              )}
              {cita.foto_url && (
                <a href={cita.foto_url} target="_blank" rel="noreferrer" className="w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cita.foto_url}
                    alt="Foto de referencia"
                    className="aspect-square w-24 rounded-2xl object-cover ring-1 ring-linea"
                  />
                  <span className="mt-1 block text-[0.7rem] text-humo">Su referencia</span>
                </a>
              )}
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 text-center ring-1 ring-linea">
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-humo">Valor</p>
              <p className="font-semibold">{formatoPesos(cita.precio)}</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-humo">Pagado</p>
              <p className="font-semibold text-emerald-700">{formatoPesos(cita.monto_pagado)}</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-humo">Por cobrar</p>
              <p className={cx("font-semibold", saldo > 0 ? "text-ciruela-700" : "text-humo")}>{formatoPesos(saldo)}</p>
            </div>
          </div>
          {cita.estado === "pendiente_pago" && cita.monto_anticipo > 0 && (
            <p className="text-xs text-amber-800">
              Clienta nueva: anticipo de {formatoPesos(cita.monto_anticipo)} pendiente.
            </p>
          )}
          {cita.estado === "cancelada" && cita.motivo_cancelacion && (
            <p className="text-xs text-humo">Motivo: {cita.motivo_cancelacion}</p>
          )}

          <AccionesCita id={cita.id} estado={cita.estado} saldo={saldo} />
        </div>
      </div>
    </Tarjeta>
  );
}
