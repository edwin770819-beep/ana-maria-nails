"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CalendarPlus, LayoutGrid, Smartphone, TrendingUp, Users } from "lucide-react";
import { cx } from "@/components/ui";
import { SECCIONES } from "./secciones";

function estaActiva(ruta: string, href: string) {
  return href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
}

/** Barra lateral para PC. */
export function NavegacionLateral() {
  const ruta = usePathname();
  return (
    <nav className="space-y-1">
      {SECCIONES.map(({ href, texto, icono: Icono }) => (
        <Link
          key={href}
          href={href}
          className={cx(
            "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
            estaActiva(ruta, href)
              ? "bg-ciruela-700 text-white shadow-suave"
              : "text-tinta/75 hover:bg-ciruela-50 hover:text-ciruela-800",
          )}
        >
          <Icono className="size-4.5" />
          {texto}
        </Link>
      ))}
      <Link
        href="/"
        className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-dorado-600 hover:bg-dorado-200/40"
      >
        <Smartphone className="size-4.5" />
        Ver app de clientas
      </Link>
    </nav>
  );
}

const PESTANAS_CELULAR = [
  { href: "/admin", texto: "Agenda", icono: CalendarDays },
  { href: "/admin/clientas", texto: "Clientas", icono: Users },
  { href: "/admin/citas/nueva", texto: "Nueva", icono: CalendarPlus, destacada: true },
  { href: "/admin/ingresos", texto: "Ingresos", icono: TrendingUp },
  { href: "/admin/mas", texto: "Más", icono: LayoutGrid },
];

const RUTAS_EN_MAS = ["/admin/mas", "/admin/disponibilidad", "/admin/servicios", "/admin/galeria", "/admin/ajustes"];

/** Barra inferior tipo app para el celular. */
export function NavegacionCelular() {
  const ruta = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-marfil/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {PESTANAS_CELULAR.map(({ href, texto, icono: Icono, destacada }) => {
          const activa =
            href === "/admin/mas" ? RUTAS_EN_MAS.some((r) => ruta.startsWith(r)) : estaActiva(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cx(
                  "flex flex-col items-center gap-1 pb-2 pt-2.5 text-[0.68rem] font-medium",
                  activa ? "text-ciruela-700" : "text-humo",
                )}
              >
                {destacada ? (
                  <span className="-mt-6 flex size-12 items-center justify-center rounded-full bg-ciruela-700 text-white shadow-flotante ring-4 ring-crema">
                    <Icono className="size-5" />
                  </span>
                ) : (
                  <Icono className="size-5" strokeWidth={activa ? 2.2 : 1.7} />
                )}
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
