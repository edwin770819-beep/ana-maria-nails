import type { Metadata } from "next";
import { LayoutDashboard, LogOut, Star } from "lucide-react";
import { Boton, BotonEnlace, Insignia, Tarjeta, TituloSeccion } from "@/components/ui";
import { exigirPerfil } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Direccion } from "@/lib/tipos";
import { obtenerCiudades } from "../_componentes/datos";
import { FormularioDatos } from "../_componentes/formulario-datos";
import { Direcciones } from "./direcciones";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PaginaPerfil() {
  const perfil = await exigirPerfil("/perfil");
  const supabase = await crearClienteServidor();
  const [ciudades, { data: direcciones }, { data: esFrecuente }] = await Promise.all([
    obtenerCiudades(),
    supabase
      .from("direcciones")
      .select("*")
      .eq("cliente_id", perfil.id)
      .order("principal", { ascending: false })
      .order("creado_en"),
    supabase.rpc("es_frecuente", { p_cliente: perfil.id }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <TituloSeccion antetitulo="Mi cuenta" titulo={perfil.nombre ?? "Mi perfil"} />
          <p className="mt-1 text-sm text-humo">{perfil.email}</p>
          {esFrecuente === true && (
            <Insignia className="mt-3 bg-dorado-200/50 text-dorado-600 ring-dorado-200">
              <Star className="size-3 fill-current" /> Clienta frecuente · sin anticipo
            </Insignia>
          )}
        </div>
        {perfil.rol === "admin" && (
          <BotonEnlace href="/admin" variante="dorado" tamano="sm">
            <LayoutDashboard className="size-4" /> Ir a mi panel
          </BotonEnlace>
        )}
      </div>

      <Tarjeta className="mt-8 p-6">
        <h2 className="mb-5 font-titulo text-2xl text-ciruela-900">Mis datos</h2>
        <FormularioDatos perfil={perfil} />
      </Tarjeta>

      <Tarjeta className="mt-6 p-6">
        <h2 className="mb-1 font-titulo text-2xl text-ciruela-900">Mis direcciones</h2>
        <p className="mb-5 text-sm text-humo">A dónde llega Ana María cuando agendas a domicilio.</p>
        <Direcciones direcciones={(direcciones as Direccion[]) ?? []} ciudades={ciudades} />
      </Tarjeta>

      <form action="/auth/salir" method="post" className="mt-8">
        <Boton type="submit" variante="fantasma">
          <LogOut className="size-4" /> Cerrar sesión
        </Boton>
      </form>
    </div>
  );
}
