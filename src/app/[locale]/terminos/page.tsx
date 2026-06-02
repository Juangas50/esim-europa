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
        ? "Termos e condições — RUTA34 Telecom"
        : "Términos y condiciones — RUTA34 Telecom",
    robots: { index: false },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function TerminosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return locale === "pt" ? <TerminosPT /> : <TerminosES />;
}

// ── ES ────────────────────────────────────────────────────────────────────────
function TerminosES() {
  return (
    <LegalLayout title="Términos y condiciones" lastUpdated="2 de junio de 2026">
      <Section title="1. Objeto del servicio">
        <p>
          RUTA34 Telecom (en adelante, «la empresa») ofrece servicios de venta de eSIMs para su
          uso en Europa y España, destinados a viajeros originarios de Latinoamérica. Al completar
          una compra en esimruta34.com, el cliente acepta íntegramente los presentes términos y
          condiciones.
        </p>
        <p>
          El servicio se presta sobre una red de telecomunicaciones española certificada con
          cobertura 4G/5G en España y más de 30 países europeos.
        </p>
      </Section>

      <Section title="2. Descripción del producto">
        <p>
          Una eSIM es un perfil de datos móviles que se instala de forma virtual en dispositivos
          compatibles. RUTA34 Telecom comercializa planes de <strong>eSIM Prepago</strong>: el
          período de 28 días comienza a contar desde el momento en que el cliente activa la eSIM.
          El cliente dispone de hasta 12 meses desde la compra para activarla.
        </p>
        <p>
          El código QR de activación se envía por correo electrónico al completar el pago, dentro
          del horario de atención (lunes a sábado, 8:00 a 21:00 h, hora de España), en un plazo
          máximo de 2 horas. Los pedidos realizados fuera de ese horario serán procesados al inicio
          del siguiente período de atención.
        </p>
      </Section>

      <Section title="3. Compatibilidad y responsabilidad del cliente">
        <p>
          Es responsabilidad exclusiva del cliente verificar que su dispositivo sea compatible con
          tecnología eSIM y que no esté bloqueado por su operador de origen. RUTA34 Telecom no se
          hace responsable de la imposibilidad de uso derivada de la incompatibilidad del
          dispositivo.
        </p>
        <p>
          Al confirmar la compra, el cliente declara expresamente haber verificado la
          compatibilidad de su dispositivo.
        </p>
      </Section>

      <Section title="4. Precios y forma de pago">
        <p>
          Todos los precios se expresan en dólares estadounidenses (USD) e incluyen los impuestos
          aplicables. El pago se realiza en el momento de la compra mediante:
        </p>
        <ul>
          <li>
            Tarjeta de crédito o débito (Visa, Mastercard, American Express) a través de Stripe.
          </li>
        </ul>
        <p>
          El cobro es único y no existe renovación automática. La empresa no almacena datos de
          tarjetas de pago; este proceso es gestionado íntegramente por los proveedores de pago.
        </p>
      </Section>

      <Section title="5. Política de reembolso">
        <p>
          El cliente podrá solicitar la cancelación y reembolso completo dentro de las{" "}
          <strong>24 horas siguientes a la compra</strong>, siempre que el código QR no haya sido
          instalado en ningún dispositivo.
        </p>
        <p>
          Una vez instalada la eSIM, no procede reembolso bajo ninguna circunstancia, dado que el
          perfil ya ha sido activado en el dispositivo del cliente. Antes de procesar cualquier
          reembolso, RUTA34 Telecom verificará con el operador de red si el perfil eSIM ha sido
          descargado o activado en algún dispositivo.
        </p>
        <p>
          Para solicitar un reembolso, el cliente deberá contactar con el soporte por WhatsApp o
          mediante correo a soporte@esimruta34.com, indicando la referencia del pedido.
        </p>
      </Section>

      <Section title="6. Limitaciones del servicio">
        <p>
          La cobertura y la velocidad de datos dependen de la red del operador local en cada país
          europeo. RUTA34 Telecom no garantiza velocidades mínimas ni cobertura en zonas rurales o
          remotas. Todos los planes incluyen llamadas y SMS ilimitados dentro de España. El roaming
          de voz en otros países de la UE depende del plan contratado. Consultá las especificaciones
          de cada plan antes de comprar.
        </p>
      </Section>

      <Section title="7. Uso aceptable">
        <p>
          Está prohibido el uso de las eSIMs para actividades ilegales, la reventa a terceros, o la
          conexión compartida (tethering) más allá de lo permitido por el plan adquirido. RUTA34
          Telecom se reserva el derecho de suspender el servicio ante usos fraudulentos o contrarios
          a estos términos.
        </p>
      </Section>

      <Section title="8. Protección de datos">
        <p>
          Los datos personales facilitados durante la compra se tratarán conforme a nuestra{" "}
          <a href="../privacidad">Política de privacidad</a> y en cumplimiento del Reglamento
          General de Protección de Datos (RGPD).
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          RUTA34 Telecom se reserva el derecho de modificar estos términos en cualquier momento.
          Los cambios se publicarán en esta página con la fecha de actualización. El uso continuado
          del servicio tras la publicación de cambios implica la aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="10. Legislación aplicable">
        <p>
          Los presentes términos se rigen por la legislación española. Para la resolución de
          controversias, las partes se someten a los juzgados y tribunales competentes de España,
          sin perjuicio de los derechos que asistan a los consumidores conforme a la normativa de
          su país de residencia.
        </p>
      </Section>

      <Section title="Contacto">
        <p>
          Para cualquier consulta relacionada con estos términos, podés contactarnos por WhatsApp o
          en soporte@esimruta34.com.
        </p>
      </Section>
    </LegalLayout>
  );
}

// ── PT ────────────────────────────────────────────────────────────────────────
function TerminosPT() {
  return (
    <LegalLayout title="Termos e condições" lastUpdated="2 de junho de 2026">
      <Section title="1. Objeto do serviço">
        <p>
          A RUTA34 Telecom (doravante, «a empresa») oferece serviços de venda de eSIMs para uso
          na Europa e Espanha, destinados a viajantes originários da América Latina. Ao concluir
          uma compra em esimruta34.com, o cliente aceita integralmente os presentes termos e condições.
        </p>
        <p>
          O serviço é prestado sobre uma rede de telecomunicações espanhola certificada com
          cobertura 4G/5G na Espanha e em mais de 30 países europeus.
        </p>
      </Section>

      <Section title="2. Descrição do produto">
        <p>
          Um eSIM é um perfil de dados móveis instalado virtualmente em dispositivos compatíveis.
          A RUTA34 Telecom comercializa planos de <strong>eSIM Pré-pago</strong>: o período de 28
          dias começa a contar a partir do momento em que o cliente ativa o eSIM. O cliente tem até
          12 meses a partir da compra para ativá-lo.
        </p>
        <p>
          O código QR de ativação é enviado por e-mail ao concluir o pagamento, dentro do horário
          de atendimento (segunda a sábado, das 8h às 21h, horário da Espanha), em um prazo máximo
          de 2 horas. Os pedidos realizados fora desse horário serão processados no início do
          próximo período de atendimento.
        </p>
      </Section>

      <Section title="3. Compatibilidade e responsabilidade do cliente">
        <p>
          É responsabilidade exclusiva do cliente verificar que seu dispositivo seja compatível com
          a tecnologia eSIM e que não esteja bloqueado pela operadora de origem. A RUTA34 Telecom
          não se responsabiliza pela impossibilidade de uso decorrente da incompatibilidade do
          dispositivo.
        </p>
        <p>
          Ao confirmar a compra, o cliente declara expressamente ter verificado a compatibilidade
          do seu dispositivo.
        </p>
      </Section>

      <Section title="4. Preços e formas de pagamento">
        <p>
          Todos os preços são expressos em dólares americanos (USD) e incluem os impostos
          aplicáveis. O pagamento é realizado no momento da compra por meio de:
        </p>
        <ul>
          <li>
            Cartão de crédito ou débito (Visa, Mastercard, American Express) via Stripe.
          </li>
        </ul>
        <p>
          A cobrança é única e não há renovação automática. A empresa não armazena dados de
          cartões de pagamento; esse processo é gerenciado integralmente pelos provedores de
          pagamento.
        </p>
      </Section>

      <Section title="5. Política de reembolso">
        <p>
          O cliente poderá solicitar o cancelamento e reembolso integral dentro das{" "}
          <strong>24 horas seguintes à compra</strong>, desde que o código QR não tenha sido
          instalado em nenhum dispositivo.
        </p>
        <p>
          Uma vez instalado o eSIM, não haverá reembolso em nenhuma circunstância, pois o perfil
          já foi ativado no dispositivo do cliente. Antes de processar qualquer reembolso, a
          RUTA34 Telecom verificará com a operadora de rede se o perfil eSIM foi baixado ou
          ativado em algum dispositivo.
        </p>
        <p>
          Para solicitar um reembolso, o cliente deverá entrar em contato com o suporte pelo
          WhatsApp ou por e-mail em soporte@esimruta34.com, informando a referência do pedido.
        </p>
      </Section>

      <Section title="6. Limitações do serviço">
        <p>
          A cobertura e a velocidade dos dados dependem da rede da operadora local em cada país
          europeu. A RUTA34 Telecom não garante velocidades mínimas nem cobertura em zonas rurais
          ou remotas. Todos os planos incluem chamadas e SMS ilimitados dentro da Espanha. O
          roaming de voz em outros países da UE depende do plano contratado. Consulte as
          especificações de cada plano antes de comprar.
        </p>
      </Section>

      <Section title="7. Uso aceitável">
        <p>
          É proibido o uso dos eSIMs para atividades ilegais, a revenda a terceiros, ou o
          compartilhamento de conexão (tethering) além do permitido pelo plano adquirido. A
          RUTA34 Telecom reserva-se o direito de suspender o serviço em caso de usos fraudulentos
          ou contrários a estes termos.
        </p>
      </Section>

      <Section title="8. Proteção de dados">
        <p>
          Os dados pessoais fornecidos durante a compra serão tratados conforme nossa{" "}
          <a href="../privacidad">Política de privacidade</a> e em conformidade com o Regulamento
          Geral de Proteção de Dados (RGPD) europeu e a Lei Geral de Proteção de Dados (LGPD)
          brasileira.
        </p>
      </Section>

      <Section title="9. Modificações">
        <p>
          A RUTA34 Telecom reserva-se o direito de modificar estes termos a qualquer momento. As
          alterações serão publicadas nesta página com a data de atualização. O uso continuado do
          serviço após a publicação de mudanças implica a aceitação dos novos termos.
        </p>
      </Section>

      <Section title="10. Legislação aplicável">
        <p>
          Os presentes termos são regidos pela legislação espanhola. Para a resolução de
          controvérsias, as partes se submetem aos tribunais competentes da Espanha, sem prejuízo
          dos direitos que assistem aos consumidores conforme a legislação de seu país de
          residência.
        </p>
      </Section>

      <Section title="Contato">
        <p>
          Para qualquer dúvida relacionada a estes termos, você pode nos contatar pelo WhatsApp ou
          pelo e-mail soporte@esimruta34.com.
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
      <div className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_a]:text-[#E60000] [&_a]:underline [&_a]:hover:no-underline">
        {children}
      </div>
    </section>
  );
}
