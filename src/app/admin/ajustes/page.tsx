import { Plus, ShieldCheck, X } from "lucide-react";
import { AreaTexto, Aviso, Campo, Entrada, Insignia, Tarjeta, TituloSeccion } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Ajustes, Ciudad } from "@/lib/tipos";
import { BotonConfirmar } from "../_componentes/boton-confirmar";
import { BotonEnviar, FormularioAccion } from "../_componentes/formulario-accion";
import { Interruptor } from "../_componentes/interruptor";
import { agregarAdmin, agregarCiudad, alternarCiudad, guardarAjustes, quitarAdmin } from "./acciones";

export const metadata = { title: "Ajustes" };

function CampoNumero({
  nombre,
  etiqueta,
  valor,
  ayuda,
  sufijo,
}: {
  nombre: string;
  etiqueta: string;
  valor: number;
  ayuda?: string;
  sufijo: string;
}) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      <div className="relative">
        <Entrada name={nombre} type="number" min={0} required defaultValue={valor} className="pr-20" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-humo">{sufijo}</span>
      </div>
    </Campo>
  );
}

export default async function PaginaAjustes() {
  const supabase = await crearClienteServidor();
  const [{ data: ajustesData }, { data: ciudadesData }, { data: admins }] = await Promise.all([
    supabase.from("ajustes").select("*").eq("id", 1).single(),
    supabase.from("ciudades").select("*").order("nombre"),
    supabase.from("correos_admin").select("email").order("email"),
  ]);
  const a = ajustesData as Ajustes;
  const ciudades = (ciudadesData ?? []) as Ciudad[];
  const wompiConfigurado = !!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY && !!process.env.WOMPI_INTEGRITY_SECRET;

  return (
    <div className="space-y-6">
      <TituloSeccion antetitulo="Tu negocio" titulo="Ajustes" descripcion="Las reglas con las que funciona tu agenda." />

      <FormularioAccion accion={guardarAjustes} className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="space-y-4 p-5 sm:p-6">
          <h2 className="font-titulo text-2xl text-ciruela-900">Anticipos y pagos</h2>
          <CampoNumero
            nombre="anticipo_porcentaje"
            etiqueta="Anticipo para clientas nuevas"
            valor={a.anticipo_porcentaje}
            sufijo="%"
            ayuda="Las clientas frecuentes no pagan anticipo. Pon 0 para no pedirlo nunca."
          />
          <CampoNumero
            nombre="visitas_cliente_frecuente"
            etiqueta="Visitas para ser clienta frecuente"
            valor={a.visitas_cliente_frecuente}
            sufijo="visitas"
          />
          <Campo etiqueta="Instrucciones de pago" ayuda="Lo ven las clientas cuando deben enviar el anticipo por fuera de la app.">
            <AreaTexto name="instrucciones_pago" defaultValue={a.instrucciones_pago ?? ""} />
          </Campo>
          <Interruptor
            nombre="pagos_en_linea"
            inicial={a.pagos_en_linea}
            etiqueta="Pagos en línea con Wompi"
            descripcion="Tarjeta, PSE, Nequi y Bancolombia. Si una clienta nueva no paga el anticipo a tiempo, el cupo se libera."
          />
          {!wompiConfigurado && (
            <Aviso tipo="alerta">Aún faltan las llaves de Wompi. Mientras tanto, registra los pagos a mano desde la agenda.</Aviso>
          )}
          <CampoNumero
            nombre="minutos_expiracion_pago"
            etiqueta="Tiempo para pagar el anticipo en línea"
            valor={a.minutos_expiracion_pago}
            sufijo="min"
          />
        </Tarjeta>

        <Tarjeta className="space-y-4 p-5 sm:p-6">
          <h2 className="font-titulo text-2xl text-ciruela-900">Agenda</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              nombre="minutos_traslado"
              etiqueta="Tiempo de traslado"
              valor={a.minutos_traslado}
              sufijo="min"
              ayuda="Espacio libre entre domicilios"
            />
            <CampoNumero
              nombre="horas_cancelacion"
              etiqueta="Cancelar hasta"
              valor={a.horas_cancelacion}
              sufijo="h antes"
            />
            <CampoNumero
              nombre="intervalo_minutos"
              etiqueta="Horarios cada"
              valor={a.intervalo_minutos}
              sufijo="min"
              ayuda="Ej: 15 → 8:00, 8:15, 8:30…"
            />
            <CampoNumero
              nombre="antelacion_minima_minutos"
              etiqueta="Reservar con mínimo"
              valor={a.antelacion_minima_minutos}
              sufijo="min antes"
            />
            <CampoNumero
              nombre="dias_maximos_reserva"
              etiqueta="Agenda abierta hasta"
              valor={a.dias_maximos_reserva}
              sufijo="días"
            />
          </div>
          <Campo etiqueta="WhatsApp del negocio" ayuda="Para que las clientas te escriban desde la app">
            <Entrada name="whatsapp" inputMode="tel" defaultValue={a.whatsapp ?? ""} placeholder="300 123 4567" />
          </Campo>
        </Tarjeta>

        <Tarjeta className="space-y-3 p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-titulo text-2xl text-ciruela-900">Dónde atiendes</h2>
          <Interruptor
            nombre="domicilio_habilitado"
            inicial={a.domicilio_habilitado}
            etiqueta="Servicio a domicilio"
            descripcion="La clienta registra la dirección a donde debes ir."
          />
          <Interruptor
            nombre="salon_habilitado"
            inicial={a.salon_habilitado}
            etiqueta="Salón físico"
            descripcion="Actívalo el día que abras tu salón: las clientas podrán elegir ir allá."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Dirección del salón">
              <Entrada name="salon_direccion" defaultValue={a.salon_direccion ?? ""} placeholder="Para el futuro ♡" />
            </Campo>
            <Campo etiqueta="Ciudad del salón">
              <Entrada name="salon_ciudad" defaultValue={a.salon_ciudad ?? ""} />
            </Campo>
          </div>
          <BotonEnviar className="w-full sm:w-auto">Guardar ajustes</BotonEnviar>
        </Tarjeta>
      </FormularioAccion>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ciudades */}
        <Tarjeta className="p-5 sm:p-6">
          <h2 className="font-titulo text-2xl text-ciruela-900">Ciudades de cobertura</h2>
          <p className="mt-1 text-sm text-humo">Las clientas solo pueden agendar domicilios en ciudades activas.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ciudades.map((c) => (
              <FormularioAccion key={c.id} accion={alternarCiudad}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="activa" value={String(c.activa)} />
                <button type="submit" title={c.activa ? "Desactivar" : "Activar"}>
                  <Insignia
                    className={
                      c.activa
                        ? "bg-ciruela-50 px-3 py-1 text-sm text-ciruela-800 ring-ciruela-100"
                        : "bg-stone-100 px-3 py-1 text-sm text-stone-500 ring-stone-200 line-through"
                    }
                  >
                    {c.nombre}
                  </Insignia>
                </button>
              </FormularioAccion>
            ))}
          </div>
          <FormularioAccion accion={agregarCiudad} className="mt-4 flex gap-2">
            <Entrada name="nombre" placeholder="Ej: Chía" required />
            <BotonEnviar variante="secundario" pendiente="…">
              <Plus className="size-4" /> Agregar
            </BotonEnviar>
          </FormularioAccion>
        </Tarjeta>

        {/* Administradoras */}
        <Tarjeta className="p-5 sm:p-6">
          <h2 className="font-titulo text-2xl text-ciruela-900">Quién administra</h2>
          <p className="mt-1 text-sm text-humo">Estos correos entran directo a este panel.</p>
          <ul className="mt-4 space-y-2">
            {(admins ?? []).map(({ email }) => (
              <li key={email} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-linea">
                <ShieldCheck className="size-4 text-dorado-500" />
                <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
                <FormularioAccion accion={quitarAdmin}>
                  <input type="hidden" name="email" value={email} />
                  <BotonConfirmar etiqueta="Quitar" confirmar="¿Quitar?">
                    <X className="size-4" />
                  </BotonConfirmar>
                </FormularioAccion>
              </li>
            ))}
          </ul>
          <FormularioAccion accion={agregarAdmin} className="mt-4 flex gap-2">
            <Entrada name="email" type="email" placeholder="correo@gmail.com" required />
            <BotonEnviar variante="secundario" pendiente="…">
              <Plus className="size-4" /> Agregar
            </BotonEnviar>
          </FormularioAccion>
        </Tarjeta>
      </div>
    </div>
  );
}
