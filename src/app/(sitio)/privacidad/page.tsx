import type { Metadata } from "next";
import { marca } from "@/lib/marca";

export const metadata: Metadata = { title: "Tratamiento de datos personales" };

const SECCIONES: { titulo: string; parrafos: string[] }[] = [
  {
    titulo: "1. Responsable del tratamiento",
    parrafos: [
      `${marca.nombreCompleto} (en adelante, "el Responsable"), negocio de servicios de manicure, pedicure y spa de uñas a domicilio en ${marca.ciudadBase}, Colombia. Correo de contacto: ${marca.correoAdmin}.`,
    ],
  },
  {
    titulo: "2. Marco legal",
    parrafos: [
      "Esta política se adopta en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto Único 1074 de 2015) y demás normas que regulan la protección de datos personales en Colombia.",
    ],
  },
  {
    titulo: "3. Datos que recolectamos",
    parrafos: [
      "Nombre, correo electrónico, número de celular, fecha de cumpleaños (opcional), direcciones de atención con sus indicaciones, historial de citas y pagos, preferencias de servicio, notas que nos compartas (por ejemplo, alergias o sensibilidades) y fotografías de referencia que decidas subir.",
      "Los pagos en línea son procesados por Wompi (Bancolombia). Nosotros no almacenamos los datos de tus tarjetas ni de tus cuentas bancarias.",
    ],
  },
  {
    titulo: "4. Finalidades",
    parrafos: [
      "a) Agendar, confirmar, reprogramar y prestar los servicios solicitados, incluyendo el desplazamiento a la dirección indicada.",
      "b) Contactarte por WhatsApp, llamada o correo para temas relacionados con tus citas.",
      "c) Gestionar pagos, anticipos y facturación.",
      "d) Personalizar tu experiencia (por ejemplo, recordar tus preferencias y precauciones de salud).",
      "e) Enviarte, si lo autorizas, promociones, beneficios de fidelización y saludos de cumpleaños.",
      "f) Cumplir obligaciones legales y atender requerimientos de autoridades.",
    ],
  },
  {
    titulo: "5. Datos sensibles",
    parrafos: [
      "Información sobre alergias o condiciones de salud de tus uñas y piel puede considerarse dato sensible. Su suministro es facultativo y solo se usa para prestarte un servicio seguro. No estás obligada a entregarla.",
    ],
  },
  {
    titulo: "6. Derechos del titular",
    parrafos: [
      "Como titular puedes: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización otorgada; ser informada sobre el uso dado a tus datos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y/o solicitar la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos; y acceder gratuitamente a tus datos.",
      "Puedes actualizar tus datos y direcciones directamente desde la sección “Mi perfil” de la aplicación.",
    ],
  },
  {
    titulo: "7. Consultas y reclamos",
    parrafos: [
      `Escríbenos a ${marca.correoAdmin}. Las consultas se atenderán en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, prorrogables en los términos de la ley.`,
    ],
  },
  {
    titulo: "8. Seguridad y conservación",
    parrafos: [
      "Tus datos se almacenan en servicios en la nube con cifrado y controles de acceso: cada clienta solo puede ver su propia información y únicamente la administradora puede consultar la agenda completa. Conservamos los datos mientras exista la relación comercial y durante el tiempo exigido por la ley.",
    ],
  },
  {
    titulo: "9. Vigencia",
    parrafos: [
      "Esta política rige desde su publicación. Cualquier cambio sustancial será informado a través de la aplicación.",
    ],
  },
];

export default function PaginaPrivacidad() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dorado-600">Ley 1581 de 2012</p>
      <h1 className="mt-2 font-titulo text-4xl text-ciruela-900 sm:text-5xl">Política de tratamiento de datos personales</h1>
      <p className="mt-4 text-humo">
        En {marca.nombreCompleto} cuidamos tu información tanto como tus manos. Aquí te contamos qué datos usamos y
        para qué.
      </p>
      <div className="mt-10 space-y-8">
        {SECCIONES.map((s) => (
          <section key={s.titulo}>
            <h2 className="font-titulo text-2xl text-ciruela-800">{s.titulo}</h2>
            {s.parrafos.map((p) => (
              <p key={p} className="mt-2 leading-relaxed text-tinta/85">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
