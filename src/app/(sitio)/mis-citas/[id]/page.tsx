import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  PartyPopper,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Aviso, InsigniaEstado, InsigniaPago, Tarjeta, claseBoton } from "@/components/ui";
import { exigirPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { enlaceWhatsapp, enlacesMapa, formatoDuracion, formatoFechaLarga, formatoHora, formatoPesos } from "@/lib/formato";
import { marca } from "@/lib/marca";
import { wompiConfigurado } from "@/lib/wompi";
import type { Ajustes, Cita, Diseno, Pago } from "@/lib/tipos";
import { BotonesPago, CancelarCita } from "./acciones-cita";
import { procesarRetornoWompi, type ResultadoRetorno } from "./retorno-wompi";

export const metadata: Metadata = { title: "Detalle de mi cita" };

function fechaCalendario(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const METODOS: Record<string, string> = {
  CARD: "Tarjeta",
  PSE: "PSE",
  NEQUI: "Nequi",
  BANCOLOMBIA_TRANSFER: "Bancolombia",
  BANCOLOMBIA_QR: "QR Bancolombia",
  DAVIPLATA: "Daviplata",
};

export default async function PaginaCita({ params, searchParams }: PageProps<"/mis-citas/[id]">) {
  const { id } = await params;
  const { nueva, id: transaccionId } = await searchParams;
  const perfil = await exigirPerfil(`/mis-citas/${id}`);
  const supabase = await crearClienteServidor();

  const consultarCita = () =>
    supabase.from("citas").select("*").eq("id", id).eq("cliente_id", perfil.id).maybeSingle<Cita>();

  let { data: cita } = await consultarCita();
  if (!cita) notFound();

  let retorno: ResultadoRetorno = null;
  if (typeof transaccionId === "string" && transaccionId) {
    retorno = await procesarRetornoWompi(transaccionId, cita.id);
    if (retorno) ({ data: cita } = await consultarCita());
    if (!cita) notFound();
  }

  const [{ data: ajustesData }, { data: pagosData }, { data: disenoData }, foto] = await Promise.all([
    supabase.from("ajustes").select("*").eq("id", 1).single<Ajustes>(),
    supabase.from("pagos").select("*").eq("cita_id", cita.id).eq("estado", "aprobado").order("creado_en"),
    cita.diseno_id
      ? supabase.from("disenos").select("*").eq("id", cita.diseno_id).maybeSingle<Diseno>()
      : Promise.resolve({ data: null }),
    cita.foto_referencia
      ? supabase.storage.from("referencias").createSignedUrl(cita.foto_referencia, 60 * 60)
      : Promise.resolve({ data: null }),
  ]);

  const ajustes = ajustesData;
  const pagos = (pagosData as Pago[]) ?? [];
  const diseno = disenoData as Diseno | null;
  const fotoUrl = foto.data?.signedUrl ?? null;

  const activa = ["pendiente_pago", "confirmada", "en_camino", "en_curso"].includes(cita.estado);
  const horasCancelacion = ajustes?.horas_cancelacion ?? 2;
  const msHastaCita = new Date(cita.inicio).getTime() - new Date().getTime();
  const puedeCancelar =
    ["pendiente_pago", "confirmada"].includes(cita.estado) && msHastaCita >= horasCancelacion * 3600 * 1000;
  const pagosEnLinea = Boolean(ajustes?.pagos_en_linea) && wompiConfigurado();
  const saldo = cita.precio - cita.monto_pagado;
  const whatsapp = ajustes?.whatsapp;
  const textoFecha = `${formatoFechaLarga(cita.inicio)} a las ${formatoHora(cita.inicio)}`;

  const calendario = new URL("https://calendar.google.com/calendar/render");
  calendario.searchParams.set("action", "TEMPLATE");
  calendario.searchParams.set("text", `💅 ${cita.servicio_nombre} con ${marca.nombre}`);
  calendario.searchParams.set("dates", `${fechaCalendario(cita.inicio)}/${fechaCalendario(cita.fin)}`);
  calendario.searchParams.set("details", `Cita agendada en ${marca.nombreCompleto}.`);
  if (cita.direccion_texto) {
    calendario.searchParams.set("location", [cita.direccion_texto, cita.barrio, cita.ciudad].filter(Boolean).join(", "));
  }

  const mapa = cita.direccion_texto ? enlacesMapa(cita.direccion_texto, cita.ciudad, cita.lat, cita.lng) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <Link href="/mis-citas" className="inline-flex items-center gap-1.5 text-sm text-humo hover:text-ciruela-700">
        <ArrowLeft className="size-4" /> Mis citas
      </Link>

      {nueva === "1" && cita.estado !== "cancelada" && (
        <div className="fondo-satinado mt-5 animate-aparecer overflow-hidden rounded-[2rem] p-6 text-center ring-1 ring-linea sm:p-8">
          <PartyPopper className="mx-auto size-10 text-dorado-500" />
          <h1 className="mt-3 font-titulo text-4xl text-ciruela-900">
            {cita.estado === "pendiente_pago" ? "¡Ya casi! Tu espacio está apartado" : "¡Tu cita quedó agendada!"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-humo">
            {cita.estado === "pendiente_pago"
              ? "Solo falta el anticipo para dejarla confirmada. Te explicamos abajo cómo hacerlo."
              : `Ana María te espera el ${textoFecha}. ¡Prepárate para lucir divina!`}
          </p>
        </div>
      )}

      {retorno === "aprobado" && (
        <Aviso tipo="exito" className="mt-5">
          ¡Pago recibido! Gracias, tu pago quedó registrado.
        </Aviso>
      )}
      {(retorno === "rechazado" || retorno === "error" || retorno === "anulado") && (
        <Aviso tipo="error" className="mt-5">
          El pago no se pudo completar. Puedes intentarlo de nuevo con otro medio de pago.
        </Aviso>
      )}
      {retorno === "pendiente" && (
        <Aviso tipo="alerta" className="mt-5">
          Tu pago está en proceso. Te avisaremos apenas el banco lo confirme (puede tardar unos minutos).
        </Aviso>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Tarjeta className="p-6">
            <div className="flex flex-wrap gap-1.5">
              <InsigniaEstado estado={cita.estado} />
              {cita.estado !== "cancelada" && <InsigniaPago estado={cita.estado_pago} />}
            </div>
            <h2 className="mt-3 font-titulo text-3xl leading-tight text-ciruela-900">{cita.servicio_nombre}</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-dorado-600" />
                <div>
                  <dt className="sr-only">Fecha</dt>
                  <dd className="font-medium capitalize">{formatoFechaLarga(cita.inicio)}</dd>
                  <dd className="text-humo">
                    {formatoHora(cita.inicio)} – {formatoHora(cita.fin)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-dorado-600" />
                <dd>
                  {formatoDuracion(Math.round((new Date(cita.fin).getTime() - new Date(cita.inicio).getTime()) / 60000))}
                </dd>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-dorado-600" />
                <div>
                  <dt className="text-xs text-humo">{cita.modalidad === "salon" ? "En el salón" : "A domicilio"}</dt>
                  <dd className="font-medium">{cita.direccion_texto}</dd>
                  <dd className="text-humo">
                    {[cita.barrio, cita.ciudad].filter(Boolean).join(" · ")}
                    {cita.indicaciones ? ` · ${cita.indicaciones}` : ""}
                  </dd>
                  {cita.modalidad === "salon" && mapa && (
                    <a href={mapa.google} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-ciruela-700 hover:underline">
                      <Navigation className="size-3.5" /> Cómo llegar
                    </a>
                  )}
                </div>
              </div>
            </dl>

            {(cita.notas_cliente || diseno || fotoUrl) && (
              <div className="mt-6 border-t border-linea pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-humo">Tu idea</p>
                {cita.notas_cliente && <p className="text-sm italic text-tinta/80">“{cita.notas_cliente}”</p>}
                <div className="mt-3 flex gap-3">
                  {diseno && (
                    <figure className="w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={diseno.imagen_url} alt={diseno.titulo} className="aspect-[3/4] w-full rounded-2xl object-cover" />
                      <figcaption className="mt-1 text-xs text-humo">{diseno.titulo}</figcaption>
                    </figure>
                  )}
                  {fotoUrl && (
                    <figure className="w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoUrl} alt="Foto de referencia" className="aspect-[3/4] w-full rounded-2xl object-cover" />
                      <figcaption className="mt-1 text-xs text-humo">Tu referencia</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            )}

            {cita.estado === "cancelada" && (
              <Aviso tipo="info" className="mt-6">
                Esta cita fue cancelada{cita.motivo_cancelacion ? `: ${cita.motivo_cancelacion}` : "."}
              </Aviso>
            )}
          </Tarjeta>

          {activa && (
            <div className="flex flex-wrap gap-2">
              <a href={calendario.toString()} target="_blank" rel="noreferrer" className={claseBoton("secundario", "sm")}>
                <CalendarPlus className="size-4" /> Agregar a mi calendario
              </a>
              {whatsapp && (
                <a
                  href={enlaceWhatsapp(
                    whatsapp,
                    `Hola Ana María 💅 te escribo por mi cita de ${cita.servicio_nombre} el ${textoFecha}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={claseBoton("secundario", "sm")}
                >
                  <MessageCircle className="size-4" /> Escribirle a Ana María
                </a>
              )}
            </div>
          )}
        </div>

        {/* Pago */}
        <div className="space-y-5">
          <Tarjeta className="p-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-humo">
              <Receipt className="size-4" /> Pago
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-humo">Valor del servicio</dt>
                <dd className="font-semibold">{formatoPesos(cita.precio)}</dd>
              </div>
              {cita.anticipo_requerido && (
                <div className="flex justify-between">
                  <dt className="text-humo">Anticipo para separar</dt>
                  <dd>{formatoPesos(cita.monto_anticipo)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-humo">Pagado</dt>
                <dd className="text-emerald-700">{formatoPesos(cita.monto_pagado)}</dd>
              </div>
              <div className="flex justify-between border-t border-linea pt-2 text-base">
                <dt>Saldo</dt>
                <dd className="font-semibold text-ciruela-800">{formatoPesos(Math.max(saldo, 0))}</dd>
              </div>
            </dl>

            {pagos.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-linea pt-4 text-xs text-humo">
                {pagos.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>
                      {new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short" }).format(
                        new Date(p.creado_en),
                      )}{" "}
                      · {p.metodo ? (METODOS[p.metodo] ?? p.metodo) : p.proveedor === "manual" ? "Registrado por Ana María" : "Wompi"}
                    </span>
                    <span>{formatoPesos(p.monto)}</span>
                  </li>
                ))}
              </ul>
            )}

            {activa && saldo > 0 && (
              <div className="mt-5">
                {pagosEnLinea ? (
                  <BotonesPago
                    citaId={cita.id}
                    anticipo={cita.anticipo_requerido && cita.monto_pagado === 0 ? cita.monto_anticipo : 0}
                    saldo={saldo}
                    yaPagoAlgo={cita.monto_pagado > 0}
                  />
                ) : cita.estado === "pendiente_pago" ? (
                  <div className="space-y-3">
                    <Aviso tipo="alerta">
                      {ajustes?.instrucciones_pago ??
                        "Envía el anticipo y Ana María confirmará tu cita."}
                    </Aviso>
                    {whatsapp && (
                      <a
                        href={enlaceWhatsapp(
                          whatsapp,
                          `Hola Ana María 💅 te envío el comprobante del anticipo (${formatoPesos(cita.monto_anticipo)}) de mi cita de ${cita.servicio_nombre} el ${textoFecha}.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className={claseBoton("primario", "md", "w-full")}
                      >
                        <MessageCircle className="size-4" /> Enviar comprobante por WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-humo">El saldo lo pagas el día de tu cita directamente a Ana María.</p>
                )}
              </div>
            )}

            {cita.estado === "pendiente_pago" && cita.expira_en && (
              <p className="mt-3 text-xs text-amber-800">
                Si el anticipo no se paga antes de las {formatoHora(cita.expira_en)}, el espacio se libera para otra clienta.
              </p>
            )}
          </Tarjeta>

          {activa && (
            <Tarjeta className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-humo">¿Cambio de planes?</p>
              {puedeCancelar ? (
                <CancelarCita citaId={cita.id} horas={horasCancelacion} />
              ) : (
                <p className="mt-2 text-sm text-humo">
                  {["pendiente_pago", "confirmada"].includes(cita.estado)
                    ? `Ya faltan menos de ${horasCancelacion} horas para tu cita, así que no se puede cancelar desde la app. Escríbele a Ana María.`
                    : "Ana María ya está en camino o atendiéndote. Si necesitas algo, escríbele."}
                </p>
              )}
            </Tarjeta>
          )}
        </div>
      </div>
    </div>
  );
}
