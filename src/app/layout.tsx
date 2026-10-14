import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { marca } from "@/lib/marca";
import { RegistrarServiceWorker } from "@/components/registrar-sw";
import "./globals.css";

const fuenteTitulo = Cormorant_Garamond({
  variable: "--fuente-titulo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const fuenteTexto = Manrope({
  variable: "--fuente-texto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${marca.nombreCompleto} · ${marca.eslogan}`,
    template: `%s · ${marca.nombreCompleto}`,
  },
  description: marca.descripcion,
  applicationName: marca.nombreCompleto,
  appleWebApp: { capable: true, title: marca.nombre, statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#4a1e3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${fuenteTitulo.variable} ${fuenteTexto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
