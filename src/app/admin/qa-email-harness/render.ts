/**
 * Render puro de un escenario de QA — arma {subject, html} llamando a las
 * funciones reales de src/lib/email/templates.ts con fixtures ficticios.
 * Sin Supabase, sin Stripe, sin efectos secundarios. La misma función se
 * usa para PREVIEW y para construir el HTML que SEND va a enviar — nunca
 * hay una versión paralela.
 *
 * Nota de auditoría (no es un cambio, solo una observación para el QA):
 * en producción, Email 5 y Email 6 SIEMPRE pasan un `qrUrl` real
 * (qrProxyUrl(orderId), hosteado vía Supabase Storage) — el fallback
 * `cid:esim-qr` del template nunca se ejercita hoy en producción tal
 * cual. Acá lo usamos a propósito (aprobado en FASE 4C §4) porque es la
 * única forma de mostrar una imagen real embebida sin tocar Storage/DB;
 * el resultado visual (imagen incrustada en el email) es equivalente,
 * aunque el mecanismo de transporte (cid+attachment vs. URL hosteada)
 * no sea el mismo bit a bit que el de Email 5/6 en producción hoy.
 */
import {
  emailConfirmacionB2C,
  emailAvisoClienteProgramado,
  emailRecordatorioActivacion,
  emailFechaReprogramada,
  emailEntregaB2C,
  emailEntregaMultiple,
} from "@/lib/email/templates";
import { generateQaQrBuffer, qrBufferToDataUri } from "@/lib/qa-harness/qr";
import {
  getQaScenario,
  QA_ACTIVATION_DATE,
  QA_ACTIVATION_STRING,
  QA_CONFIRMATION_CODE,
  QA_CUSTOMER_NAME,
  QA_NEW_ACTIVATION_DATE,
  QA_ORDER_REFS,
  QA_PLAN_DAYS,
  QA_PLAN_EU_GB,
  QA_PLAN_GB,
  QA_PLAN_NAME,
  QA_RESCHEDULE_URL,
} from "./fixtures";

export interface QaRenderResult {
  scenarioId: string;
  emailLabel: string;
  variantLabel: string;
  subject: string;
  /** HTML exacto que se usaría para el envío real (cid:esim-qr si aplica). */
  sendHtml: string;
  /** Mismo HTML, con cid:esim-qr sustituido por un data: URI SOLO para mostrarlo en el navegador. */
  previewHtml: string;
  variablesUsed: Record<string, unknown>;
  /** Presente únicamente en escenarios con QR (Email 5/6) — para adjuntar en el send real. */
  qrAttachment?: { filename: string; content_type: string; content_id: string; contentBase64: string };
}

function esimLabel(index: number, total: number) {
  return `eSIM ${index + 1} de ${total}`;
}

export async function renderQaScenario(scenarioId: string): Promise<QaRenderResult> {
  const scenario = getQaScenario(scenarioId);

  let subject: string;
  let sendHtml: string;
  let variablesUsed: Record<string, unknown>;
  let qrAttachment: QaRenderResult["qrAttachment"];

  switch (scenarioId) {
    case "email1-single": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRefs: [QA_ORDER_REFS[0]], totalCount: 1, planName: QA_PLAN_NAME, planDays: QA_PLAN_DAYS, planType: "local" as const };
      const tmpl = emailConfirmacionB2C(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email1-multi3": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRefs: [...QA_ORDER_REFS], totalCount: 3, planName: QA_PLAN_NAME, planDays: QA_PLAN_DAYS, planType: "local" as const };
      const tmpl = emailConfirmacionB2C(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email2-single": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRefs: [QA_ORDER_REFS[0]], totalCount: 1, planName: QA_PLAN_NAME, planDays: QA_PLAN_DAYS, activationDate: QA_ACTIVATION_DATE, type: "local" };
      const tmpl = emailAvisoClienteProgramado(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email2-multi3": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRefs: [...QA_ORDER_REFS], totalCount: 3, planName: QA_PLAN_NAME, planDays: QA_PLAN_DAYS, activationDate: QA_ACTIVATION_DATE, type: "local" };
      const tmpl = emailAvisoClienteProgramado(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email3-single": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, activationDate: QA_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL };
      const tmpl = emailRecordatorioActivacion(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email3-multi3": {
      // rescheduleUrl ficticia también en el caso multi — nunca ?rows= con datos reales.
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, activationDate: QA_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL };
      const tmpl = emailRecordatorioActivacion(data);
      subject = tmpl.subject; sendHtml = tmpl.html;
      variablesUsed = { ...data, nota: "Copy singular por diseño — el master no cambia con grupo (ver FASE 4B). Grupo simulado: " + QA_ORDER_REFS.join(", ") };
      break;
    }
    case "email4-single": {
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, newActivationDate: QA_NEW_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL };
      const tmpl = emailFechaReprogramada(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email4-multi-todas": {
      const affectedEsims = QA_ORDER_REFS.map((ref, i) => ({ label: esimLabel(i, 3), orderRef: ref }));
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, newActivationDate: QA_NEW_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL, affectedEsims };
      const tmpl = emailFechaReprogramada(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email4-multi-seleccion-1de3": {
      // Selección parcial: solo eSIM 1 de 3 cambia — numeración contra el grupo completo.
      const affectedEsims = [{ label: esimLabel(0, 3), orderRef: QA_ORDER_REFS[0] }];
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, newActivationDate: QA_NEW_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL, affectedEsims, isPartialSelection: true };
      const tmpl = emailFechaReprogramada(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email4-multi-seleccion-2de3": {
      // Selección parcial no contigua: eSIM 1 y 3 de 3 (se salta la 2) — el
      // ejemplo exacto aprobado en FASE 4B: nunca renumerar a 1/2, 2/2.
      const affectedEsims = [
        { label: esimLabel(0, 3), orderRef: QA_ORDER_REFS[0] },
        { label: esimLabel(2, 3), orderRef: QA_ORDER_REFS[2] },
      ];
      const data = { customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME, newActivationDate: QA_NEW_ACTIVATION_DATE, rescheduleUrl: QA_RESCHEDULE_URL, affectedEsims, isPartialSelection: true };
      const tmpl = emailFechaReprogramada(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      break;
    }
    case "email5-single": {
      const data = {
        customerName: QA_CUSTOMER_NAME, orderRef: QA_ORDER_REFS[0], planName: QA_PLAN_NAME,
        planGB: QA_PLAN_GB, planEUGB: QA_PLAN_EU_GB, planDays: QA_PLAN_DAYS, planType: "local" as const,
        activationString: QA_ACTIVATION_STRING, confirmationCode: QA_CONFIRMATION_CODE,
      };
      const tmpl = emailEntregaB2C(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      const buf = await generateQaQrBuffer(QA_ACTIVATION_STRING);
      qrAttachment = { filename: "qa-esim-qr.png", content_type: "image/png", content_id: "esim-qr", contentBase64: buf.toString("base64") };
      break;
    }
    case "email6-multi2":
    case "email6-multi3": {
      const count = scenarioId === "email6-multi2" ? 2 : 3;
      const refs = QA_ORDER_REFS.slice(0, count);
      const esims = refs.map((ref, i) => ({
        label: esimLabel(i, count), orderRef: ref,
        activationString: QA_ACTIVATION_STRING, confirmationCode: QA_CONFIRMATION_CODE,
      }));
      const data = { customerName: QA_CUSTOMER_NAME, totalCount: count, planName: QA_PLAN_NAME, planType: "local" as const, esims };
      const tmpl = emailEntregaMultiple(data);
      subject = tmpl.subject; sendHtml = tmpl.html; variablesUsed = data;
      // Un único QR de QA reutilizado para las N unidades (misma cid — alcanza
      // para validar tamaño/posición/render, no hace falta uno distinto por unidad).
      const buf = await generateQaQrBuffer(QA_ACTIVATION_STRING);
      qrAttachment = { filename: "qa-esim-qr.png", content_type: "image/png", content_id: "esim-qr", contentBase64: buf.toString("base64") };
      break;
    }
    default:
      throw new Error(`Escenario de QA sin implementación de render: ${scenarioId}`);
  }

  const previewHtml = qrAttachment
    ? sendHtml.replaceAll("cid:esim-qr", qrBufferToDataUri(Buffer.from(qrAttachment.contentBase64, "base64")))
    : sendHtml;

  return {
    scenarioId,
    emailLabel: scenario.emailLabel,
    variantLabel: scenario.variantLabel,
    subject,
    sendHtml,
    previewHtml,
    variablesUsed,
    qrAttachment,
  };
}
