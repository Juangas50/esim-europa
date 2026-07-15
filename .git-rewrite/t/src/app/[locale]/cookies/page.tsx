import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "pt"
        ? "Política de cookies — RUTA34 Telecom"
        : "Política de cookies — RUTA34 Telecom",
    robots: { index: false },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return locale === "pt" ? <CookiesPT /> : <CookiesES />;
}

// ── ES ────────────────────────────────────────────────────────────────────────
function CookiesES() {
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
              <td>
                <code>NEXT_LOCALE</code>
              </td>
              <td>Técnica</td>
              <td>1 año</td>
              <td>Recordar el idioma seleccionado (ES / PT)</td>
            </tr>
            <tr>
              <td>
                <code>ruta34_cookie_consent</code>
              </td>
              <td>Técnica</td>
              <td>1 año</td>
              <td>Guardar tu decisión sobre el consentimiento de cookies</td>
            </tr>
            <tr>
              <td>
                <code>_ga</code>, <code>_ga_*</code>
              </td>
              <td>Analítica</td>
              <td>2 años</td>
              <td>
                Google Analytics: medir visitas y comportamiento de usuario de forma anónima. Solo
                se activan con tu consentimiento.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Cookies técnicas (necesarias)">
        <p>
          Las cookies <strong>NEXT_LOCALE</strong> y{" "}
          <strong>ruta34_cookie_consent</strong> son estrictamente necesarias para el
          funcionamiento del sitio. No requieren tu consentimiento y no pueden desactivarse.
        </p>
      </Section>

      <Section title="Cookies analíticas (opcionales)">
        <p>
          Utilizamos Google Analytics para entender cómo los visitantes interactúan con nuestra
          web (páginas más vistas, origen del tráfico, tasa de conversión). Los datos son anónimos
          y no permiten identificarte personalmente.
        </p>
        <p>
          Estas cookies solo se instalan si aceptás el uso de cookies analíticas en el banner que
          aparece al visitar el sitio por primera vez.
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
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </li>
        </ul>
        <p>
          Ten en cuenta que desactivar ciertas cookies puede afectar la experiencia de navegación
          (por ejemplo, el idioma puede no recordarse entre sesiones).
        </p>
      </Section>

      <Section title="Transferencias internacionales">
        <p>
          Google Analytics puede transferir datos a servidores en Estados Unidos. Google Inc. está
          adherida al marco EU-U.S. Data Privacy Framework, lo que garantiza un nivel adecuado de
          protección conforme al RGPD.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Para más información sobre el tratamiento de tus datos personales, consultá nuestra{" "}
          <a href="../privacidad">Política de privacidad</a>. Si tenés dudas sobre el uso de
          cookies, podés escribirnos a soporte@esimruta34.com.
        </p>
      </Section>
    </LegalLayout>
  );
}

// ── PT ────────────────────────────────────────────────────────────────────────
function CookiesPT() {
  return (
    <LegalLayout title="Política de cookies" lastUpdated="24 de maio de 2026">
      <Section title="O que são cookies?">
        <p>
          Cookies são pequenos arquivos de texto que os sites salvam no seu dispositivo quando você
          os visita. Eles permitem que o site lembre suas preferências e melhore sua experiência
          de navegação.
        </p>
      </Section>

      <Section title="Cookies que utilizamos">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Duração</th>
              <th>Finalidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>NEXT_LOCALE</code>
              </td>
              <td>Técnico</td>
              <td>1 ano</td>
              <td>Lembrar o idioma selecionado (ES / PT)</td>
            </tr>
            <tr>
              <td>
                <code>ruta34_cookie_consent</code>
              </td>
              <td>Técnico</td>
              <td>1 ano</td>
              <td>Salvar sua decisão sobre o consentimento de cookies</td>
            </tr>
            <tr>
              <td>
                <code>_ga</code>, <code>_ga_*</code>
              </td>
              <td>Analítico</td>
              <td>2 anos</td>
              <td>
                Google Analytics: medir visitas e comportamento do usuário de forma anônima.
                Ativados somente com seu consentimento.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Cookies técnicos (necessários)">
        <p>
          Os cookies <strong>NEXT_LOCALE</strong> e{" "}
          <strong>ruta34_cookie_consent</strong> são estritamente necessários para o funcionamento
          do site. Não exigem seu consentimento e não podem ser desativados.
        </p>
      </Section>

      <Section title="Cookies analíticos (opcionais)">
        <p>
          Utilizamos o Google Analytics para entender como os visitantes interagem com nosso site
          (páginas mais visitadas, origem do tráfego, taxa de conversão). Os dados são anônimos e
          não permitem identificá-lo pessoalmente.
        </p>
        <p>
          Esses cookies só são instalados se você aceitar o uso de cookies analíticos no banner
          exibido na primeira visita ao site.
        </p>
      </Section>

      <Section title="Como gerenciar suas preferências">
        <p>Você pode alterar suas preferências a qualquer momento das seguintes formas:</p>
        <ul>
          <li>
            <strong>Banner de cookies:</strong> ao visitar o site pela primeira vez, aparece um
            banner onde você pode aceitar ou recusar os cookies opcionais.
          </li>
          <li>
            <strong>Configurações do navegador:</strong> todos os navegadores modernos permitem
            bloquear ou excluir cookies nas configurações de privacidade.
          </li>
          <li>
            <strong>Google Analytics Opt-out:</strong> você pode instalar o complemento oficial do
            Google em{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </li>
        </ul>
        <p>
          Tenha em mente que desativar certos cookies pode afetar a experiência de navegação (por
          exemplo, o idioma pode não ser lembrado entre sessões).
        </p>
      </Section>

      <Section title="Transferências internacionais">
        <p>
          O Google Analytics pode transferir dados para servidores nos Estados Unidos. O Google
          Inc. adere ao marco EU-U.S. Data Privacy Framework, o que garante um nível adequado de
          proteção conforme o RGPD.
        </p>
      </Section>

      <Section title="Mais informações">
        <p>
          Para mais informações sobre o tratamento dos seus dados pessoais, consulte nossa{" "}
          <a href="../privacidad">Política de privacidade</a>. Se tiver dúvidas sobre o uso de
          cookies, escreva para soporte@esimruta34.com.
        </p>
      </Section>
    </LegalLayout>
  );
}

// ── Section shared component ──────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#111111] mb-3 tracking-tight">{title}</h2>
      <div
        className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-[#F0F0F0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#111] [&_th]:py-2 [&_th]:px-3 [&_th]:bg-[#F8F8F8] [&_th]:border [&_th]:border-black/8
        [&_td]:py-2 [&_td]:px-3 [&_td]:border [&_td]:border-black/8 [&_td:first-child]:font-mono [&_td:first-child]:text-xs
        [&_a]:text-[#E60000] [&_a]:underline [&_a]:hover:no-underline"
      >
        {children}
      </div>
    </section>
  );
}
