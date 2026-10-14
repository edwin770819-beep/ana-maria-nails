"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { Aviso, Boton, Campo, Entrada } from "@/components/ui";

export function FormularioIngreso({ destino, errorInicial }: { destino: string; errorInicial: string | null }) {
  const router = useRouter();
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(errorInicial ? "No pudimos validar el enlace. Intenta de nuevo." : null);

  // El cliente se crea al usarlo (no al pintar la pantalla)
  const supabase = () => crearClienteNavegador();
  const urlRetorno = () => `${window.location.origin}/auth/callback?volver=${encodeURIComponent(destino)}`;

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const { error } = await supabase().auth.signInWithOtp({
      email: correo.trim().toLowerCase(),
      options: { emailRedirectTo: urlRetorno() },
    });
    setCargando(false);
    if (error) {
      setError(
        error.status === 429
          ? "Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo."
          : "No pudimos enviar el código. Revisa el correo e intenta otra vez.",
      );
      return;
    }
    setPaso("codigo");
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const { error } = await supabase().auth.verifyOtp({
      email: correo.trim().toLowerCase(),
      token: codigo.trim(),
      type: "email",
    });
    setCargando(false);
    if (error) {
      setError("El código no es válido o ya venció.");
      return;
    }
    router.replace(destino);
    router.refresh();
  }

  async function conGoogle() {
    await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: urlRetorno() } });
  }

  return (
    <div className="mt-6 space-y-4">
      {error && <Aviso tipo="error">{error}</Aviso>}

      {paso === "correo" ? (
        <form onSubmit={enviarCodigo} className="space-y-4">
          <Campo etiqueta="Correo electrónico">
            <Entrada
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="tucorreo@gmail.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </Campo>
          <Boton type="submit" className="w-full" disabled={cargando}>
            <Mail className="size-4" />
            {cargando ? "Enviando…" : "Enviarme el código"}
          </Boton>
        </form>
      ) : (
        <form onSubmit={verificarCodigo} className="space-y-4">
          <Aviso tipo="exito">
            Te enviamos un correo a <strong>{correo}</strong>. Escribe el código o toca el enlace del correo.
          </Aviso>
          <Campo etiqueta="Código de verificación">
            <Entrada
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="123456"
              className="text-center text-2xl tracking-[0.5em]"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            />
          </Campo>
          <Boton type="submit" className="w-full" disabled={cargando || codigo.length < 6}>
            {cargando ? "Verificando…" : "Ingresar"}
          </Boton>
          <button type="button" onClick={() => setPaso("correo")} className="w-full text-sm text-humo hover:underline">
            Usar otro correo
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-humo">
        <span className="h-px flex-1 bg-linea" /> o <span className="h-px flex-1 bg-linea" />
      </div>
      <Boton type="button" variante="secundario" className="w-full" onClick={conGoogle}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
        </svg>
        Continuar con Google
      </Boton>
    </div>
  );
}
