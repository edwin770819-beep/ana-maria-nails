import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { exigirAdmin } from "@/lib/sesion";
import { NavegacionCelular, NavegacionLateral } from "./_componentes/navegacion";

export const metadata: Metadata = { title: { default: "Mi panel", template: "%s · Mi panel" } };

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const perfil = await exigirAdmin();
  const nombre = perfil.nombre?.split(" ")[0] || "Ana María";

  return (
    <div className="pb-barra flex min-h-full flex-1">
      {/* Barra lateral (PC) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-linea bg-marfil px-4 py-6 md:flex">
        <Link href="/admin" className="mb-8 px-2">
          <Logo />
        </Link>
        <NavegacionLateral />
        <div className="mt-auto rounded-2xl bg-rubor-50 p-4 ring-1 ring-rubor-100">
          <p className="font-titulo text-lg italic text-ciruela-900">Hola, {nombre} ♡</p>
          <p className="mt-0.5 truncate text-xs text-humo">{perfil.email}</p>
          <form action="/auth/salir" method="post" className="mt-3">
            <button className="flex items-center gap-1.5 text-xs font-medium text-ciruela-700 hover:underline">
              <LogOut className="size-3.5" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado (celular) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-linea/70 bg-crema/90 px-4 backdrop-blur-md md:hidden">
          <Link href="/admin">
            <Logo compacto />
          </Link>
          <p className="font-titulo text-lg italic text-ciruela-900">Hola, {nombre} ♡</p>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-10">{children}</main>
      </div>

      <NavegacionCelular />
    </div>
  );
}
