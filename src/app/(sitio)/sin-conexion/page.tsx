import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { BotonEnlace } from "@/components/ui";

export const metadata: Metadata = { title: "Sin conexión" };
export const dynamic = "force-static";

export default function SinConexion() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-ciruela-50 text-ciruela-700">
        <WifiOff className="size-7" />
      </span>
      <h1 className="mt-6 font-titulo text-4xl text-ciruela-900">Parece que no hay internet</h1>
      <p className="mt-3 text-humo">
        Revisa tu conexión y vuelve a intentarlo. Tus citas siguen guardadas y seguras ♡
      </p>
      <BotonEnlace href="/" className="mt-8">
        Intentar de nuevo
      </BotonEnlace>
    </div>
  );
}
