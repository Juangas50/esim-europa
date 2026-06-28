import { Metadata } from "next";
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
  const url = `${base}/${locale}/terminos`;

  return {
    title:
      locale === "pt"
        ? "Termos e condições — RUTA34 Telecom"
        : "Términos y condiciones — RUTA34 Telecom",
    description:
      locale === "pt"
        ? "Leia os termos e condições da RUTA34 Telecom. Política de vendas, garantias e responsabilidades sobre eSIM para Europa."
        : "Lee los términos y condiciones de RUTA34 Telecom. Política de ventas, garantías y responsabilidades sobre eSIM para Europa.",
    alternates: {
      canonical: url,
      languages: {
        es: `${base}/es/terminos`,
        pt: `${base}/pt/terminos`,
      },
    },
    openGraph: {
      title:
        locale === "pt"
          ? "Termos e condições — RUTA34 Telecom"
          : "Términos y condiciones — RUTA34 Telecom",
      description:
        locale === "pt"
          ? "Leia os termos e condições da RUTA34 Telecom"
          : "Lee los términos y condiciones de RUTA34 Telecom",
      type: "website",
      url,
      locale: locale === "pt" ? "pt_BR" : "es_AR",
      siteName: "RUTA34 Telecom",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function TerminosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <LegalSchemaOrg locale={locale as "es" | "pt"} page="terminos" lastUpdated="2 de junio de 2026" />
      {locale === "pt" ? <TerminosPT /> : <TerminosES />}
    </>
  );
}

// ── ES ────────────────────────────────────────────────────────────────────────
function TerminosES() {
  return (
    <LegalLayout title="Términos y condiciones" lastUpdated="2 de junio de 2026">
      <Section title="Identificación del prestador">
        <p>
          El presente servicio es prestado por RUTA34 TELECOM, S.L., sociedad con domicilio en
          España, en adelante &quot;RUTA34 Telecom&quot; o &quot;la empresa&quot;. Para cualquier
          consulta relacionada con la identificación legal del prestador, podés escribir a
          soporte@esimruta34.com.
        </p>
      </Section>

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
        <p>
          La contratación del servicio está reservada a personas mayores de 18 años. Al completar
          la compra, el cliente declara ser mayor de edad y tener capacidad legal para contratar.
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
        <p>
          Los precios se muestran en dólares estadounidenses (USD). El importe final que el cliente
          vea reflejado en su tarjeta o medio de pago puede verse afectado por el tipo de cambio
          aplicado por su entidad bancaria o emisora de tarjeta, así como por impuestos, percepciones
          o recargos propios de su país de residencia. RUTA34 TELECOM, S.L. no tiene control ni
          responsabilidad sobre estos cargos adicionales, que son ajenos al precio publicado.
        </p>
      </Section>

      <Section title="5. Facturación">
        <p>
          El comprobante de pago emitido automáticamente por la pasarela de pago no constituye una
          factura fiscal española. Si el cliente requiere factura, podrá solicitarla escribiendo a
          soporte@esimruta34.com indicando el número de pedido y los datos fiscales necesarios
          (nombre/razón social, domicilio, identificación fiscal de su país). La factura será
          emitida por RUTA34 TELECOM, S.L. conforme a la normativa española aplicable, en un plazo
          de hasta 7 días hábiles desde la solicitud.
        </p>
      </Section>

      <Section title="6. Política de reembolso">
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

      <Section title="7. Exclusión del derecho de desistimiento">
        <p>
          De conformidad con lo establecido en el artículo 25 de la Directiva 2011/83/UE, el cliente
          reconoce que la prestación del servicio de eSIM comienza inmediatamente tras la activación
          del código QR, y que el producto es intangible y no puede devolverse. Por esta razón, y en
          aplicación de la legislación vigente, se excluye expresamente el derecho de desistimiento
          una vez que el cliente ha instalado y activado la eSIM en su dispositivo.
        </p>
        <p>
          No obstante, el cliente mantiene el derecho de solicitar el reembolso total dentro de las
          <strong>24 horas siguientes a la compra</strong> si aún no ha instalado la eSIM. Tras
          transcurrir este plazo, no procede reembolso bajo ninguna circunstancia.
        </p>
      </Section>

      <Section title="8. Limitaciones del servicio">
        <p>
          La cobertura y la velocidad de datos dependen de la red del operador local en cada país
          europeo. RUTA34 Telecom no garantiza velocidades mínimas ni cobertura en zonas rurales o
          remotas. Todos los planes incluyen llamadas y SMS ilimitados dentro de España. El roaming
          de voz en otros países de la UE depende del plan contratado. Consultá las especificaciones
          de cada plan antes de comprar.
        </p>
      </Section>

      <Section title="9. Límite de responsabilidad">
        <p>
          En la máxima medida permitida por la ley, RUTA34 TELECOM, S.L. declina toda responsabilidad
          por:
        </p>
        <ul>
          <li>Pérdida de datos, correos electrónicos o mensajes durante el uso de la eSIM.</li>
          <li>Interrupción del servicio debido a fallos técnicos, de red o de terceros proveedores.</li>
          <li>Daños indirectos, incidentales, especiales o consecuentes derivados del uso de la eSIM.</li>
          <li>Conflictos entre la eSIM y dispositivos o software del cliente.</li>
        </ul>
        <p>
          La responsabilidad total de RUTA34 TELECOM, S.L. ante el cliente, en cualquier
          circunstancia y por cualquier concepto, no podrá exceder el monto total pagado por el
          cliente por la compra del plan eSIM.
        </p>
      </Section>

      <Section title="10. Uso aceptable">
        <p>
          Está prohibido el uso de las eSIMs para actividades ilegales, la reventa a terceros, o la
          conexión compartida (tethering) más allá de lo permitido por el plan adquirido. RUTA34
          Telecom se reserva el derecho de suspender el servicio ante usos fraudulentos o contrarios
          a estos términos.
        </p>
      </Section>

      <Section title="11. Protección de datos">
        <p>
          Los datos personales facilitados durante la compra se tratarán conforme a nuestra{" "}
          <a href="../privacidad">Política de privacidad</a> y en cumplimiento del Reglamento
          General de Protección de Datos (RGPD).
        </p>
      </Section>

      <Section title="12. Modificaciones">
        <p>
          RUTA34 Telecom se reserva el derecho de modificar estos términos en cualquier momento.
          Los cambios se publicarán en esta página con la fecha de actualización. El uso continuado
          del servicio tras la publicación de cambios implica la aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="13. Legislación aplicable">
        <p>
          Los presentes términos se rigen por la legislación española. RUTA34 TELECOM, S.L., como
          entidad prestadora del servicio, se somete a los juzgados y tribunales competentes de
          España para la resolución de controversias.
        </p>
        <p>
          <strong>Para consumidores residentes en la Unión Europea:</strong> Los consumidores disfrutan
          de la protección establecida en la Directiva 2011/83/UE (Derechos de los consumidores) y en
          la legislación de protección al consumidor de su país de residencia, incluyendo el derecho
          a acceder a procedimientos alternativos de resolución de conflictos (ADR) sin costo. Los
          consumidores pueden presentar quejas ante la plataforma de resolución de controversias
          en línea (ODR) de la Comisión Europea en <a href="https://ec.europa.eu/consumers/odr/">https://ec.europa.eu/consumers/odr/</a>.
        </p>
        <p>
          <strong>Para consumidores residentes en Latinoamérica:</strong> Sin perjuicio de la
          legislación española aplicable a estos términos, se reconoce que los consumidores
          latinoamericanos están protegidos por las leyes de defensa del consumidor de sus
          respectivos países, incluyendo (según corresponda): Ley de Protección al Consumidor de
          México, Código de Defensa del Consumidor de Brasil, Ley 19.496 de Chile, Código de
          Protección del Consumidor de Colombia, y legislación equivalente en otros países de
          América Latina. Nada en estos términos limita los derechos irrenunciables que asisten a
          los consumidores conforme a sus leyes locales.
        </p>
      </Section>

      <Section title="14. Idioma del contrato">
        <p>
          Estos términos y condiciones se redactan originariamente en idioma español. En caso de
          discrepancia, contradicción o conflicto de interpretación entre la versión en español y
          cualquier otra versión en otro idioma, prevalecerá en todo momento la versión en idioma
          español. El cliente reconoce haber recibido información suficiente en lengua de su
          preferencia antes de confirmar la compra, y que la versión en español es considerada la
          versión prevaleiente para efectos legales y de cumplimiento normativo.
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
      <Section title="Identificação do prestador">
        <p>
          O presente serviço é prestado pela RUTA34 TELECOM, S.L., sociedade com domicílio na
          Espanha, doravante &quot;RUTA34 Telecom&quot; ou &quot;a empresa&quot;. Para qualquer
          dúvida relacionada à identificação legal do prestador, você pode escrever para
          soporte@esimruta34.com.
        </p>
      </Section>

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
        <p>
          A contratação do serviço é reservada a pessoas maiores de 18 anos. Ao concluir a compra,
          o cliente declara ser maior de idade e ter capacidade legal para contratar.
        </p>
      </Section>

      <Section title="2. Descrição do produto">
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
          Os presentes termos são regidos pela legislação espanhola. A RUTA34 TELECOM, S.L., como
          entidade prestadora do serviço, se submete aos tribunais competentes da Espanha para a
          resolução de controvérsias, sem prejuízo dos direitos que assistem aos consumidores
          conforme a legislação de proteção ao consumidor de seu país de residência.
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
      <h2 className="text-lg font-bold text-[#1B2F4E] mb-3 tracking-tight">{title}</h2>
      <div className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_a]:text-[#C9973A] [&_a]:underline [&_a]:hover:no-underline">
        {children}
      </div>
    </section>
  );
}
