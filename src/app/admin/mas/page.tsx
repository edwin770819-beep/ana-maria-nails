import Link from "next/link";
import { ChevronRight, LogOut, Smartphone } from "lucide-react";
import { Tarjeta, TituloSeccion } from "@/components/ui";
import { SECCIONES } from "../_componentes/secciones";

export const metadata = { title: "Más opciones" };

const DESCRIPCIONES: Record<string, string> = {
  "/admin/disponibilidad": "Tu horario semanal, días extra y bloqueos",
  "/admin/servicios": "Precios, duraciones y fotos de tus servicios",
  "/admin/galeria": "Fotos de tus diseños para inspirar a tus clientas",
  "/admin/ajustes": "Anticipos, cancelaciones, traslados y cobertura",
};

export default function PaginaMas() {
  const secciones = SECCIONES.filter((s) => DESCRIPCIONES[s.href]);
  return (
    <div className="space-y-6">
      <TituloSeccion antetitulo="Tu negocio" titulo="Más opciones" />
      <Tarjeta className="divide-y divide-linea overflow-hidden">
        {secciones.map(({ href, texto, icono: Icono }) => (
          <Link key={href} href={href} className="flex items-center gap-4 px-5 py-4 hover:bg-rubor-50">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-ciruela-50 text-ciruela-700">
              <Icono className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">{texto}</span>
              <span className="block text-xs text-humo">{DESCRIPCIONES[href]}</span>
            </span>
            <ChevronRight className="size-4 text-humo" />
          </Link>
        ))}
      </Tarjeta>
      <Tarjeta className="divide-y divide-linea overflow-hidden">
        <Link href="/" className="flex items-center gap-4 px-5 py-4 hover:bg-rubor-50">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-dorado-200/50 text-dorado-600">
            <Smartphone className="size-5" />
          </span>
          <span className="flex-1 font-medium">Ver app de clientas</span>
          <ChevronRight className="size-4 text-humo" />
        </Link>
        <form action="/auth/salir" method="post">
          <button className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-rubor-50">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
              <LogOut className="size-5" />
            </span>
            <span className="flex-1 font-medium">Cerrar sesión</span>
          </button>
        </form>
      </Tarjeta>
    </div>
  );
}
