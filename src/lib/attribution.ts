import { NextRequest } from "next/server";

// ── Atribución de campañas (ej. colaboración con Victoria Casteluchi) ───────
// La cookie `ruta34_attribution` la fija /app/vicky/route.ts (httpOnly: nunca
// visible en la URL ni legible por JS del cliente) y viaja automáticamente en
// el fetch same-origin a /api/checkout, donde se lee para dejarla persistida
// en el pedido y en los metadata de Stripe hasta el webhook de compra.

export const ATTRIBUTION_COOKIE = "ruta34_attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const MAX_LEN = 100;

/** Nunca lanza — cookie ausente o corrupta simplemente no atribuye nada. */
export function readAttribution(req: NextRequest): Attribution {
  const raw = req.cookies.get(ATTRIBUTION_COOKIE)?.value;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const attribution: Attribution = {};
    for (const field of FIELDS) {
      const value = parsed[field];
      if (typeof value === "string" && value.length > 0 && value.length <= MAX_LEN) {
        attribution[field] = value;
      }
    }
    return attribution;
  } catch {
    return {};
  }
}
