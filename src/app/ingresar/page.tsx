import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { obtenerPerfil } from "@/lib/sesion";
import { FormularioIngreso } from "./formulario";

export const metadata: Metadata = { title: "Ingresar" };

export default async function PaginaIngresar({ searchParams }: PageProps<"/ingresar">) {
  const { volver, error } = await searchParams;
  const destino = typeof volver === "string" && volver.startsWith("/") ? volver : "/mis-citas";

  if (await obtenerPerfil()) redirect(destino);

  return (
    <main className="fondo-satinado flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-aparecer">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-[2rem] bg-marfil/90 p-7 shadow-flotante ring-1 ring-linea backdrop-blur sm:p-9">
          <h1 className="font-titulo text-3xl text-ciruela-900">Bienvenida ♡</h1>
          <p className="mt-2 text-sm text-humo">
            Ingresa con tu correo para agendar y ver tus citas. No necesitas contraseña: te enviamos un código.
          </p>
          <FormularioIngreso destino={destino} errorInicial={typeof error === "string" ? error : null} />
        </div>
        <p className="mt-6 text-center text-xs text-humo">
          Al continuar aceptas nuestra{" "}
          <Link href="/privacidad" className="underline">
            política de tratamiento de datos
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
