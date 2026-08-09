import type { AssistantMessage, AssistantReply } from "./types";

/**
 * Motor conversacional simulado — SOLO para probar la experiencia de la Fase 1.
 *
 * No pretende ser inteligente: reconoce unos pocos guiones por palabras clave y
 * responde de forma determinista. Toda la lógica real vivirá detrás de
 * `/api/assistant/chat` en la fase siguiente; este módulo desaparecerá o quedará
 * como fixture de tests.
 *
 * Devuelve **claves de traducción**, nunca texto: el copy vive en
 * `messages/es.json` y `messages/pt.json`.
 *
 * ⚠️ No menciona operadores mayoristas ni tallas de proveedor. La identidad de
 * producto es exclusivamente comercial Ruta34.
 */

export type MockIntent =
  | "plan"
  | "install"
  | "troubleshooting"
  | "troubleshooting_installed"
  | "troubleshooting_missing"
  | "handoff"
  | "fallback";

/** Quita acentos y normaliza para comparar sin sorpresas. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/**
 * Coincidencia por palabra completa.
 *
 * "sí" y "no" son demasiado cortos para buscarlos como subcadena: "sin
 * internet" contiene "si" y "no tengo" contiene "no" dentro de otras palabras.
 * Para esos tokens se compara contra las palabras del mensaje, no contra el
 * texto entero.
 */
function matchesWord(haystack: string, words: readonly string[]): boolean {
  const tokens = new Set(haystack.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  return words.some((w) => tokens.has(w));
}

// Palabras clave en español y portugués. El motor es bilingüe a propósito: el
// usuario puede escribir en cualquiera de los dos idiomas del sitio.
// Las claves ya vienen sin acentos porque `normalize()` los quita antes de
// comparar; escribirlas acentuadas aquí sería una coincidencia imposible.
const KEYWORDS = {
  /** Tokens sueltos — se comparan como palabra completa. */
  affirmativeWords: ["si", "sim", "claro", "correcto", "exacto", "aparece", "instalada"],
  negativeWords: ["no", "nao"],
  /** Frases — se comparan como subcadena. */
  negativePhrases: ["todavia no", "aun no", "ainda nao"],
  stuck: [
    "no lo puedo resolver",
    "no puedo resolver",
    "no lo resuelvo",
    "sigue sin",
    "sigo sin",
    "no funciona igual",
    "nada",
    "nao consigo",
    "continua sem",
    "segue sem",
    "no se puede",
  ],
  plan: [
    "viajo",
    "viaje",
    "plan",
    "plano",
    "conviene",
    "recomend",
    "cual me",
    "qual",
    "dias",
    "semana",
    "espana",
    "italia",
    "francia",
    "europa",
    "gb",
    "viagem",
    "vou",
  ],
  install: ["instal", "qr", "activar", "ativar", "escanear", "configurar"],
  trouble: [
    "no me anda",
    "no anda",
    "no funciona",
    "sin internet",
    "no tengo internet",
    "problema",
    "error",
    "falla",
    "nao funciona",
    "sem internet",
    "nao anda",
  ],
} as const;

/** Última etiqueta de guion emitida por el asistente. */
function lastAssistantIntent(history: AssistantMessage[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "assistant") return history[i].intent;
  }
  return undefined;
}

/**
 * Decide la respuesta del guion.
 *
 * El orden de las comprobaciones importa: primero el hilo de troubleshooting en
 * curso, después la petición explícita de ayuda humana, y solo al final la
 * clasificación general por tema.
 */
export function getMockReply(input: string, history: AssistantMessage[]): AssistantReply {
  const text = normalize(input);
  const previous = lastAssistantIntent(history);

  const isNegative =
    matchesWord(text, KEYWORDS.negativeWords) || includesAny(text, KEYWORDS.negativePhrases);

  // ── Hilo de troubleshooting en curso ──────────────────────────────────────
  if (previous === "troubleshooting") {
    if (includesAny(text, KEYWORDS.stuck)) {
      return { replyKey: "handoff", intent: "handoff", actions: [{ kind: "whatsapp_handoff" }] };
    }
    // La negación se evalúa antes: "no aparece" contiene un token afirmativo
    // ("aparece") y significa exactamente lo contrario.
    if (isNegative) {
      return {
        replyKey: "troubleshootingMissing",
        intent: "troubleshooting_missing",
        actions: [{ kind: "open_guide", slug: "install-iphone" }],
      };
    }
    if (matchesWord(text, KEYWORDS.affirmativeWords)) {
      return { replyKey: "troubleshootingInstalled", intent: "troubleshooting_installed" };
    }
  }

  // Tras un paso de troubleshooting, "no lo puedo resolver" deriva a soporte.
  if (
    (previous === "troubleshooting_installed" || previous === "troubleshooting_missing") &&
    (includesAny(text, KEYWORDS.stuck) || isNegative)
  ) {
    return { replyKey: "handoff", intent: "handoff", actions: [{ kind: "whatsapp_handoff" }] };
  }

  // ── Petición explícita de ayuda humana, en cualquier momento ──────────────
  if (includesAny(text, KEYWORDS.stuck)) {
    return { replyKey: "handoff", intent: "handoff", actions: [{ kind: "whatsapp_handoff" }] };
  }

  // ── Clasificación general ─────────────────────────────────────────────────
  if (includesAny(text, KEYWORDS.trouble)) {
    return { replyKey: "troubleshootingStart", intent: "troubleshooting" };
  }

  if (includesAny(text, KEYWORDS.plan)) {
    return {
      replyKey: "planRecommendation",
      intent: "plan",
      actions: [{ kind: "view_plans" }],
    };
  }

  if (includesAny(text, KEYWORDS.install)) {
    return {
      replyKey: "installStart",
      intent: "install",
      actions: [
        { kind: "open_guide", slug: "install-iphone" },
        { kind: "open_compatibility" },
      ],
    };
  }

  return { replyKey: "fallback", intent: "fallback" };
}
