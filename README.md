# Ana María Nail Atelier 💅

App de agendamiento para el spa de uñas a domicilio de Ana María (Bogotá).
Funciona en celular (se instala como app) y en PC.

**Tecnología:** Next.js 16 + Tailwind · Supabase (base de datos, login, fotos) · Wompi (pagos: PSE, Nequi, tarjeta) · Vercel (publicación)

---

## Dónde vive cada cosa

| Qué | Dónde | Nota |
|---|---|---|
| Código | GitHub (repositorio privado) | Cualquier PC puede descargarlo |
| Clientas, citas, pagos, fotos | Supabase (nube) | No depende de ningún PC |
| App publicada | Vercel (nube) | Se actualiza sola al subir cambios a GitHub |
| Llaves secretas | `.env.local` (solo en el PC) y en Vercel | Se pueden volver a copiar de Supabase/Wompi |

---

## 1. Configurar Supabase (una sola vez)

1. Entra a <https://supabase.com/dashboard> → **New project**.
   - Nombre: `ana-maria-nails` · Región: **East US (North Virginia)** o **São Paulo** · guarda la contraseña de la base de datos.
2. Ve a **SQL Editor → New query**, pega el contenido de `supabase/migrations/0001_esquema.sql` y presiona **Run**.
3. Nueva query con `supabase/migrations/0002_datos_iniciales.sql` → **Run**.
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (luego la URL de Vercel)
   - Redirect URLs: agrega `http://localhost:3000/**` y luego `https://TU-APP.vercel.app/**`
5. **Authentication → Email Templates → Magic Link**: para que también llegue el código de 6 dígitos, reemplaza el cuerpo por:
   ```html
   <h2>Tu código para ingresar</h2>
   <p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
   <p>O toca este enlace: <a href="{{ .ConfirmationURL }}">Ingresar</a></p>
   ```
6. **Project Settings → API**: copia `Project URL`, `anon public` y `service_role` al archivo `.env.local` (ver paso 2).

> ⚠️ El correo gratuito de Supabase permite pocos envíos por hora. Antes de abrir la app al público, configura un SMTP propio (por ejemplo **Resend**, gratis hasta 3.000 correos/mes) en **Authentication → SMTP Settings**.

## 2. Correr la app en un PC

Requisitos: [Node.js](https://nodejs.org) 20+ y [Git](https://git-scm.com).

```bash
git clone https://github.com/<usuario>/ana-maria-nails.git
cd ana-maria-nails
npm install
cp .env.example .env.local   # y llena las llaves
npm run dev                  # abre http://localhost:3000
```

## 3. Publicar en internet (Vercel)

1. <https://vercel.com> → entra con GitHub → **Add New Project** → elige el repositorio.
2. En **Environment Variables** pega las mismas variables de `.env.local`.
3. **Deploy**. Cada cambio que se suba a GitHub se publica solo.

## 4. Pagos con Wompi

1. La cuenta de comercio se crea a nombre de **Ana María** en <https://comercios.wompi.co> (cédula + cuenta bancaria).
2. En **Desarrolladores** copia la llave pública, el secreto de integridad y el secreto de eventos (primero las de **pruebas**).
3. URL de eventos (webhook): `https://TU-APP.vercel.app/api/pagos/wompi/eventos`
4. En el panel de Ana María → **Ajustes** → activa **Pagos en línea**.

Mientras Wompi no esté activo, las clientas nuevas ven las instrucciones para enviar el anticipo por Nequi/transferencia, y Ana María lo registra en su panel.

## 5. Entregarle el proyecto a Ana María 🎁

- **Admin:** `atroncosoranada@gmail.com` ya está registrada como administradora. Cuando ingrese por primera vez verá su panel automáticamente.
- **GitHub:** Settings del repositorio → *Transfer ownership* a la cuenta de Ana María.
- **Supabase:** crear una organización con ella como *Owner* y transferir el proyecto (Project Settings → General → Transfer project).
- **Vercel:** invitarla o transferir el proyecto a su cuenta.
- Quitar el correo de papá de administradores (Panel → Ajustes) si se desea.

## Reglas del negocio (configurables en el panel)

- Horario base: lunes a sábado, 8:00 a. m. a 5:00 p. m. Ana María abre espacios extra (domingos, madrugadas) o bloquea días desde **Disponibilidad**.
- Anticipo del **30 %** solo para clientas nuevas; las frecuentes (3+ citas completadas o marcadas a mano) no lo pagan.
- Cancelación hasta **2 horas** antes.
- Entre citas se reservan **45 minutos de traslado**. La base de datos impide citas cruzadas.
- Hoy solo **domicilio** (precio incluye domicilio). El **salón físico** se activa en Ajustes cuando exista.
