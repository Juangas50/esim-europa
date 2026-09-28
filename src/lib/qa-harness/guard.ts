/**
 * Guards de entorno para el QA Email Harness (FASE 4C). Fail-closed: si
 * cualquier señal falta o es ambigua, el harness se niega a funcionar.
 *
 * Dos niveles independientes, cada uno evaluado en cada punto de entrada
 * (nunca solo en la UI):
 *   - harness habilitado (permite RENDER/PREVIEW, nunca envía nada)
 *   - envío habilitado (permite SEND — requiere que el harness también
 *     esté habilitado, más un tercer flag explícito y separado)
 *
 * VERCEL_ENV lo inyecta Vercel automáticamente en todo deployment
 * ("production" | "preview" | "development") — no depende de que nadie
 * lo configure a mano, a diferencia de NODE_ENV (siempre "production" en
 * cualquier build de Next.js) o de heurísticas por nombre de rama.
 */

function isNonProductionVercelEnv(): boolean {
  return process.env.VERCEL_ENV !== "production";
}

export function isQaHarnessAllowed(): boolean {
  return isNonProductionVercelEnv() && process.env.QA_HARNESS_ENABLED === "true";
}

export function isQaEmailSendAllowed(): boolean {
  return (
    isNonProductionVercelEnv() &&
    process.env.QA_HARNESS_ENABLED === "true" &&
    process.env.QA_EMAIL_SEND_ENABLED === "true"
  );
}

export class QaHarnessDisabledError extends Error {
  constructor() {
    super("QA Email Harness deshabilitado en este entorno.");
    this.name = "QaHarnessDisabledError";
  }
}

export class QaEmailSendDisabledError extends Error {
  constructor() {
    super(
      "Envío de QA deshabilitado. Requiere VERCEL_ENV!=production + QA_HARNESS_ENABLED=true + QA_EMAIL_SEND_ENABLED=true."
    );
    this.name = "QaEmailSendDisabledError";
  }
}

/** Debe llamarse al principio de CUALQUIER server action/route del harness, incluida la de preview. */
export function assertQaHarnessAllowed(): void {
  if (!isQaHarnessAllowed()) throw new QaHarnessDisabledError();
}

/** Debe llamarse, ADEMÁS de assertQaHarnessAllowed(), al principio de la acción de envío. */
export function assertQaEmailSendAllowed(): void {
  if (!isQaEmailSendAllowed()) throw new QaEmailSendDisabledError();
}
