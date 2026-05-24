import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de cookies — RUTA34 Telecom",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" lastUpdated="24 de mayo de 2026">
      <Section title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que los sitios web guardan en tu dispositivo
          cuando los visitás. Permiten que el sitio recuerde tus preferencias y mejore tu
          experiencia de navegación.
        </p>
      </Section>

      <Section title="Cookies que utilizamos">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Duración</th>
              <th>Finalidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>NEXT_LOCALE</code></td>
              <td>Técnica</td>
              <td>1 año</td>
              <td>Recordar el idioma seleccionado (ES / PT)</td>
            </tr>
            <tr>
              <td><code>ruta34_cookie_consent</code></td>
              <td>Técnica</td>
              <td>1 año</td>
              <td>Guardar tu decisión sobre el consentimiento de cookies</td>
            </tr>
            <tr>
              <td><code>_ga</code>, <code>_ga_*</code></td>
              <td>Analítica</td>
              <td>2 años</td>
              <td>
                Google Analytics: medir visitas y comportamiento de usuario de forma anónima.
                Solo se activan con tu consentimiento.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Cookies técnicas (necesarias)">
        <p>
          Las cookies <strong>NEXT_LOCALE</strong> y <strong>ruta34_cookie_consent</strong> son
          estrictamente necesarias para el funcionamiento del sitio. No requieren tu consentimiento
          y no pueden desactivarse.
        </p>
      </Section>

      <Section title="Cookies analíticas (opcionales)">
        <p>
          Utilizamos Google Analytics para entender cómo los visitantes interactúan con nuestra web
          (páginas más vistas, origen del tráfico, tasa de conversión). Los datos son anónimos y
          no permiten identificarte personalmente.
        </p>
        <p>
          Estas cookies solo se instalan si aceptás el uso de cookies analíticas en el banner
          que aparece al visitar el sitio por primera vez.
        </p>
      </Section>

      <Section title="Cómo gestionar tus preferencias">
        <p>Podés cambiar tus preferencias en cualquier momento de estas formas:</p>
        <ul>
          <li>
            <strong>Banner de cookies:</strong> al visitar el sitio por primera vez aparece un
            banner donde podés aceptar o rechazar las cookies opcionales.
          </li>
          <li>
            <strong>Configuración del navegador:</strong> todos los navegadores modernos permiten
            bloquear o eliminar cookies desde sus ajustes de privacidad.
          </li>
          <li>
            <strong>Google Analytics Opt-out:</strong> podés instalar el complemento oficial de
            Google en{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              tools.google.com/dlpage/gaoptout
            </a>.
          </li>
        </ul>
        <p>
          Ten en cuenta que desactivar ciertas cookies puede afectar la experiencia de navegación
          (por ejemplo, el idioma puede no recordarse entre sesiones).
        </p>
      </Section>

      <Section title="Transferencias internacionales">
        <p>
          Google Analytics puede transferir datos a servidores en Estados Unidos. Google Inc.
          está adherida al marco EU-U.S. Data Privacy Framework, lo que garantiza un nivel
          adecuado de protección conforme al RGPD.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Para más información sobre el tratamiento de tus datos personales, consultá nuestra{" "}
          <a href="../privacidad">Política de privacidad</a>. Si tenés dudas sobre el uso de
          cookies, podés escribirnos a soporte@ruta34.com.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#111111] mb-3 tracking-tight">{title}</h2>
      <div className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-[#F0F0F0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#111] [&_th]:py-2 [&_th]:px-3 [&_th]:bg-[#F8F8F8] [&_th]:border [&_th]:border-black/8
        [&_td]:py-2 [&_td]:px-3 [&_td]:border [&_td]:border-black/8 [&_td:first-child]:font-mono [&_td:first-child]:text-xs
        [&_a]:text-[#E60000] [&_a]:underline [&_a]:hover:no-underline">
        {children}
      </div>
    </section>
  );
}
