"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { cx } from "@/components/ui";

/** Reduce la foto a máximo `lado` px y la convierte a JPG para ahorrar espacio en Supabase. */
async function comprimir(archivo: File, lado = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  return new Promise((ok, falla) =>
    lienzo.toBlob((b) => (b ? ok(b) : falla(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.85),
  );
}

/** Sube una foto al bucket público y devuelve su URL. */
export async function subirFotoPublica(archivo: File, carpeta: "servicios" | "disenos") {
  const supabase = crearClienteNavegador();
  const blob = await comprimir(archivo);
  const ruta = `${carpeta}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("publico").upload(ruta, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from("publico").getPublicUrl(ruta).data.publicUrl;
}

/** Selector de foto con vista previa. Guarda la URL en un input oculto `nombre`. */
export function SubirImagen({
  nombre,
  inicial,
  carpeta,
  className,
}: {
  nombre: string;
  inicial?: string | null;
  carpeta: "servicios" | "disenos";
  className?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(inicial ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      setUrl(await subirFotoPublica(archivo, carpeta));
    } catch {
      setError("No se pudo subir la foto. Intenta con otra.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className={className}>
      <input type="hidden" name={nombre} value={url} />
      <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={alElegir} />
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        className={cx(
          "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition",
          url ? "border-transparent" : "border-ciruela-100 bg-rubor-50/60 hover:border-ciruela-300",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Vista previa" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-humo">
            <ImagePlus className="size-8 text-ciruela-300" />
            Toca para subir una foto
          </span>
        )}
        {subiendo && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-ciruela-700" />
          </span>
        )}
      </button>
      {url && (
        <div className="mt-2 flex gap-3 text-xs">
          <button type="button" className="font-medium text-ciruela-700" onClick={() => entrada.current?.click()}>
            Cambiar foto
          </button>
          <button type="button" className="text-humo" onClick={() => setUrl("")}>
            Quitar
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
