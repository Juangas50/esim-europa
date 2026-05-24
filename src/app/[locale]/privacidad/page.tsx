import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de privacidad — RUTA34 Telecom",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" lastUpdated="24 de mayo de 2026">
      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos personales es RUTA34 Telecom, con domicilio
          a efectos de contacto en soporte@ruta34.com.
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Al realizar una compra, recopilamos los siguientes datos:</p>
        <ul>
          <li><strong>Identificativos:</strong> nombre, apellido y país de origen.</li>
          <li><strong>Contacto:</strong> dirección de correo electrónico.</li>
          <li>
            <strong>Transaccionales:</strong> referencia del pedido, plan adquirido, fecha de
            activación solicitada y método de pago (sin datos de tarjeta, que gestiona el
            proveedor de pago).
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
            <strong>Stripe Inc.</strong> (procesador de pago) — transferencia internacional amparada
            en cláusulas contractuales tipo de la Comisión Europea.
          </li>
          <li>
            <strong>Supabase Inc.</strong> (base de datos) — infraestructura alojada en la UE.
          </li>
          <li>
            <strong>Resend Inc.</strong> (envío de correos transaccionales).
          </li>
        </ul>
        <p>
          No vendemos ni cedemos datos personales a terceros con fines comerciales.
        </p>
      </Section>

      <Section title="6. Derechos del interesado (RGPD)">
        <p>Podés ejercer los siguientes derechos enviando un correo a soporte@ruta34.com:</p>
        <ul>
          <li><strong>Acceso:</strong> obtener confirmación de si tratamos tus datos y una copia de los mismos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Limitación:</strong> solicitar que suspendamos el tratamiento en determinadas circunstancias.</li>
        </ul>
        <p>
          También tenés derecho a presentar una reclamación ante la Agencia Española de
          Protección de Datos (aepd.es).
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Utilizamos cookies técnicas y analíticas. Podés consultar nuestra{" "}
          <a href="../cookies">Política de cookies</a> para más información y para gestionar
          tus preferencias.
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#111111] mb-3 tracking-tight">{title}</h2>
      <div className="space-y-3 text-[#444] leading-relaxed text-[15px]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#111] [&_th]:py-2 [&_th]:px-3 [&_th]:bg-[#F8F8F8] [&_th]:border [&_th]:border-black/8
        [&_td]:py-2 [&_td]:px-3 [&_td]:border [&_td]:border-black/8
        [&_a]:text-[#E60000] [&_a]:underline [&_a]:hover:no-underline">
        {children}
      </div>
    </section>
  );
}
