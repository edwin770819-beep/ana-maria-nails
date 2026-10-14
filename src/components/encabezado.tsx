import Link from "next/link";
import { CalendarHeart, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { obtenerPerfil } from "@/lib/sesion";
import { Logo } from "./logo";
import { BotonEnlace } from "./ui";

const ENLACES = [
  { href: "/servicios", texto: "Servicios" },
  { href: "/galeria", texto: "Galería" },
  { href: "/mis-citas", texto: "Mis citas" },
];

export async function Encabezado() {
  const perfil = await obtenerPerfil();

  return (
    <header className="sticky top-0 z-40 border-b border-linea/70 bg-crema/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-tinta/80 transition hover:bg-ciruela-50 hover:text-ciruela-800"
            >
              {e.texto}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {perfil?.rol === "admin" && (
            <BotonEnlace href="/admin" variante="secundario" tamano="sm">
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Mi panel</span>
            </BotonEnlace>
          )}
          {perfil ? (
            <>
              <Link
                href="/perfil"
                className="hidden size-9 items-center justify-center rounded-full bg-ciruela-50 text-ciruela-700 ring-1 ring-ciruela-100 md:flex"
                aria-label="Mi perfil"
              >
                <UserRound className="size-4" />
              </Link>
              <form action="/auth/salir" method="post" className="hidden md:block">
                <button
                  className="flex size-9 items-center justify-center rounded-full text-humo hover:bg-ciruela-50"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <Link href="/ingresar" className="hidden text-sm font-medium text-ciruela-700 hover:underline md:block">
              Ingresar
            </Link>
          )}
          {/* En celular ya está el botón central de la barra inferior */}
          <span className="hidden md:block">
            <BotonEnlace href="/reservar" tamano="sm">
              <CalendarHeart className="size-4" />
              Agendar cita
            </BotonEnlace>
          </span>
          {!perfil && (
            <BotonEnlace href="/ingresar" tamano="sm" variante="secundario" className="md:hidden">
              Ingresar
            </BotonEnlace>
          )}
        </div>
      </div>
    </header>
  );
}
