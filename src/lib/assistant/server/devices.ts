/**
 * devices.ts — Compatibilidad de dispositivos, resuelta de forma determinista.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LA REGLA QUE GOBIERNA ESTE MÓDULO
 *
 * Solo hay dos respuestas posibles: `supported` y `unknown`.
 *
 * `not_supported` **no existe** en el tipo de salida, y eso es deliberado. La
 * lista de `esim-devices.json` es una lista de modelos verificados, no un censo
 * del mercado: hay móviles compatibles con eSIM que no están en ella. Decirle a
 * alguien "tu móvil no sirve" porque no aparece en nuestro JSON es perder una
 * venta con una afirmación que no podemos sostener.
 *
 * Cuando no lo sabemos, decimos que no lo sabemos y explicamos cómo comprobarlo
 * en treinta segundos: marcar *#06# y mirar si aparece el EID. Esa instrucción
 * ya vive en el propio JSON (`verificationInfo`), así que no la duplicamos aquí.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import devicesData from "@/data/esim-devices.json";

// ── Tipos de salida ───────────────────────────────────────────────────────────

export interface DeviceVerificationInfo {
  method: string;
  indicator: string;
}

export type DeviceLookupResult =
  | {
      status: "supported";
      /** `exact`: coincidieron todos los tokens del modelo. `family`: la consulta
       *  identifica una familia cuyos miembros listados son todos compatibles. */
      matchType: "exact" | "family";
      brand: string;
      /** Modelos concretos de la lista que coinciden. Máximo 3. */
      matchedModels: string[];
      notes: string[];
    }
  | {
      status: "unknown";
      /** Marca reconocida aunque el modelo no, para poder decir algo útil. */
      brandRecognized: string | null;
      howToVerify: DeviceVerificationInfo;
      notes: string[];
    };

// ── Normalización ─────────────────────────────────────────────────────────────

/**
 * Tokens que aparecen en los nombres del catálogo pero que nadie escribe (o que
 * escribe la mitad de la gente). Se ignoran a ambos lados de la comparación.
 */
const OPTIONAL_TOKENS = new Set(["5g", "4g", "lte", "generacion", "gen", "ee", "fe"]);

/**
 * Ruido conversacional. La tool puede recibir "tengo un iphone 15, sirve?"
 * porque el modelo no siempre extrae limpio, así que limpiamos nosotros.
 */
const FILLER_TOKENS = new Set([
  "hola", "tengo", "tiene", "un", "una", "unos", "unas", "el", "la", "los", "las",
  "mi", "mis", "su", "es", "eres", "sirve", "sirven", "servira", "funciona",
  "funcionara", "funcionan", "compatible", "compatibles", "con", "para", "que",
  "tal", "y", "o", "de", "del", "movil", "moviles", "telefono", "celular",
  "smartphone", "equipo", "dispositivo", "este", "esta", "ese", "esa", "mio",
  "mia", "puedo", "puede", "usar", "usarlo", "instalar", "esim", "porfa", "porfavor",
]);

/** Palabras que solo nombran una familia. No bastan por sí solas. */
const FAMILY_ONLY_TOKENS = new Set([
  "iphone", "ipad", "galaxy", "pixel", "redmi", "poco", "moto", "razr", "edge",
  "nord", "reno", "mate", "nova", "xperia", "magic", "phone",
]);

function normalize(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    // "iphone15" → "iphone 15". Solo tras una racha de 3+ letras, para no partir
    // designaciones como "s24" o "a55", que sí se escriben pegadas.
    .replace(/([a-z]{3,})(\d)/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(raw: string, dropFiller: boolean): string[] {
  return normalize(raw)
    .split(" ")
    .filter((t) => t.length > 0)
    .filter((t) => !OPTIONAL_TOKENS.has(t))
    .filter((t) => !(dropFiller && FILLER_TOKENS.has(t)));
}

// ── Índice ────────────────────────────────────────────────────────────────────

interface IndexedModel {
  brand: string;
  displayName: string;
  tokens: string[];
}

interface Manufacturer {
  name: string;
  models: string[];
  compatible: boolean;
}

interface DevicesFile {
  manufacturers: Manufacturer[];
  verificationInfo: { method: string; indicator: string; dualSim: string; specialCases: string };
}

const data = devicesData as DevicesFile;

const INDEX: IndexedModel[] = data.manufacturers.flatMap((m) =>
  m.models.map((model) => ({
    brand: m.name,
    displayName: model,
    tokens: tokenize(model, false),
  }))
);

/** Marca → tokens con los que la gente la nombra. */
const BRAND_TOKENS = new Map<string, string[]>(
  data.manufacturers.map((m) => [m.name, tokenize(m.name, false)])
);

/** Familias que identifican marca aunque no aparezca el fabricante. */
const FAMILY_TO_BRAND: Record<string, string> = {
  iphone: "Apple",
  ipad: "Apple",
  galaxy: "Samsung",
  pixel: "Google",
  redmi: "Xiaomi",
  poco: "Xiaomi",
  moto: "Motorola",
  razr: "Motorola",
  reno: "Oppo",
  mate: "Huawei",
  nova: "Huawei",
  xperia: "Sony",
  magic: "Honor",
};

export const VERIFICATION_INFO: DeviceVerificationInfo = {
  method: data.verificationInfo.method,
  indicator: data.verificationInfo.indicator,
};

// ── Búsqueda ──────────────────────────────────────────────────────────────────

function detectBrand(queryTokens: string[]): string | null {
  const set = new Set(queryTokens);
  for (const [brand, tokens] of BRAND_TOKENS) {
    if (tokens.some((t) => set.has(t))) return brand;
  }
  for (const token of queryTokens) {
    const brand = FAMILY_TO_BRAND[token];
    if (brand) return brand;
  }
  return null;
}

function notesFor(models: IndexedModel[]): string[] {
  const notes: string[] = [data.verificationInfo.dualSim];
  const mentionsIphone16 = models.some((m) => /^iPhone 16( Pro)?$/.test(m.displayName));
  if (mentionsIphone16) notes.push(data.verificationInfo.specialCases);
  return notes;
}

/**
 * Resuelve una consulta de dispositivo.
 *
 * Tres pasadas, de más estricta a menos:
 *
 * 1. **Exacta** — todos los tokens significativos de un modelo aparecen en la
 *    consulta. "iphone 15" no cuela como "iPhone 15 Pro", porque "pro" falta.
 *    Si hay varias, gana la más específica (más tokens), que es la que el
 *    usuario realmente escribió.
 * 2. **Familia** — la consulta es el principio del nombre de uno o más modelos
 *    ("iphone se" → las tres generaciones listadas). Como todos los modelos del
 *    JSON son compatibles, si la familia entera está listada, la respuesta es
 *    supported. Exige al menos un token que no sea el nombre de la familia: un
 *    "tengo un iPhone" a secas no se puede responder, y de hecho sería falso
 *    (hay iPhones antiguos sin eSIM).
 * 3. **Marca** — no identificamos el modelo, pero sí el fabricante. Devuelve
 *    unknown con el método de verificación.
 */
export function lookupDevice(query: string): DeviceLookupResult {
  const queryTokens = tokenize(query, true);
  const querySet = new Set(queryTokens);
  const brand = detectBrand(queryTokens);

  const unknown = (notes: string[] = []): DeviceLookupResult => ({
    status: "unknown",
    brandRecognized: brand,
    howToVerify: VERIFICATION_INFO,
    notes,
  });

  if (queryTokens.length === 0) return unknown();

  // 1. Coincidencia exacta.
  let best: IndexedModel[] = [];
  let bestScore = 0;
  for (const model of INDEX) {
    if (model.tokens.length === 0) continue;
    if (!model.tokens.every((t) => querySet.has(t))) continue;
    if (model.tokens.length > bestScore) {
      bestScore = model.tokens.length;
      best = [model];
    } else if (model.tokens.length === bestScore) {
      best.push(model);
    }
  }

  if (best.length > 0) {
    return {
      status: "supported",
      matchType: "exact",
      brand: best[0].brand,
      matchedModels: best.slice(0, 3).map((m) => m.displayName),
      notes: notesFor(best),
    };
  }

  // 2. Coincidencia de familia.
  const distinguishing = queryTokens.filter((t) => !FAMILY_ONLY_TOKENS.has(t));
  if (queryTokens.length >= 2 && distinguishing.length > 0) {
    const family = INDEX.filter(
      (model) =>
        model.tokens.length > queryTokens.length &&
        queryTokens.every((t, i) => model.tokens[i] === t)
    );
    if (family.length > 0) {
      return {
        status: "supported",
        matchType: "family",
        brand: family[0].brand,
        matchedModels: family.slice(0, 3).map((m) => m.displayName),
        notes: notesFor(family),
      };
    }
  }

  // 3. Solo marca, o nada.
  return unknown();
}
