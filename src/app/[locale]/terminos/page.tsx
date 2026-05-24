import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Términos y condiciones — RUTA34 Telecom",
  robots: { index: false },
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones" lastUpdated="24 de mayo de 2026">
      <Section title="1. Objeto del servicio">
        <p>
          RUTA34 Telecom (en adelante, «la empresa») ofrece servicios de venta de eSIMs para
          su uso en Europa y España, destinados a viajeros originarios de Latinoamérica. Al
          completar una compra en ruta34.com, el cliente acepta íntegramente los presentes
          términos y condiciones.
        </p>
      </Section>

      <Section title="2. Descripción del producto">
        <p>
          Una eSIM es un perfil de datos móviles que se instala de forma virtual en dispositivos
          compatibles. RUTA34 Telecom comercializa dos tipos de planes:
        </p>
        <ul>
          <li>
            <strong>eSIM Prepago:</strong> el período de 28 días comienza a contar desde el
            momento en que el cliente activa la eSIM. El cliente dispone de hasta 12 meses desde
            la compra para activarla.
          </li>
          <li>
            <strong>eSIM DataOnly:</strong> el cliente dispone de 60 días desde la fecha de
            compra para activar la eSIM. Una vez activada, el período de uso corre según el plan
            adquirido.
          </li>
        </ul>
        <p>
          El código QR de activación se envía por correo electrónico al completar el pago,
          en un plazo máximo de 60 minutos.
        </p>
      </Section>

      <Section title="3. Compatibilidad y responsabilidad del cliente">
        <p>
          Es responsabilidad exclusiva del cliente verificar que su dispositivo sea compatible con
          tecnología eSIM y que no esté bloqueado por su operador de origen. RUTA34 Telecom no
          se hace responsable de la imposibilidad de uso derivada de la incompatibilidad del
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
          <li>Tarjeta de crédito o débito (Visa, Mastercard, American Express) a través de Stripe.</li>
          <li>MercadoPago (disponible para Argentina, Chile, México, Colombia y Brasil).</li>
        </ul>
        <p>
          El cobro es único y no existe renovación automática. La empresa no almacena datos de
          tarjetas de pago; este proceso es gestionado íntegramente por los proveedores de pago.
        </p>
      </Section>

      <Section title="5. Política de reembolso">
        <p>
          El cliente podrá solicitar la cancelación y reembolso completo dentro de las <strong>24 horas
          siguientes a la compra</strong>, siempre que el código QR no haya sido instalado en ningún
          dispositivo.
        </p>
        <p>
          Una vez instalada la eSIM, no procede reembolso bajo ninguna circunstancia, dado que el
          perfil ya ha sido activado en el dispositivo del cliente.
        </p>
        <p>
          Para solicitar un reembolso, el cliente deberá contactar con el soporte por WhatsApp o
          mediante correo a soporte@ruta34.com, indicando la referencia del pedido.
        </p>
      </Section>

      <Section title="6. Limitaciones del servicio">
        <p>
          La cobertura y la velocidad de datos dependen de la red del operador local en cada país
          europeo. RUTA34 Telecom no garantiza velocidades mínimas ni cobertura en zonas rurales
          o remotas. Las llamadas de voz y los SMS no están incluidos salvo indicación expresa en
          el plan.
        </p>
      </Section>

      <Section title="7. Uso aceptable">
        <p>
          Está prohibido el uso de las eSIMs para actividades ilegales, la reventa a terceros, o
          la conexión compartida (tethering) más allá de lo permitido por el plan adquirido.
          RUTA34 Telecom se reserva el derecho de suspender el servicio ante usos fraudulentos o
          contrarios a estos términos.
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
          Para cualquier consulta relacionada con estos términos, podés contactarnos por
          WhatsApp o en soporte@ruta34.com.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#111111] mb-3 tracking-tight">{title}</h2>
      <div className="space-y-3 text-[#444] leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}
