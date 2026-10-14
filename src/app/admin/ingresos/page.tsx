import Link from "next/link";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { Insignia, Tarjeta, TituloSeccion, Vacio, cx } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { aFecha, fechaLocal, formatoFechaCorta, formatoMesAnio, formatoPesos } from "@/lib/formato";
import type { Cita } from "@/lib/tipos";
import { rangoISO, sumarMeses } from "../_componentes/tiempo";

export const metadata = { title: "Ingresos" };

type PagoConCita = {
  id: string;
  monto: number;
  metodo: string | null;
  proveedor: string;
  tipo: string;
  creado_en: string;
  cita: { servicio_nombre: string | null; cliente_nombre: string | null; perfil: { nombre: string | null } | null } | null;
};

export default async function PaginaIngresos({ searchParams }: PageProps<"/admin/ingresos">) {
  const { mes } = await searchParams;
  const mesActual = fechaLocal().slice(0, 7);
  const elegido = typeof mes === "string" && /^\d{4}-\d{2}$/.test(mes) ? mes : mesActual;
  const desde = `${elegido}-01`;
  const hasta = sumarMeses(desde, 1);
  const rango = rangoISO(desde, hasta);

  const supabase = await crearClienteServidor();
  const [{ data: pagosData }, { data: citasData }] = await Promise.all([
    supabase
      .from("pagos")
      .select("id, monto, metodo, proveedor, tipo, creado_en, cita:citas(servicio_nombre, cliente_nombre, perfil:perfiles(nombre))")
      .eq("estado", "aprobado")
      .gte("creado_en", rango.desde)
      .lt("creado_en", rango.hasta)
      .order("creado_en", { ascending: false }),
    supabase
      .from("citas")
      .select("estado, precio, servicio_nombre")
      .gte("inicio", rango.desde)
      .lt("inicio", rango.hasta),
  ]);
  const pagos = (pagosData ?? []) as unknown as PagoConCita[];
  const citas = (citasData ?? []) as Pick<Cita, "estado" | "precio" | "servicio_nombre">[];

  const cobrado = pagos.reduce((s, p) => s + p.monto, 0);
  const completadas = citas.filter((c) => c.estado === "completada");
  const canceladas = citas.filter((c) => c.estado === "cancelada" || c.estado === "no_asistio").length;
  const ticket = completadas.length ? completadas.reduce((s, c) => s + c.precio, 0) / completadas.length : 0;

  const conteo = new Map<string, number>();
  citas
    .filter((c) => c.estado !== "cancelada")
    .forEach((c) => c.servicio_nombre && conteo.set(c.servicio_nombre, (conteo.get(c.servicio_nombre) ?? 0) + 1));
  const ranking = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maximo = ranking[0]?.[1] ?? 1;

  const porMetodo = new Map<string, number>();
  pagos.forEach((p) => {
    const m = p.proveedor === "wompi" ? `En línea${p.metodo ? ` (${p.metodo})` : ""}` : (p.metodo ?? "Otro");
    porMetodo.set(m, (porMetodo.get(m) ?? 0) + p.monto);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloSeccion antetitulo="Tus números" titulo={<span className="capitalize">{formatoMesAnio(aFecha(desde, "12:00"))}</span>} />
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/ingresos?mes=${sumarMeses(desde, -1).slice(0, 7)}`}
            aria-label="Mes anterior"
            className="flex size-9 items-center justify-center rounded-full bg-white ring-1 ring-linea hover:bg-ciruela-50"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href="/admin/ingresos"
            className={cx(
              "rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-linea",
              elegido === mesActual ? "bg-ciruela-50 text-ciruela-700" : "bg-white",
            )}
          >
            Este mes
          </Link>
          <Link
            href={`/admin/ingresos?mes=${hasta.slice(0, 7)}`}
            aria-label="Mes siguiente"
            className="flex size-9 items-center justify-center rounded-full bg-white ring-1 ring-linea hover:bg-ciruela-50"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta className="col-span-2 bg-gradient-to-br from-ciruela-700 to-ciruela-900 p-5 text-white ring-0 lg:col-span-1">
          <p className="text-xs text-white/70">Total cobrado</p>
          <p className="mt-1 font-titulo text-4xl">{formatoPesos(cobrado)}</p>
        </Tarjeta>
        {[
          { e: "Citas completadas", v: String(completadas.length) },
          { e: "Ticket promedio", v: formatoPesos(Math.round(ticket)) },
          { e: "Canceladas / no asistió", v: String(canceladas) },
        ].map((x) => (
          <Tarjeta key={x.e} className="p-5">
            <p className="text-xs text-humo">{x.e}</p>
            <p className="mt-1 font-titulo text-3xl text-ciruela-900">{x.v}</p>
          </Tarjeta>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="p-5">
          <h2 className="font-titulo text-xl text-ciruela-900">Servicios más pedidos</h2>
          {ranking.length === 0 ? (
            <p className="mt-3 text-sm text-humo">Sin citas este mes.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {ranking.map(([nombre, n]) => (
                <li key={nombre}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate">{nombre}</span>
                    <span className="font-medium text-ciruela-700">{n}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-rubor-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ciruela-500 to-dorado-400"
                      style={{ width: `${(n / maximo) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="font-titulo text-xl text-ciruela-900">Cómo te pagaron</h2>
          {porMetodo.size === 0 ? (
            <p className="mt-3 text-sm text-humo">Aún no hay pagos registrados este mes.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {[...porMetodo.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([metodo, total]) => (
                  <li key={metodo} className="flex justify-between rounded-2xl bg-white px-4 py-2.5 text-sm ring-1 ring-linea">
                    <span>{metodo}</span>
                    <span className="font-semibold">{formatoPesos(total)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta className="p-5">
        <h2 className="font-titulo text-xl text-ciruela-900">Pagos recibidos</h2>
        {pagos.length === 0 ? (
          <div className="mt-3">
            <Vacio icono={<Receipt className="size-10" />} titulo="Sin pagos este mes" />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-linea">
            {pagos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {p.cita?.perfil?.nombre || p.cita?.cliente_nombre || "Clienta"} · {p.cita?.servicio_nombre}
                  </p>
                  <p className="text-xs capitalize text-humo">
                    {formatoFechaCorta(p.creado_en)} · {p.proveedor === "wompi" ? "En línea" : p.metodo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Insignia className="hidden bg-rubor-50 text-ciruela-700 ring-rubor-100 sm:inline-flex">{p.tipo}</Insignia>
                  <span className="font-semibold text-emerald-700">{formatoPesos(p.monto)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
