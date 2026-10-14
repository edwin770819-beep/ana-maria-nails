"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Home,
  ImagePlus,
  MapPin,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Sunset,
  X,
} from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { Aviso, AreaTexto, Boton, PortadaServicio, Tarjeta, cx } from "@/components/ui";
import {
  aFecha,
  fechaLocal,
  formatoDuracion,
  formatoFechaLarga,
  formatoHora,
  formatoPesos,
  sumarDias,
} from "@/lib/formato";
import { ZONA_HORARIA, marca } from "@/lib/marca";
import type { Ajustes, Ciudad, Direccion, Diseno, Modalidad, Servicio } from "@/lib/tipos";
import { FormularioDireccion } from "../_componentes/formulario-direccion";
import { reservar } from "./acciones";

const PASOS = ["Servicio", "Fecha y hora", "Lugar", "Detalles", "Confirmar"];

const fmtDiaSemana = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_HORARIA, weekday: "short" });
const fmtDiaMes = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_HORARIA, day: "numeric" });
const fmtMes = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_HORARIA, month: "short" });

/** Hora (0-23) en Bogotá de una fecha ISO. Bogotá es UTC-5 fijo. */
function horaBogota(iso: string) {
  return (new Date(iso).getUTCHours() + 19) % 24;
}

export function Asistente({
  servicios,
  disenos,
  ajustes,
  ciudades,
  direcciones: direccionesIniciales,
  usuarioId,
  esFrecuente,
  servicioInicial,
  disenoInicial,
}: {
  servicios: Servicio[];
  disenos: Diseno[];
  ajustes: Ajustes;
  ciudades: Ciudad[];
  direcciones: Direccion[];
  usuarioId: string;
  esFrecuente: boolean;
  servicioInicial: string | null;
  disenoInicial: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const soloSalon = !ajustes.domicilio_habilitado && ajustes.salon_habilitado;
  const ofreceAmbas = ajustes.domicilio_habilitado && ajustes.salon_habilitado;

  const preseleccionado = servicios.some((s) => s.id === servicioInicial) ? servicioInicial : null;
  const [paso, setPaso] = useState(preseleccionado ? 1 : 0);
  const [servicioId, setServicioId] = useState<string | null>(preseleccionado);
  const [modalidad, setModalidad] = useState<Modalidad>(soloSalon ? "salon" : "domicilio");
  const [fecha, setFecha] = useState<string | null>(null);
  const [inicio, setInicio] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [direcciones, setDirecciones] = useState(direccionesIniciales);
  const [direccionId, setDireccionId] = useState<string | null>(direccionesIniciales[0]?.id ?? null);
  const [nuevaDireccion, setNuevaDireccion] = useState(direccionesIniciales.length === 0);
  const [notas, setNotas] = useState("");
  const [disenoId, setDisenoId] = useState<string | null>(
    disenos.some((d) => d.id === disenoInicial) ? disenoInicial : null,
  );
  const [foto, setFoto] = useState<{ ruta: string; vista: string } | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciarEnvio] = useTransition();

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const diseno = disenos.find((d) => d.id === disenoId) ?? null;
  const direccion = direcciones.find((d) => d.id === direccionId) ?? null;

  const serviciosVisibles = servicios.filter((s) =>
    modalidad === "domicilio" ? s.modalidad !== "salon" : s.modalidad !== "domicilio",
  );

  const dias = useMemo(() => {
    const hoy = fechaLocal();
    const total = Math.min(ajustes.dias_maximos_reserva, 60);
    return Array.from({ length: total + 1 }, (_, i) => sumarDias(hoy, i));
  }, [ajustes.dias_maximos_reserva]);

  const requiereAnticipo = !esFrecuente && ajustes.anticipo_porcentaje > 0;
  const anticipo = servicio
    ? Math.ceil((servicio.precio * ajustes.anticipo_porcentaje) / 100 / 100) * 100
    : 0;

  async function elegirFecha(nueva: string, servicioElegido = servicioId, modalidadElegida = modalidad) {
    setFecha(nueva);
    setInicio(null);
    setHorarios([]);
    if (!servicioElegido) return;
    setCargandoHorarios(true);
    const { data, error } = await supabase.rpc("horarios_disponibles", {
      p_servicio: servicioElegido,
      p_fecha: nueva,
      p_modalidad: modalidadElegida,
    });
    setCargandoHorarios(false);
    if (error) {
      setError("No pudimos consultar los horarios. Revisa tu conexión.");
      return;
    }
    setHorarios(((data as { inicio: string }[]) ?? []).map((h) => h.inicio));
  }

  function elegirServicio(id: string) {
    setServicioId(id);
    setFecha(null);
    setInicio(null);
    setHorarios([]);
    setPaso(1);
  }

  function cambiarModalidad(m: Modalidad) {
    setModalidad(m);
    setFecha(null);
    setInicio(null);
    setHorarios([]);
    if (servicio && (m === "domicilio" ? servicio.modalidad === "salon" : servicio.modalidad === "domicilio")) {
      setServicioId(null);
    }
  }

  async function subirFoto(archivo: File) {
    if (archivo.size > 8 * 1024 * 1024) {
      setError("La foto es muy pesada (máximo 8 MB).");
      return;
    }
    setError(null);
    setSubiendoFoto(true);
    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `${usuarioId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("referencias").upload(ruta, archivo, {
      contentType: archivo.type,
      upsert: false,
    });
    setSubiendoFoto(false);
    if (error) {
      setError("No pudimos subir la foto. Intenta con otra.");
      return;
    }
    setFoto({ ruta, vista: URL.createObjectURL(archivo) });
  }

  function confirmar() {
    if (!servicio || !inicio) return;
    setError(null);
    iniciarEnvio(async () => {
      const r = await reservar({
        servicioId: servicio.id,
        inicio,
        direccionId,
        modalidad,
        notas,
        disenoId,
        fotoReferencia: foto?.ruta ?? null,
      });
      if (r.ok) {
        router.push(`/mis-citas/${r.id}?nueva=1`);
      } else {
        setError(r.error);
        if (r.error.includes("horario")) {
          setPaso(1);
          if (fecha) void elegirFecha(fecha);
        }
      }
    });
  }

  const puedeAvanzar = [
    !!servicio,
    !!inicio,
    modalidad === "salon" || (!!direccion && !nuevaDireccion),
    !subiendoFoto,
    true,
  ][paso];

  const grupos = [
    { titulo: "Mañana", icono: Sun, horas: horarios.filter((h) => horaBogota(h) < 12) },
    { titulo: "Tarde", icono: Sunset, horas: horarios.filter((h) => horaBogota(h) >= 12 && horaBogota(h) < 17) },
    { titulo: "Noche", icono: Moon, horas: horarios.filter((h) => horaBogota(h) >= 17) },
  ].filter((g) => g.horas.length);

  return (
    <div className="animate-aparecer">
      {/* Progreso */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dorado-600">
            Paso {paso + 1} de {PASOS.length}
          </p>
          <p className="text-sm text-humo">{PASOS[paso]}</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {PASOS.map((p, i) => (
            <button
              key={p}
              type="button"
              aria-label={p}
              disabled={i > paso}
              onClick={() => setPaso(i)}
              className={cx(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= paso ? "bg-ciruela-700" : "bg-ciruela-100",
              )}
            />
          ))}
        </div>
      </div>

      {error && (
        <Aviso tipo="error" className="mb-6">
          {error}
        </Aviso>
      )}

      {/* Paso 1: servicio */}
      {paso === 0 && (
        <section>
          <h1 className="font-titulo text-4xl text-ciruela-900">¿Qué te quieres hacer?</h1>
          <p className="mt-2 text-humo">
            {modalidad === "domicilio"
              ? "Todos los precios incluyen el domicilio."
              : `Te esperamos en el salón${ajustes.salon_direccion ? `: ${ajustes.salon_direccion}` : ""}.`}
          </p>

          {ofreceAmbas && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {(
                [
                  { valor: "domicilio", texto: "A domicilio", icono: Home },
                  { valor: "salon", texto: "En el salón", icono: Building2 },
                ] as const
              ).map(({ valor, texto, icono: Icono }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => cambiarModalidad(valor)}
                  className={cx(
                    "flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold ring-1 transition",
                    modalidad === valor
                      ? "bg-ciruela-700 text-white ring-ciruela-700"
                      : "bg-marfil text-ciruela-800 ring-linea",
                  )}
                >
                  <Icono className="size-4" /> {texto}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {serviciosVisibles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => elegirServicio(s.id)}
                className={cx(
                  "flex items-center gap-4 rounded-3xl bg-marfil p-3 pr-5 text-left ring-1 transition hover:shadow-suave",
                  s.id === servicioId ? "ring-2 ring-ciruela-500" : "ring-linea",
                )}
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-2xl">
                  <PortadaServicio imagen={s.imagen_url} nombre={s.nombre} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-dorado-600">{s.categoria}</p>
                  <p className="font-titulo text-xl leading-tight text-ciruela-900">{s.nombre}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-humo">
                    <Clock className="size-3.5" /> {formatoDuracion(s.duracion_minutos)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-ciruela-800">{formatoPesos(s.precio)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Paso 2: fecha y hora */}
      {paso === 1 && servicio && (
        <section>
          <h1 className="font-titulo text-4xl text-ciruela-900">¿Cuándo te consentimos?</h1>
          <p className="mt-2 text-humo">
            {servicio.nombre} · {formatoDuracion(servicio.duracion_minutos)}
          </p>

          <div className="sin-scrollbar -mx-4 mt-6 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {dias.map((d) => {
              const f = aFecha(d, "12:00");
              const activo = d === fecha;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => elegirFecha(d)}
                  className={cx(
                    "flex w-16 shrink-0 snap-start flex-col items-center rounded-2xl py-3 ring-1 transition",
                    activo ? "bg-ciruela-700 text-white ring-ciruela-700 shadow-suave" : "bg-marfil ring-linea",
                  )}
                >
                  <span className={cx("text-[0.68rem] uppercase", activo ? "text-white/80" : "text-humo")}>
                    {fmtDiaSemana.format(f).replace(".", "")}
                  </span>
                  <span className="font-titulo text-2xl leading-none">{fmtDiaMes.format(f)}</span>
                  <span className={cx("text-[0.68rem]", activo ? "text-white/80" : "text-humo")}>
                    {fmtMes.format(f).replace(".", "")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {!fecha ? (
              <p className="rounded-2xl bg-marfil p-5 text-center text-sm text-humo ring-1 ring-linea">
                Elige un día para ver los horarios disponibles.
              </p>
            ) : cargandoHorarios ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded-full bg-ciruela-50" />
                ))}
              </div>
            ) : grupos.length === 0 ? (
              <div className="rounded-2xl bg-marfil p-6 text-center ring-1 ring-linea">
                <p className="font-titulo text-xl text-ciruela-900">Este día ya está lleno o no hay atención</p>
                <p className="mt-1 text-sm text-humo">Prueba con otro día. ¡Seguro encontramos un espacio para ti!</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm font-medium capitalize text-ciruela-800">{formatoFechaLarga(aFecha(fecha, "12:00"))}</p>
                {grupos.map(({ titulo, icono: Icono, horas }) => (
                  <div key={titulo}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-humo">
                      <Icono className="size-3.5" /> {titulo}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {horas.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setInicio(h)}
                          className={cx(
                            "h-11 rounded-full text-sm font-medium ring-1 transition",
                            h === inicio
                              ? "bg-ciruela-700 text-white ring-ciruela-700"
                              : "bg-marfil text-ciruela-800 ring-linea hover:bg-ciruela-50",
                          )}
                        >
                          {formatoHora(h)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Paso 3: lugar */}
      {paso === 2 && (
        <section>
          {modalidad === "salon" ? (
            <>
              <h1 className="font-titulo text-4xl text-ciruela-900">Te esperamos en el salón</h1>
              <Tarjeta className="mt-6 flex items-start gap-3 p-5">
                <MapPin className="mt-0.5 size-5 text-dorado-600" />
                <div>
                  <p className="font-medium">{ajustes.salon_direccion ?? "Dirección por confirmar"}</p>
                  <p className="text-sm text-humo">{ajustes.salon_ciudad}</p>
                </div>
              </Tarjeta>
            </>
          ) : (
            <>
              <h1 className="font-titulo text-4xl text-ciruela-900">¿A dónde llega Ana María?</h1>
              <p className="mt-2 text-humo">Por ahora atendemos en {ciudades.map((c) => c.nombre).join(", ") || marca.ciudadBase}.</p>

              {!nuevaDireccion && (
                <div className="mt-6 space-y-3">
                  {direcciones.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDireccionId(d.id)}
                      className={cx(
                        "flex w-full items-start gap-3 rounded-3xl bg-marfil p-4 text-left ring-1 transition",
                        d.id === direccionId ? "ring-2 ring-ciruela-500" : "ring-linea",
                      )}
                    >
                      <span
                        className={cx(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ring-1",
                          d.id === direccionId ? "bg-ciruela-700 text-white ring-ciruela-700" : "ring-ciruela-300",
                        )}
                      >
                        {d.id === direccionId && <Check className="size-3" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-dorado-600">{d.etiqueta}</span>
                        <span className="block font-medium">{d.direccion}</span>
                        <span className="block text-sm text-humo">
                          {[d.barrio, d.ciudad].filter(Boolean).join(" · ")}
                          {d.indicaciones ? ` · ${d.indicaciones}` : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNuevaDireccion(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-ciruela-300 p-4 text-sm font-medium text-ciruela-700"
                  >
                    <Plus className="size-4" /> Agregar otra dirección
                  </button>
                </div>
              )}

              {nuevaDireccion && (
                <Tarjeta className="mt-6 p-5">
                  <p className="mb-4 font-titulo text-2xl text-ciruela-900">Nueva dirección</p>
                  <FormularioDireccion
                    ciudades={ciudades}
                    alGuardar={(d) => {
                      setDirecciones((actuales) => [...actuales, d]);
                      setDireccionId(d.id);
                      setNuevaDireccion(false);
                    }}
                    alCancelar={direcciones.length ? () => setNuevaDireccion(false) : undefined}
                  />
                </Tarjeta>
              )}
            </>
          )}
        </section>
      )}

      {/* Paso 4: detalles */}
      {paso === 3 && (
        <section>
          <h1 className="font-titulo text-4xl text-ciruela-900">Cuéntale tu idea</h1>
          <p className="mt-2 text-humo">Todo es opcional, pero ayuda a que Ana María llegue preparada.</p>

          {disenos.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Elige un diseño de la galería</p>
              <div className="sin-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                {disenos.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDisenoId(d.id === disenoId ? null : d.id)}
                    className={cx(
                      "relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
                      d.id === disenoId ? "ring-ciruela-500" : "ring-transparent",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.imagen_url} alt={d.titulo} className="h-full w-full object-cover" />
                    {d.id === disenoId && (
                      <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ciruela-700 text-white">
                        <Check className="size-3.5" />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ciruela-900/80 to-transparent p-2 pt-6 text-left text-[0.7rem] text-white">
                      {d.titulo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">¿Tienes una foto de referencia?</p>
            {foto ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.vista} alt="Foto de referencia" className="h-36 rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-marfil/90 text-ciruela-800"
                  aria-label="Quitar foto"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-ciruela-300 bg-marfil p-5 text-sm text-ciruela-700">
                <ImagePlus className="size-5" />
                {subiendoFoto ? "Subiendo foto…" : "Subir una foto (Pinterest, Instagram, tus uñas actuales…)"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={subiendoFoto}
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) void subirFoto(archivo);
                  }}
                />
              </label>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Notas para Ana María</p>
            <AreaTexto
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={500}
              placeholder="Colores que te gustan, forma de uña, alergias, si hay mascotas en casa…"
            />
          </div>
        </section>
      )}

      {/* Paso 5: confirmar */}
      {paso === 4 && servicio && inicio && (
        <section>
          <h1 className="font-titulo text-4xl text-ciruela-900">Revisa y confirma</h1>
          <Tarjeta className="mt-6 divide-y divide-linea">
            <div className="flex items-center gap-4 p-5">
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl">
                <PortadaServicio imagen={servicio.imagen_url} nombre={servicio.nombre} />
              </div>
              <div>
                <p className="font-titulo text-2xl leading-tight text-ciruela-900">{servicio.nombre}</p>
                <p className="text-sm text-humo">{formatoDuracion(servicio.duracion_minutos)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5">
              <Sparkles className="mt-0.5 size-5 text-dorado-600" />
              <div>
                <p className="font-medium capitalize">{formatoFechaLarga(inicio)}</p>
                <p className="text-sm text-humo">a las {formatoHora(inicio)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5">
              <MapPin className="mt-0.5 size-5 text-dorado-600" />
              <div>
                {modalidad === "salon" ? (
                  <p className="font-medium">En el salón · {ajustes.salon_direccion}</p>
                ) : (
                  <>
                    <p className="font-medium">{direccion?.direccion}</p>
                    <p className="text-sm text-humo">
                      {[direccion?.barrio, direccion?.ciudad].filter(Boolean).join(" · ")}
                    </p>
                  </>
                )}
              </div>
            </div>
            {(diseno || foto || notas) && (
              <div className="space-y-1 p-5 text-sm">
                {diseno && <p>Diseño: <span className="font-medium">{diseno.titulo}</span></p>}
                {foto && <p>Foto de referencia adjunta ✓</p>}
                {notas && <p className="text-humo">“{notas}”</p>}
              </div>
            )}
            <div className="space-y-2 p-5">
              <div className="flex justify-between">
                <span className="text-humo">Total {modalidad === "domicilio" && "(domicilio incluido)"}</span>
                <span className="text-xl font-semibold text-ciruela-800">{formatoPesos(servicio.precio)}</span>
              </div>
              {requiereAnticipo && (
                <div className="flex justify-between text-sm">
                  <span className="text-humo">Anticipo para separar ({ajustes.anticipo_porcentaje}%)</span>
                  <span className="font-semibold">{formatoPesos(anticipo)}</span>
                </div>
              )}
            </div>
          </Tarjeta>

          {requiereAnticipo ? (
            <Aviso tipo="info" className="mt-4">
              Como es tu primera cita, separamos tu espacio con un anticipo del {ajustes.anticipo_porcentaje}% (
              {formatoPesos(anticipo)}). El resto lo pagas el día del servicio.
              {ajustes.pagos_en_linea
                ? ` Tendrás ${ajustes.minutos_expiracion_pago} minutos para pagarlo en línea.`
                : " Después de confirmar te mostramos cómo enviarlo."}
            </Aviso>
          ) : (
            <Aviso tipo="exito" className="mt-4">
              ¡Eres clienta consentida! No necesitas anticipo: tu cita queda confirmada de inmediato.
            </Aviso>
          )}
          <p className="mt-3 text-xs text-humo">
            Puedes cancelar sin costo hasta {ajustes.horas_cancelacion} horas antes de tu cita.
          </p>
        </section>
      )}

      {/* Navegación */}
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] mt-8 flex gap-3 rounded-full bg-crema/90 py-2 backdrop-blur md:bottom-4">
        {paso > 0 && (
          <Boton type="button" variante="secundario" onClick={() => setPaso(paso - 1)} disabled={enviando}>
            <ArrowLeft className="size-4" />
            Atrás
          </Boton>
        )}
        {paso < PASOS.length - 1 ? (
          <Boton type="button" className="flex-1" disabled={!puedeAvanzar} onClick={() => setPaso(paso + 1)}>
            Continuar
            <ArrowRight className="size-4" />
          </Boton>
        ) : (
          <Boton type="button" className="flex-1" disabled={enviando} onClick={confirmar}>
            <Check className="size-4" />
            {enviando ? "Agendando…" : "Confirmar mi cita"}
          </Boton>
        )}
      </div>
    </div>
  );
}
