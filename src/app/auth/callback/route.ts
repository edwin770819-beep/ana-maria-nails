import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

// Destino de los enlaces mágicos del correo y del inicio con Google.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const codigo = searchParams.get("code");
  const volver = searchParams.get("volver");
  const destino = volver?.startsWith("/") && !volver.startsWith("//") ? volver : "/mis-citas";

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, origin));
  }

  return NextResponse.redirect(new URL(`/ingresar?error=enlace&volver=${encodeURIComponent(destino)}`, origin));
}
