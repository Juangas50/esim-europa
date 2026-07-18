import { Metadata } from "next";
import { headers } from "next/headers";
import LegalLayout from "@/components/legal/LegalLayout";
import LegalSchemaOrg from "@/components/seo/LegalSchemaOrg";

// ── Metadata ─────────────────────────────────────────────────────────────────
const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${base}/${locale}/privacidad`;

  return {
    title:
      locale === "pt"
        ? "Política de privacidade — RUTA34 Telecom"
        : "Política de privacidad — RUTA34 Telecom",
    description:
      locale === "pt"
        ? "Política de privacidade da RUTA34 Telecom. Cumpre com LGPD e GDPR. Saiba como processamos seus dados pessoais."
        : "Política de privacidad de RUTA34 Telecom. Cumple con RGPD. Conoce cómo procesamos tus datos personales.",
    alternates: {
      canonical: url,
      languages: {
        es: `${base}/es/privacidad`,
        pt: `${base}/pt/privacidad`,
      },
    },
    openGraph: {
      title:
        locale === "pt"
          ? "Política de privacidade — RUTA34 Telecom"
          : "Política de privacidad — RUTA34 Telecom",
      description:
        locale === "pt"
          ? "Política de privacidade da RUTA34 Telecom. Cumpre com LGPD e GDPR."
          : "Política de privacidad de RUTA34 Telecom. Cumple con RGPD.",
      type: "website",
      url,
      locale: locale === "pt" ? "pt_BR" : "es_AR",
      siteName: "RUTA34 Telecom",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PrivacidadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <LegalSchemaOrg locale={locale as "es" | "pt"} page="privacidad" lastUpdated="24 de mayo de 2026" nonce={nonce} />
      {locale === "pt" ? <PrivacidadPT /> : <PrivacidadES />}
    </>
  );
}

// ── ES ────────────────────────────────────────────────────────────────────────
function PrivacidadES() {
  return (
    <LegalLayout title="Política de privacidad" lastUpdated="24 de mayo de 2026">
      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos personales es RUTA34 Telecom, con domicilio
          a efectos de contacto en soporte@esimruta34.com.
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Al realizar una compra, recopilamos los siguientes datos:</p>
        <ul>
          <li>
            <strong>Identificativos:</strong> nombre, apellido y país de origen.
          </li>
          <li>
            <strong>Contacto:</strong> dirección de correo electrónico.
          </li>
          <li>
            <strong>Transaccionales:</strong> referencia del pedido, plan adquirido, fecha de
            activación solicitada y método de pago (sin datos de tarjeta, que gestiona el proveedor
            de pago).
          </li>
        </ul>
        <p>
          No recopilamos datos especialmente sensibles (salud, origen racial, afiliación política,
          etc.).
        </p>
      </Section>

      <Section title="3. Finalidad y base jurídica del tratamiento">
        <table>
          <thead>
            <tr>
              <th>Finalidad</th>
              <th>Base jurídica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gestión y entrega del pedido (envío del QR)</td>
              <td>Ejecución del contrato</td>
            </tr>
            <tr>
              <td>Facturación y obligaciones fiscales</td>
              <td>Obligación legal</td>
            </tr>
            <tr>
              <td>Atención al cliente y soporte posventa</td>
              <td>Interés legítimo</td>
            </tr>
            <tr>
              <td>Recordatorio de activación (si se programó)</td>
              <td>Ejecución del contrato</td>
            </tr>
            <tr>
              <td>Comunicaciones comerciales (solo con consentimiento)</td>
              <td>Consentimiento</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Conservación de los datos">
        <p>
          Conservamos los datos de pedido durante <strong>5 años</strong> a efectos fiscales y
          contables, conforme a la normativa española. Los datos de contacto para comunicaciones
          comerciales se conservan hasta que el usuario retire su consentimiento.
        </p>
      </Section>

      <Section title="5. Destinatarios y transferencias internacionales">
        <p>Los datos pueden ser compartidos con:</p>
        <ul>
          <li>
            <strong>Stripe Inc.</strong> (procesador de pago) — transferencia internacional
            amparada en cláusulas contractuales tipo de la Comisión Europea.
          </li>
          <li>
            <strong>Supabase Inc.</strong> (base de datos) — infraestructura alojada en la UE.
          </li>
          <li>
            <strong>Resend Inc.</strong> (envío de correos transaccionales).
          </li>
        </ul>
        <p>No vendemos ni cedemos datos personales a terceros con fines comerciales.</p>
      </Section>

      <Section title="6. Derechos del interesado (RGPD)">
        <p>Podés ejercer los siguientes derechos enviando un correo a soporte@esimruta34.com:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> obtener confirmación de si tratamos tus datos y una copia de
            los mismos.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos inexactos o incompletos.
          </li>
          <li>
            <strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean
            necesarios.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible.
          </li>
          <li>
            <strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.
          </li>
          <li>
            <strong>Limitación:</strong> solicitar que suspendamos el tratamiento en determinadas
            circunstancias.
          </li>
        </ul>
        <p>
          También tenés derecho a presentar una reclamación ante la Agencia Española de Protección
          de Datos (aepd.es).
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Utilizamos cookies técnicas y analíticas. Podés consultar nuestra{" "}
          <a href="../cookies">Política de cookies</a> para más información y para gestionar tus
          preferencias.
        </p>
      </Section>

      <Section title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a
          accesos no autorizados, pérdida o alteración: conexiones cifradas (TLS), acceso
          restringido a la base de datos mediante Row Level Security, y revisiones periódicas de
          seguridad.
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          Podemos actualizar esta política en cualquier momento. Te notificaremos por correo si los
          cambios son sustanciales. La fecha de «Última actualización» al inicio del documento
          refleja siempre la versión vigente.
        </p>
      </Section>
    </LegalLayout>
  );
}

// ── PT ────────────────────────────────────────────────────────────────────────
function PrivacidadPT() {
  return (
    <LegalLayout title="Política de privacidade" lastUpdated="24 de maio de 2026">
      <Section title="1. Responsável pelo tratamento">
        <p>
          O responsável pelo tratamento dos dados pessoais é a RUTA34 Telecom, com endereço de
          contato em soporte@esimruta34.com.
        </p>
      </Section>

      <Section title="2. Dados que coletamos">
        <p>Ao realizar uma compra, coletamos os seguintes dados:</p>
        <ul>
          <li>
            <strong>Identificação:</strong> nome, sobrenome e país de origem.
          </li>
          <li>
            <strong>Contato:</strong> endereço de e-mail.
          </li>
          <li>
            <strong>Transacionais:</strong> referência do pedido, plano adquirido, data de
            ativação solicitada e método de pagamento (sem dados do cartão, gerenciados pelo
            provedor de pagamento).
          </li>
        </ul>
        <p>
          Não coletamos dados especialmente sensíveis (saúde, origem racial, filiação política,
          etc.).
        </p>
      </Section>

      <Section title="3. Finalidade e base jurídica do tratamento">
        <table>
          <thead>
            <tr>
              <th>Finalidade</th>
              <th>Base jurídica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gestão e entrega do pedido (envio do QR)</td>
              <td>Execução do contrato</td>
            </tr>
            <tr>
              <td>Faturamento e obrigações fiscais</td>
              <td>Obrigação legal</td>
            </tr>
            <tr>
              <td>Atendimento ao cliente e suporte pós-venda</td>
              <td>Interesse legítimo</td>
            </tr>
            <tr>
              <td>Lembrete de ativação (se programado)</td>
              <td>Execução do contrato</td>
            </tr>
            <tr>
              <td>Comunicações comerciais (somente com consentimento)</td>
              <td>Consentimento</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Conservação dos dados">
        <p>
          Mantemos os dados do pedido por <strong>5 anos</strong> para fins fiscais e contábeis,
          conforme a legislação espanhola. Os dados de contato para comunicações comerciais são
          mantidos até que o usuário retire seu consentimento.
        </p>
      </Section>

      <Section title="5. Destinatários e transferências internacionais">
        <p>Os dados podem ser compartilhados com:</p>
        <ul>
          <li>
            <strong>Stripe Inc.</strong> (processador de pagamento) — transferência internacional
            amparada por cláusulas contratuais padrão da Comissão Europeia.
          </li>
          <li>
            <strong>Supabase Inc.</strong> (banco de dados) — infraestrutura hospedada na UE.
          </li>
          <li>
            <strong>Resend Inc.</strong> (envio de e-mails transacionais).
          </li>
        </ul>
        <p>Não vendemos nem cedemos dados pessoais a terceiros para fins comerciais.</p>
      </Section>

      <Section title="6. Direitos do titular (LGPD / RGPD)">
        <p>
          Você pode exercer os seguintes direitos enviando um e-mail para soporte@esimruta34.com:
        </p>
        <ul>
          <li>
            <strong>Acesso:</strong> obter confirmação sobre se tratamos seus dados e uma cópia
            deles.
          </li>
          <li>
            <strong>Retificação:</strong> corrigir dados inexatos ou incompletos.
          </li>
          <li>
            <strong>Eliminação:</strong> solicitar a exclusão dos seus dados quando não forem mais
            necessários.
          </li>
          <li>
            <strong>Portabilidade:</strong> receber seus dados em formato estruturado e legível.
          </li>
          <li>
            <strong>Oposição:</strong> opor-se ao tratamento baseado em interesse legítimo.
          </li>
          <li>
            <strong>Limitação:</strong> solicitar a suspensão do tratamento em determinadas
            circunstâncias.
          </li>
        </ul>
        <p>
          Estes direitos são garantidos pelo Regulamento Geral de Proteção de Dados (RGPD) europeu
          e pela Lei Geral de Proteção de Dados (LGPD) brasileira. Você também pode apresentar uma
          reclamação à Autoridade Nacional de Proteção de Dados do Brasil (gov.br/anpd) ou à
          Agência Espanhola de Proteção de Dados (aepd.es).
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Utilizamos cookies técnicos e analíticos. Você pode consultar nossa{" "}
          <a href="../cookies">Política de cookies</a> para mais informações e para gerenciar suas
          preferências.
        </p>
      </Section>

      <Section title="8. Segurança">
        <p>
          Aplicamos medidas técnicas e organizacionais adequadas para proteger seus dados contra
          acessos não autorizados, perda ou alteração: conexões criptografadas (TLS), acesso
          restrito ao banco de dados via Row Level Security e revisões periódicas de segurança.
        </p>
      </Section>

      <Section title="9. Modificações">
        <p>
          Podemos atualizar esta política a qualquer momento. Você será notificado por e-mail caso
          as alterações sejam substanciais. A data de «Última atualização» no início do documento
          sempre reflete a versão vigente.
        </p>
      </Section>
    </LegalLayout>
  );
}

// ── Section shared component ──────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#1B2F4E] mb-3 tracking-tight">{title}</h2>
      <div
        className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#1B2F4E] [&_th]:py-2 [&_th]:px-3 [&_th]:bg-[#F8F8F8] [&_th]:border [&_th]:border-black/8
        [&_td]:py-2 [&_td]:px-3 [&_td]:border [&_td]:border-black/8
        [&_a]:text-[#C9973A] [&_a]:underline [&_a]:hover:no-underline"
      >
        {children}
      </div>
    </section>
  );
}
