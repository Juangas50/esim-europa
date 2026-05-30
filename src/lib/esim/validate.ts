/**
 * eSIM activation string validation and QR generation helpers.
 *
 * Standard eSIM LPA URI format (GSMA SGP.22):
 *   LPA:1$SM-DP+_ADDRESS$ACTIVATION_CODE[$CONFIRMATION_CODE]
 *
 * Vodafone example:
 *   Cadena: 1$sm-v4-018-esagtm.pr.go-esim.com$549834DDB497BFEC54C2B89AFE84A611
 *   QR:     LPA:1$sm-v4-018-esagtm.pr.go-esim.com$549834DDB497BFEC54C2B89AFE84A611
 *   Código: 106129
 */

// ── Regex de validación ───────────────────────────────────────────────────────
// Parte 1: "1"  fijo (identificador LPA)
// Parte 2: hostname del SM-DP+ (letras, números, puntos, guiones)
// Parte 3: código de activación hex de 16-64 caracteres
export const ACTIVATION_STRING_RE =
  /^1\$([a-zA-Z0-9._-]+)\$([A-Fa-f0-9]{16,64})$/

// Código de confirmación: 4-8 dígitos numéricos (Vodafone usa 6)
export const CONFIRMATION_CODE_RE = /^\d{4,8}$/

export interface ParsedActivation {
  smdp: string           // SM-DP+ server (ej: sm-v4-018-esagtm.pr.go-esim.com)
  activationCode: string // hex code (ej: 549834DDB497BFEC54C2B89AFE84A611)
  lpaUri: string         // URI completo para generar el QR (LPA:1$...$...)
  raw: string            // cadena original sin "LPA:"
}

/**
 * Valida y parsea una cadena de activación eSIM.
 * El admin pega lo que ve en pantalla de Vodafone: "1$servidor$codigo"
 */
export function parseActivationString(
  raw: string,
): { ok: true; data: ParsedActivation } | { ok: false; error: string } {
  const trimmed = raw.trim()

  // Acepta también si el admin pega con el prefijo "LPA:" por error
  const normalized = trimmed.startsWith('LPA:') ? trimmed.slice(4) : trimmed

  const match = ACTIVATION_STRING_RE.exec(normalized)
  if (!match) {
    return {
      ok: false,
      error:
        'Formato no válido. Debe ser: 1$servidor$código — ej: 1$sm-v4-018.pr.go-esim.com$ABC123DEF456...',
    }
  }

  const [, smdp, activationCode] = match
  return {
    ok: true,
    data: {
      smdp,
      activationCode,
      lpaUri: `LPA:${normalized}`,
      raw: normalized,
    },
  }
}

export function validateConfirmationCode(code: string): boolean {
  return CONFIRMATION_CODE_RE.test(code.trim())
}
