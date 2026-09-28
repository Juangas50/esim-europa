"use server";

/**
 * Server actions del QA Email Harness (FASE 4C). Ambas repiten sus guards
 * de entorno de forma independiente — no confían en que el usuario haya
 * llegado acá a través de la UI. Cero imports de Supabase/Stripe/cron/
 * webhooks/acciones de entrega existentes.
 */
import {
  assertQaEmailSendAllowed,
  assertQaHarnessAllowed,
  isQaEmailSendAllowed,
} from "@/lib/qa-harness/guard";
import { sendEmail } from "@/lib/email/send";
import { renderQaScenario } from "./render";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface QaPreviewResponse {
  scenarioId: string;
  emailLabel: string;
  variantLabel: string;
  subject: string;
  previewHtml: string;
  variablesUsed: Record<string, unknown>;
  sendEnabled: boolean;
}

/** Render-only — nunca llama a sendEmail. Requiere solo el primer guard (harness habilitado). */
export async function previewQaScenario(scenarioId: string): Promise<QaPreviewResponse> {
  assertQaHarnessAllowed();

  const result = await renderQaScenario(scenarioId);
  return {
    scenarioId: result.scenarioId,
    emailLabel: result.emailLabel,
    variantLabel: result.variantLabel,
    subject: result.subject,
    previewHtml: result.previewHtml,
    variablesUsed: result.variablesUsed,
    sendEnabled: isQaEmailSendAllowed(),
  };
}

/**
 * Único punto de envío real del harness. Requiere los TRES guards
 * (VERCEL_ENV!=production + QA_HARNESS_ENABLED + QA_EMAIL_SEND_ENABLED).
 * El recipient es exclusivamente el argumento `to` — nunca se deriva de
 * Supabase, de fixtures, de query params ni de nada almacenado.
 */
export async function sendQaTestEmail(
  scenarioId: string,
  to: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  assertQaHarnessAllowed();
  assertQaEmailSendAllowed();

  const trimmedTo = typeof to === "string" ? to.trim() : "";
  if (!EMAIL_RE.test(trimmedTo)) {
    return { ok: false, error: "Dirección de QA inválida." };
  }

  const result = await renderQaScenario(scenarioId);
  const attachments = result.qrAttachment
    ? [
        {
          filename: result.qrAttachment.filename,
          content: Buffer.from(result.qrAttachment.contentBase64, "base64"),
          content_type: result.qrAttachment.content_type,
          content_id: result.qrAttachment.content_id,
        },
      ]
    : undefined;

  const { error } = await sendEmail(trimmedTo, `[QA] ${result.subject}`, result.sendHtml, attachments);

  // Logging seguro: nunca activationString/confirmationCode/tokens/QR/recipient.
  console.log("[qa-email-harness]", {
    emailTemplate: result.emailLabel,
    variant: result.variantLabel,
    timestamp: new Date().toISOString(),
    sendSuccess: !error,
  });

  if (error) return { ok: false, error: "Error enviando el email de prueba." };
  return { ok: true };
}
