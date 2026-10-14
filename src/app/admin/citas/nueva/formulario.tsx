"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, UserRound, X } from "lucide-react";
import { AreaTexto, Campo, Entrada, Selector, Tarjeta, cx } from "@/components/ui";
import { formatoDuracion, formatoHora, formatoPesos } from "@/lib/formato";
import type { Ajustes, Servicio } from "@/lib/tipos";
import { BotonEnviar, FormularioAccion } from "../../_componentes/formulario-accion";
import { minutosLocales } from "../../_componentes/tiempo";
import { buscarClientas, crearCitaManual, sugerirHorarios, type ClientaEncontrada } from "./acciones";

function aHHMM(iso: string) {
  const m = minutosLocales(iso);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function FormularioNuevaCita({
  servicios,
  ajustes,
  ciudades,
  fechaInicial,
}: {
  servicios: Servicio[];
  ajustes: Ajustes | null;
  ciudades: string[];
  fechaInicial: string;
}) {
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState("");
  const [modalidad, setModalidad] = useState<"domicilio" | "salon">("domicilio");
  const [sugeridos, setSugeridos] = useState<string[]>([]);
  const [cargandoHoras, iniciarHoras] = useTransition();

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClientaEncontrada[]>([]);
  const [clienta, setClienta] = useState<ClientaEncontrada | null>(null);
  const [dir, setDir] = useState({
    id: "",
    direccion: "",
    barrio: "",
    ciudad: ciudades[0] ?? "Bogotá",
    indicaciones: "",
    lat: "",
    lng: "",
  });

  const servicio = servicios.find((s) => s.id === servicioId);

  useEffect(() => {
    if (!servicioId || !fecha) return;
    iniciarHoras(async () => {
      setSugeridos(await sugerirHorarios(servicioId, fecha, modalidad));
    });
  }, [servicioId, fecha, modalidad]);

  useEffect(() => {
    if (clienta || busqueda.trim().length < 2) return;
    const t = setTimeout(async () => setResultados(await buscarClientas(busqueda)), 300);
    return () => clearTimeout(t);
  }, [busqueda, clienta]);

  function elegirClienta(c: ClientaEncontrada) {
    setClienta(c);
    setResultados([]);
    const d = c.direcciones[0];
    if (d) usarDireccion(d);
  }

  function usarDireccion(d: ClientaEncontrada["direcciones"][number]) {
    setDir({
      id: d.id,
      direccion: d.direccion,
      barrio: d.barrio ?? "",
      ciudad: d.ciudad,
      indicaciones: d.indicaciones ?? "",
      lat: d.lat?.toString() ?? "",
      lng: d.lng?.toString() ?? "",
    });
  }

  return (
    <FormularioAccion accion={crearCitaManual} className="grid gap-6 lg:grid-cols-2">
      {/* Servicio y horario */}
      <Tarjeta className="space-y-4 p-5 sm:p-6">
        <h2 className="font-titulo text-2xl text-ciruela-900">Servicio y horario</h2>
        <Campo
          etiqueta="Servicio"
          ayuda={servicio && `${formatoDuracion(servicio.duracion_minutos)} · ${formatoPesos(servicio.precio)}`}
        >
          <Selector name="servicio_id" value={servicioId} onChange={(e) => setServicioId(e.target.value)} required>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Selector>
        </Campo>

        {ajustes?.salon_habilitado && (
          <Campo etiqueta="Dónde">
            <Selector
              name="modalidad"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as "domicilio" | "salon")}
            >
              <option value="domicilio">A domicilio</option>
              <option value="salon">En el salón</option>
            </Selector>
          </Campo>
        )}
        {!ajustes?.salon_habilitado && <input type="hidden" name="modalidad" value="domicilio" />}

        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha">
            <Entrada type="date" name="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </Campo>
          <Campo etiqueta="Hora" ayuda="Puedes escribir una hora libre">
            <Entrada type="time" name="hora" value={hora} onChange={(e) => setHora(e.target.value)} required step={300} />
          </Campo>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Horarios libres sugeridos</p>
          {cargandoHoras ? (
            <p className="text-sm text-humo">Buscando espacios…</p>
          ) : sugeridos.length === 0 ? (
            <p className="text-sm text-humo">
              No hay espacios libres según tu disponibilidad. Igual puedes poner una hora manual.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sugeridos.map((iso) => {
                const valor = aHHMM(iso);
                return (
                  <button
                    type="button"
                    key={iso}
                    onClick={() => setHora(valor)}
                    className={cx(
                      "rounded-full px-3 py-1.5 text-sm ring-1 transition",
                      hora === valor
                        ? "bg-ciruela-700 text-white ring-ciruela-700"
                        : "bg-white text-tinta ring-linea hover:ring-ciruela-300",
                    )}
                  >
                    {formatoHora(iso)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Campo etiqueta="Notas (opcional)">
          <AreaTexto name="notas" placeholder="Diseño que pidió, color, detalles…" />
        </Campo>
      </Tarjeta>

      {/* Clienta y dirección */}
      <Tarjeta className="space-y-4 p-5 sm:p-6">
        <h2 className="font-titulo text-2xl text-ciruela-900">Clienta</h2>

        {clienta ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-ciruela-50 p-3 ring-1 ring-ciruela-100">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-ciruela-700">
                <UserRound className="size-5" />
              </span>
              <div>
                <p className="font-medium">{clienta.nombre || clienta.email}</p>
                <p className="text-xs text-humo">{clienta.telefono || clienta.email}</p>
              </div>
            </div>
            <button type="button" onClick={() => setClienta(null)} aria-label="Quitar" className="text-humo">
              <X className="size-5" />
            </button>
            <input type="hidden" name="cliente_id" value={clienta.id} />
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-humo" />
              <Entrada
                className="pl-10"
                placeholder="Buscar clienta registrada (nombre, correo o celular)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {resultados.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl bg-white shadow-flotante ring-1 ring-linea">
                  {resultados.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => elegirClienta(c)}
                        className="w-full px-4 py-2.5 text-left hover:bg-rubor-50"
                      >
                        <span className="block text-sm font-medium">{c.nombre || c.email}</span>
                        <span className="block text-xs text-humo">{[c.telefono, c.email].filter(Boolean).join(" · ")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-center text-xs text-humo">— o si aún no tiene cuenta —</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Nombre">
                <Entrada name="cliente_nombre" placeholder="Nombre de la clienta" />
              </Campo>
              <Campo etiqueta="Celular">
                <Entrada name="cliente_telefono" inputMode="tel" placeholder="300 123 4567" />
              </Campo>
            </div>
          </>
        )}

        {modalidad === "domicilio" ? (
          <>
            <h3 className="pt-2 font-titulo text-xl text-ciruela-900">Dirección del domicilio</h3>
            {clienta && clienta.direcciones.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {clienta.direcciones.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => usarDireccion(d)}
                    className={cx(
                      "rounded-full px-3 py-1 text-xs ring-1",
                      dir.id === d.id ? "bg-ciruela-700 text-white ring-ciruela-700" : "bg-white ring-linea",
                    )}
                  >
                    {d.etiqueta}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="direccion_id" value={clienta ? dir.id : ""} />
            <input type="hidden" name="lat" value={dir.lat} />
            <input type="hidden" name="lng" value={dir.lng} />
            <Campo etiqueta="Dirección">
              <Entrada
                name="direccion"
                required
                placeholder="Calle 123 # 45-67"
                value={dir.direccion}
                onChange={(e) => setDir({ ...dir, direccion: e.target.value, id: "", lat: "", lng: "" })}
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Barrio">
                <Entrada name="barrio" value={dir.barrio} onChange={(e) => setDir({ ...dir, barrio: e.target.value })} />
              </Campo>
              <Campo etiqueta="Ciudad">
                <Entrada
                  name="ciudad"
                  list="ciudades-cobertura"
                  value={dir.ciudad}
                  onChange={(e) => setDir({ ...dir, ciudad: e.target.value })}
                />
                <datalist id="ciudades-cobertura">
                  {ciudades.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Campo>
            </div>
            <Campo etiqueta="Indicaciones">
              <Entrada
                name="indicaciones"
                placeholder="Torre, apartamento, portería…"
                value={dir.indicaciones}
                onChange={(e) => setDir({ ...dir, indicaciones: e.target.value })}
              />
            </Campo>
          </>
        ) : (
          <p className="rounded-2xl bg-rubor-50 p-3 text-sm text-humo ring-1 ring-rubor-100">
            La cita será en el salón: {ajustes?.salon_direccion || "dirección del salón sin definir"}.
          </p>
        )}

        <BotonEnviar className="w-full" pendiente="Agendando…">
          Agendar cita
        </BotonEnviar>
      </Tarjeta>
    </FormularioAccion>
  );
}
