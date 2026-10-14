import type { MetadataRoute } from "next";
import { marca } from "@/lib/marca";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: marca.nombreCompleto,
    short_name: marca.nombre,
    description: marca.descripcion,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f4",
    theme_color: "#4a1e3a",
    lang: "es-CO",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
