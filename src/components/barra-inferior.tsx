"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, Home, Images, Sparkles, UserRound } from "lucide-react";
import { cx } from "./ui";

const PESTANAS = [
  { href: "/", texto: "Inicio", icono: Home },
  { href: "/servicios", texto: "Servicios", icono: Sparkles },
  { href: "/reservar", texto: "Agendar", icono: CalendarHeart, destacada: true },
  { href: "/galeria", texto: "Galería", icono: Images },
  { href: "/mis-citas", texto: "Mis citas", icono: UserRound },
];

/** Barra de navegación tipo app, solo en celulares. */
export function BarraInferior() {
  const ruta = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-marfil/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {PESTANAS.map(({ href, texto, icono: Icono, destacada }) => {
          const activa = href === "/" ? ruta === "/" : ruta.startsWith(href);
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
