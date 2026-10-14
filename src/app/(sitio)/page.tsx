import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  CreditCard,
  Gem,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { BotonEnlace, TituloSeccion } from "@/components/ui";
import { marca } from "@/lib/marca";
import { CartaEsmaltes, Destello } from "./_componentes/decoracion";
import { TarjetaServicio } from "./_componentes/tarjeta-servicio";
import { obtenerDisenos, obtenerServicios } from "./_componentes/datos";

const PASOS = [
  {
    icono: Sparkles,
    titulo: "Elige tu servicio",
    texto: "Manicure, pedicure, nail art o un spa completo. Inspírate en la galería y elige tu diseño.",
  },
  {
    icono: CalendarHeart,
    titulo: "Agenda en segundos",
    texto: "Ves solo los horarios disponibles, eliges el tuyo y, si quieres, pagas en línea.",
  },
  {
    icono: Home,
    titulo: "Ana María llega a ti",
    texto: "Con todo listo: insumos esterilizados, productos premium y muchas ganas de consentirte.",
  },
];

const BENEFICIOS = [
  { icono: MapPin, titulo: `A domicilio en ${marca.ciudadBase}`, texto: "El valor del servicio ya incluye el domicilio." },
  { icono: ShieldCheck, titulo: "Bioseguridad", texto: "Herramientas esterilizadas y limas de un solo uso." },
  { icono: Gem, titulo: "Productos premium", texto: "Esmaltes y geles de alta calidad que cuidan tu uña." },
  { icono: CreditCard, titulo: "Pago en línea seguro", texto: "PSE, Nequi, tarjeta o Bancolombia, protegido por Wompi." },
];

export default async function Portada() {
  const [servicios, disenos] = await Promise.all([obtenerServicios(), obtenerDisenos(8)]);
  const destacados = servicios.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="fondo-satinado relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
          <div className="animate-aparecer">
            <p className="inline-flex items-center gap-2 rounded-full bg-marfil/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-dorado-600 ring-1 ring-dorado-200">
              <Destello className="size-3" /> Spa de uñas a domicilio
            </p>
            <h1 className="mt-5 font-titulo text-5xl leading-[1.02] text-ciruela-900 sm:text-6xl lg:text-7xl">
              Uñas perfectas,
              <br />
              <span className="italic texto-dorado">sin salir de casa.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-humo">
              Soy <strong className="font-semibold text-ciruela-800">{marca.nombre}</strong> y llevo el spa de uñas
              hasta tu puerta. Agenda tu cita en segundos, elige tu diseño y déjate consentir.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BotonEnlace href="/reservar" tamano="lg">
                <CalendarHeart className="size-5" />
                Agendar mi cita
              </BotonEnlace>
              <BotonEnlace href="/servicios" variante="secundario" tamano="lg">
                Ver servicios
              </BotonEnlace>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-humo">
              <div className="flex text-dorado-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              Atención personalizada · {marca.ciudadBase}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-6 rounded-full bg-rubor-200/60 blur-3xl" />
            <CartaEsmaltes className="relative w-full" />
            <div className="absolute -bottom-2 left-2 rounded-2xl bg-marfil/95 px-4 py-3 shadow-flotante ring-1 ring-linea backdrop-blur sm:left-6">
              <p className="text-xs text-humo">Tu próxima cita</p>
              <p className="font-titulo text-lg text-ciruela-900">Cuando tú quieras ♡</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <TituloSeccion
          antetitulo="Así de fácil"
          titulo="Tu momento de belleza en tres pasos"
          className="text-center [&_p]:mx-auto"
        />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="relative rounded-3xl bg-marfil p-7 ring-1 ring-linea shadow-suave">
              <span className="absolute right-6 top-5 font-titulo text-6xl italic text-rubor-200">{i + 1}</span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-ciruela-700 text-white">
                <Icono className="size-5" />
              </span>
              <h3 className="mt-5 font-titulo text-2xl text-ciruela-900">{titulo}</h3>
              <p className="mt-2 text-sm text-humo">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Servicios destacados */}
      {destacados.length > 0 && (
        <section className="bg-marfil py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <TituloSeccion
                antetitulo="Servicios"
                titulo="Los favoritos de nuestras clientas"
                descripcion="Precios con domicilio incluido. Sin sorpresas."
              />
              <Link
                href="/servicios"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ciruela-700 hover:gap-2.5 transition-all"
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.map((s) => (
                <TarjetaServicio key={s.id} servicio={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galería */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TituloSeccion
            antetitulo="Inspiración"
            titulo="Galería de diseños"
            descripcion="Elige un diseño y llévalo a tu cita. Ana María lo hace realidad."
          />
          <Link
            href="/galeria"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ciruela-700 hover:gap-2.5 transition-all"
          >
            Ver galería <ArrowRight className="size-4" />
          </Link>
        </div>
        {disenos.length > 0 ? (
          <div className="sin-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
            {disenos.map((d) => (
              <Link
                key={d.id}
                href={`/reservar?diseno=${d.id}`}
                className="group relative aspect-[3/4] w-44 shrink-0 snap-start overflow-hidden rounded-3xl sm:w-auto"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.imagen_url} alt={d.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ciruela-900/80 to-transparent p-3 pt-10 text-sm font-medium text-white">
                  {d.titulo}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["Francés moderno", "Nude elegante", "Nail art", "Glitter dorado"].map((t, i) => (
              <div
                key={t}
                className={[
                  "flex aspect-[3/4] items-end rounded-3xl p-4",
                  ["bg-gradient-to-br from-rubor-100 to-rubor-300", "bg-gradient-to-br from-dorado-200 to-rubor-200", "bg-gradient-to-br from-ciruela-300 to-ciruela-700", "bg-gradient-to-br from-dorado-200 to-dorado-500"][i],
                ].join(" ")}
              >
                <span className="font-titulo text-xl italic text-white drop-shadow">{t}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Beneficios */}
      <section className="bg-ciruela-900 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dorado-400">Por qué elegirnos</p>
          <h2 className="mt-2 max-w-xl font-titulo text-4xl leading-tight">
            Un spa de lujo, <span className="italic text-dorado-400">en la comodidad de tu hogar</span>
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
              <div key={titulo}>
                <span className="flex size-11 items-center justify-center rounded-full ring-1 ring-dorado-400/50 text-dorado-400">
                  <Icono className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
                <p className="mt-1 text-sm text-white/70">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
        <div className="fondo-satinado relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center ring-1 ring-linea sm:px-12">
          <Destello className="mx-auto size-6 text-dorado-500" />
          <h2 className="mt-4 font-titulo text-4xl text-ciruela-900 sm:text-5xl">
            Mereces un momento <span className="italic texto-dorado">para ti</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-humo">
            Reserva hoy y recibe a Ana María en tu casa u oficina. Cupos limitados cada semana.
          </p>
          <BotonEnlace href="/reservar" tamano="lg" className="mt-8">
            <CalendarHeart className="size-5" />
            Agendar mi cita
          </BotonEnlace>
        </div>
      </section>
    </>
  );
}
