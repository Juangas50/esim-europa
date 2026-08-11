/**
 * sanitize.ts — Redacción de PII y secretos ANTES de que el texto llegue al
 * modelo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EL EQUILIBRIO QUE HAY QUE MANTENER
 *
 * Un sanitizador agresivo es fácil de escribir y arruina el producto. Si borra
 * "270 GB", "28 días", "39,90 USD" o "iPhone 15", el asistente deja de poder
 * mantener la conversación para la que existe.
 *
 * La regla que siguen todas las reglas de abajo: **redactar solo lo que no
 * puede ser dato legítimo de producto**. Una tirada de 19 dígitos no es un
 * precio. Un correo no es un modelo de móvil. Un número que pasa Luhn con 16
 * dígitos no es una cantidad de gigas.
 *
 * Cuando una regla podía morder datos legítimos, se le ha puesto un candado
 * extra en vez de ampliarla: Luhn para tarjetas, exigencia de letra + dígito
 * para tokens largos, longitudes mínimas altas para las tiradas numéricas.
 *
 * Las URLs son la excepción a ese equilibrio, y a propósito. Ahí la política es
 * deliberadamente asimétrica: se conserva lo justo de un enlace nuestro y se
 * redacta entero cualquier otro. Un enlace no es un dato que el asistente
 * necesite para razonar —basta con saber que existe— y en cambio la query y el
 * fragmento son el sitio por el que viajan tokens, identificadores de sesión y
 * códigos de activación. Perder un enlace externo no rompe ninguna
 * conversación; enviarlo entero puede filtrar la credencial que lleva pegada.
 *
 * Los tests de `sec-sanitize.spec.ts` afirman las dos mitades: que lo sensible
 * desaparece y que lo legítimo sobrevive intacto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type RedactionKind =
  | "activation_code"
  | "email"
  | "eid"
  | "card"
  | "iccid"
  | "imei"
  | "long_code"
  | "phone"
  | "token"
  | "external_url"
  | "url_parameters";

export interface SanitizeResult {
  text: string;
  /** Qué se redactó y cuántas veces. Nunca el contenido. Apto para logs. */
  redactions: Partial<Record<RedactionKind, number>>;
}

const PLACEHOLDER: Record<RedactionKind, string> = {
  activation_code: "[codigo-de-activacion-oculto]",
  email: "[email-oculto]",
  eid: "[eid-oculto]",
  card: "[tarjeta-oculta]",
  iccid: "[iccid-oculto]",
  imei: "[imei-oculto]",
  long_code: "[codigo-oculto]",
  phone: "[telefono-oculto]",
  token: "[credencial-oculta]",
  external_url: "[enlace-externo-oculto]",
  url_parameters: "[enlace-con-parametros-oculto]",
};

// ── URLs ──────────────────────────────────────────────────────────────────────

/**
 * Hosts públicos de Ruta34.
 *
 * Solo de estos se conserva algo, y solo el origen y la ruta. Todo lo demás se
 * redacta entero: no hay forma de saber qué lleva dentro el enlace de un
 * tercero, y un portal de activación con el código en la query es exactamente
 * el caso que hay que impedir.
 */
const RUTA34_HOSTS = new Set(["esimruta34.com", "www.esimruta34.com"]);

/**
 * ¿Es una ruta pública reconocible, sin nada que parezca un identificador?
 *
 * Las rutas de la web son cortas y legibles (`/help/install/iphone`). Una tirada
 * de ocho dígitos o más dentro de la ruta no es una sección de la web: es un
 * ICCID, un número de pedido o un identificador de sesión que alguien pegó.
 */
function isSafePath(pathname: string): boolean {
  if (pathname.length > 80) return false;
  if (/\d{8,}/.test(pathname)) return false;
  return /^[A-Za-z0-9\-._/]*$/.test(pathname);
}

/**
 * Política de URLs, conservadora por defecto.
 *
 * 1. Host de Ruta34 → se conserva **origen + ruta**, siempre que la ruta pase
 *    `isSafePath`. La query y el fragmento se tiran **siempre**, sin mirar qué
 *    llevan: son el sitio donde viajan los tokens.
 * 2. Cualquier otro host → se redacta la URL entera.
 * 3. Si no se puede parsear → se redacta entera.
 *
 * Devuelve `null` cuando la URL ya era segura tal cual, para no contabilizar
 * una redacción que no ha ocurrido.
 */
function rewriteUrl(core: string): { text: string; kind: RedactionKind } | null {
  const bareWww = core.toLowerCase().startsWith("www.");

  let parsed: URL;
  try {
    parsed = new URL(bareWww ? `https://${core}` : core);
  } catch {
    return { text: PLACEHOLDER.external_url, kind: "external_url" };
  }

  const host = parsed.hostname.toLowerCase();
  if (!RUTA34_HOSTS.has(host)) {
    return { text: PLACEHOLDER.external_url, kind: "external_url" };
  }

  // Credenciales embebidas (`https://usuario:clave@host`): el host es nuestro,
  // pero eso no las hace publicables. Se pierden al reconstruir desde `host`.
  const safe = isSafePath(parsed.pathname);

  // Una ruta descartada deja la barra: `https://esimruta34.com/` se lee como
  // "el sitio, sin la parte que no podíamos conservar". Solo se imita el
  // formato original —con barra o sin ella— cuando la ruta se conserva.
  let path = safe ? parsed.pathname : "/";
  if (safe && path === "/" && !core.endsWith("/")) path = "";

  const scheme = bareWww ? "" : `${parsed.protocol}//`;
  const clean = `${scheme}${host}${path}`;

  return clean === core ? null : { text: clean, kind: "url_parameters" };
}

/** Algoritmo de Luhn. Lo cumplen tarjetas de pago e IMEI; casi nada más. */
function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Reglas en orden. El orden importa: las más específicas primero, porque una
 * regla genérica de dígitos largos se comería un ICCID y perderíamos la
 * etiqueta correcta en la telemetría.
 */
interface Rule {
  kind: RedactionKind;
  pattern: RegExp;
  /** Candado opcional. Si devuelve false, la coincidencia se deja intacta. */
  guard?: (match: string) => boolean;
  /**
   * Reemplazo a medida, para reglas que no se resuelven con un placeholder
   * fijo. `null` deja la coincidencia intacta y no cuenta redacción.
   */
  replace?: (match: string) => { text: string; kind: RedactionKind } | null;
}

/** Puntuación que en prosa se pega al final de una URL sin formar parte de ella. */
const TRAILING_PUNCT = /[.,;:!?)\]}]+$/;

const RULES: Rule[] = [
  // LPA:1$smdp.example.com$MATCHING-ID — la cadena de activación completa.
  { kind: "activation_code", pattern: /LPA:\d\$[^\s,;]+/gi },

  // URLs. Van pronto, y antes que las reglas de email y de token, para que una
  // URL se trate como una unidad: si se dejara para el final, la regla de token
  // habría mordido ya un trozo de la query y quedaría un enlace mutilado en vez
  // de un enlace redactado.
  {
    kind: "external_url",
    pattern: /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi,
    replace: (match) => {
      const trailing = match.match(TRAILING_PUNCT)?.[0] ?? "";
      const core = trailing ? match.slice(0, -trailing.length) : match;
      const out = rewriteUrl(core);
      return out === null ? null : { text: out.text + trailing, kind: out.kind };
    },
  },

  // Rutas sueltas con query o fragmento: "/help/qr?token=...". Sin host, así
  // que la regla de arriba no las ve, pero el token viaja igual.
  {
    kind: "url_parameters",
    pattern: /(?<![\w:/])\/[A-Za-z0-9\-._/]*[?#][^\s<>"'`]*/g,
    replace: (match) => {
      const trailing = match.match(TRAILING_PUNCT)?.[0] ?? "";
      const core = trailing ? match.slice(0, -trailing.length) : match;
      const path = core.slice(0, core.search(/[?#]/));
      return {
        text: (isSafePath(path) ? path : PLACEHOLDER.url_parameters) + trailing,
        kind: "url_parameters",
      };
    },
  },

  { kind: "email", pattern: /\b[^\s@<>()[\]]+@[^\s@<>()[\]]+\.[a-z]{2,}\b/gi },

  // EID: 32 dígitos exactos. Ninguna magnitud de producto se le parece.
  { kind: "eid", pattern: /\b\d{32}\b/g },

  // ICCID: empieza por 89 (identificador de telecomunicaciones) y tiene 18–22
  // dígitos. Es el dato que más nos preocupa: identifica una SIM concreta.
  // Va antes que la regla de tarjeta porque un ICCID de 19 dígitos puede pasar
  // Luhn por casualidad, y preferimos la etiqueta correcta en la telemetría.
  { kind: "iccid", pattern: /\b89\d{16,20}\b/g },

  // IMEI: 15 dígitos exactos. También antes que la tarjeta — American Express
  // también tiene 15 y también pasa Luhn, pero en un soporte de eSIM lo que
  // llega mil veces más a menudo es un IMEI.
  { kind: "imei", pattern: /\b\d{15}\b/g },

  // Tarjeta: 13–19 dígitos, admite espacios o guiones, y SOLO si pasa Luhn.
  // El candado de Luhn es lo que impide que se lleve por delante cualquier
  // tirada larga de números legítima.
  {
    kind: "card",
    pattern: /\b\d(?:[ -]?\d){12,18}\b/g,
    guard: (m) => {
      const digits = m.replace(/\D/g, "");
      return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits);
    },
  },

  // Cualquier otra tirada de 16 o más dígitos. A partir de ahí no hay dato de
  // producto posible: el plan más grande son 430 GB y el precio más alto tiene
  // cuatro cifras contando decimales.
  { kind: "long_code", pattern: /\b\d{16,}\b/g },

  // Teléfonos: internacional con prefijo, o nueve dígitos seguidos empezando
  // por 6/7/8/9 (formato español). Nueve dígitos seguidos no son un plan.
  { kind: "phone", pattern: /(?:\+|\b00)\d[\d\s().-]{6,}\d/g },
  { kind: "phone", pattern: /\b[6789]\d{8}\b/g },

  // Tokens/credenciales: 28+ caracteres de alfabeto de código. El candado exige
  // que mezcle letras y dígitos, así que ninguna palabra ni frase lo activa.
  {
    kind: "token",
    pattern: /\b[A-Za-z0-9_-]{28,}\b/g,
    guard: (m) => /[A-Za-z]/.test(m) && /\d/.test(m),
  },
];

/**
 * Redacta PII y secretos de un texto de usuario.
 *
 * Se aplica a TODO mensaje de usuario antes de construir el contexto del
 * modelo, y al contexto que acompaña un handoff a soporte.
 */
export function sanitizeForModel(input: string): SanitizeResult {
  const redactions: Partial<Record<RedactionKind, number>> = {};
  let text = input;

  for (const rule of RULES) {
    text = text.replace(rule.pattern, (match) => {
      if (rule.guard && !rule.guard(match)) return match;

      if (rule.replace) {
        const out = rule.replace(match);
        if (out === null) return match;
        redactions[out.kind] = (redactions[out.kind] ?? 0) + 1;
        return out.text;
      }

      redactions[rule.kind] = (redactions[rule.kind] ?? 0) + 1;
      return PLACEHOLDER[rule.kind];
    });
  }

  return { text, redactions };
}

/** ¿Se redactó algo? Útil para que el asistente explique por qué no ve el dato. */
export function hasRedactions(result: SanitizeResult): boolean {
  return Object.keys(result.redactions).length > 0;
}
