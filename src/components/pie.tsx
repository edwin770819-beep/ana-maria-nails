import Link from "next/link";
import { marca } from "@/lib/marca";
import { Logo } from "./logo";

export function Pie() {
  return (
    <footer className="mt-20 border-t border-linea bg-marfil">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-humo">{marca.eslogan}. Atención a domicilio en {marca.ciudadBase}.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-tinta">Explora</p>
          <ul className="space-y-1.5 text-humo">
            <li><Link href="/servicios" className="hover:text-ciruela-700">Servicios y precios</Link></li>
            <li><Link href="/galeria" className="hover:text-ciruela-700">Galería de diseños</Link></li>
            <li><Link href="/reservar" className="hover:text-ciruela-700">Agendar cita</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-tinta">Información</p>
          <ul className="space-y-1.5 text-humo">
            <li><Link href="/privacidad" className="hover:text-ciruela-700">Tratamiento de datos personales</Link></li>
            <li><Link href="/mis-citas" className="hover:text-ciruela-700">Mis citas</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-linea py-4 text-center text-xs text-humo">
        © {new Date().getFullYear()} {marca.nombreCompleto} · Hecho con amor ♡
      </p>
    </footer>
  );
}
