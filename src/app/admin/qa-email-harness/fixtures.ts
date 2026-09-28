/**
 * Fixtures 100% ficticios para el QA Email Harness (FASE 4C). Nada acá
 * viene de Supabase ni de ningún pedido real — todo está hardcodeado en
 * este archivo a propósito, para que sea auditable de un vistazo.
 *
 * activationString/confirmationCode: ver src/lib/qa-harness/qr.ts — el
 * SM-DP+ usa el TLD reservado .invalid (RFC 2606), garantizado a no
 * resolver nunca. rescheduleUrl: mismo dominio .invalid, ruta que no
 * existe en ningún router de la app — no es un link operativo.
 */

export const QA_CUSTOMER_NAME = "Marina";
export const QA_PLAN_NAME = "Europa Plus";
export const QA_PLAN_GB = 270;
export const QA_PLAN_EU_GB = 23;
export const QA_PLAN_DAYS = 28;
export const QA_ACTIVATION_DATE = "15 de octubre de 2026";
export const QA_NEW_ACTIVATION_DATE = "18 de octubre de 2026";

export const QA_ACTIVATION_STRING = "1$qa-fixture.invalid$DEADBEEFDEADBEEFDEADBEEFDEADBEEF";
export const QA_CONFIRMATION_CODE = "00000";
export const QA_RESCHEDULE_URL = "https://qa-fixture.invalid/reprogramar-no-operativo";

export const QA_ORDER_REFS = ["R34-QA-0001", "R34-QA-0002", "R34-QA-0003"] as const;

export interface QaScenario {
  id: string;
  order: number;
  emailNumber: 1 | 2 | 3 | 4 | 5 | 6;
  emailLabel: string;
  variantLabel: string;
  hasQr: boolean; // determina si hay que generar/adjuntar el QR de QA
}

export const QA_SCENARIOS: QaScenario[] = [
  { id: "email1-single", order: 1, emailNumber: 1, emailLabel: "Email 1 · Compra confirmada", variantLabel: "SINGLE", hasQr: false },
  { id: "email1-multi3", order: 2, emailNumber: 1, emailLabel: "Email 1 · Compra confirmada", variantLabel: "MULTI 3 eSIMs", hasQr: false },
  { id: "email2-single", order: 3, emailNumber: 2, emailLabel: "Email 2 · Activación programada", variantLabel: "SINGLE", hasQr: false },
  { id: "email2-multi3", order: 4, emailNumber: 2, emailLabel: "Email 2 · Activación programada", variantLabel: "MULTI 3 eSIMs", hasQr: false },
  { id: "email3-single", order: 5, emailNumber: 3, emailLabel: "Email 3 · Recordatorio de activación", variantLabel: "SINGLE", hasQr: false },
  { id: "email3-multi3", order: 6, emailNumber: 3, emailLabel: "Email 3 · Recordatorio de activación", variantLabel: "MULTI 3 eSIMs", hasQr: false },
  { id: "email4-single", order: 7, emailNumber: 4, emailLabel: "Email 4 · Fecha reprogramada", variantLabel: "SINGLE", hasQr: false },
  { id: "email4-multi-todas", order: 8, emailNumber: 4, emailLabel: "Email 4 · Fecha reprogramada", variantLabel: "MULTI · TODAS 3/3", hasQr: false },
  { id: "email4-multi-seleccion-1de3", order: 9, emailNumber: 4, emailLabel: "Email 4 · Fecha reprogramada", variantLabel: "MULTI · SELECCIÓN 1/3", hasQr: false },
  { id: "email4-multi-seleccion-2de3", order: 10, emailNumber: 4, emailLabel: "Email 4 · Fecha reprogramada", variantLabel: "MULTI · SELECCIÓN 2/3", hasQr: false },
  { id: "email5-single", order: 11, emailNumber: 5, emailLabel: "Email 5 · Entrega", variantLabel: "SINGLE", hasQr: true },
  { id: "email6-multi2", order: 12, emailNumber: 6, emailLabel: "Email 6 · Entrega múltiple", variantLabel: "MULTI 2 eSIMs", hasQr: true },
  { id: "email6-multi3", order: 13, emailNumber: 6, emailLabel: "Email 6 · Entrega múltiple", variantLabel: "MULTI 3 eSIMs", hasQr: true },
];

export function getQaScenario(id: string): QaScenario {
  const scenario = QA_SCENARIOS.find((s) => s.id === id);
  if (!scenario) throw new Error(`Escenario de QA desconocido: ${id}`);
  return scenario;
}
