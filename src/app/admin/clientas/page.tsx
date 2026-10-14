import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { Entrada, Tarjeta, TituloSeccion, Vacio } from "@/components/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatoFechaCorta } from "@/lib/formato";
import type { Perfil } from "@/lib/tipos";
import { BotonFrecuente } from "./_frecuente";

export const metadata = { title: "Clientas" };

export default async function PaginaClientas({ searchParams }: PageProps<"/admin/clientas">) {
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q.trim().toLowerCase() : "";
  const supabase = await crearClienteServidor();

  const [{ data: perfiles }, { data: citas }, { data: ajustes }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("rol", "cliente").order("creado_en", { ascending: false }),
    supabase.from("citas").select("cliente_id, estado, inicio").not("cliente_id", "is", null),
    supabase.from("ajustes").select("visitas_cliente_frecuente").eq("id", 1).single(),
  ]);
  const umbral = ajustes?.visitas_cliente_frecuente ?? 3;

  // Visitas completadas y última visita por clienta
  const resumen = new Map<string, { visitas: number; ultima: string | null; proxima: string | null }>();
  const ahora = new Date().toISOString();
  (citas ?? []).forEach((c) => {
    const r = resumen.get(c.cliente_id) ?? { visitas: 0, ultima: null, proxima: null };
    if (c.estado === "completada") {
      r.visitas++;
      if (!r.ultima || c.inicio > r.ultima) r.ultima = c.inicio;
    }
    if (c.inicio > ahora && c.estado !== "cancelada" && (!r.proxima || c.inicio < r.proxima)) r.proxima = c.inicio;
    resumen.set(c.cliente_id, r);
  });

  const lista = ((perfiles ?? []) as Perfil[]).filter(
    (p) =>
      !busqueda ||
      [p.nombre, p.email, p.telefono].some((v) => v?.toLowerCase().includes(busqueda)),
  );

  return (
    <div className="space-y-6">
      <TituloSeccion
        antetitulo="Tu comunidad"
        titulo="Clientas"
        descripcion={`Las clientas con ${umbral} o más visitas completadas son frecuentes y no pagan anticipo. También puedes marcarlas a mano.`}
      />

      <form className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-humo" />
        <Entrada name="q" defaultValue={busqueda} placeholder="Buscar por nombre, correo o celular" className="pl-10" />
      </form>

      {lista.length === 0 ? (
        <Vacio icono={<Users className="size-10" />} titulo={busqueda ? "Sin resultados" : "Aún no hay clientas registradas"}>
          {busqueda ? "Prueba con otro nombre o número." : "Cuando tus clientas creen su cuenta aparecerán aquí."}
        </Vacio>
      ) : (
        <Tarjeta className="divide-y divide-linea overflow-hidden">
          {lista.map((p) => {
            const r = resumen.get(p.id) ?? { visitas: 0, ultima: null, proxima: null };
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rubor-200 to-dorado-200 font-titulo text-lg text-ciruela-800">
                  {(p.nombre || p.email || "?").charAt(0).toUpperCase()}
                </span>
                <Link href={`/admin/clientas/${p.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
                  <p className="truncate text-xs text-humo">
                    {r.visitas} {r.visitas === 1 ? "visita" : "visitas"}
                    {r.ultima && ` · última ${formatoFechaCorta(r.ultima)}`}
                    {r.proxima && ` · próxima ${formatoFechaCorta(r.proxima)}`}
                    {p.telefono && ` · ${p.telefono}`}
                  </p>
                </Link>
                <BotonFrecuente id={p.id} manual={p.frecuente_manual} porVisitas={r.visitas >= umbral} />
                <Link href={`/admin/clientas/${p.id}`} aria-label="Ver detalle" className="hidden text-humo sm:block">
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </Tarjeta>
      )}
    </div>
  );
}
