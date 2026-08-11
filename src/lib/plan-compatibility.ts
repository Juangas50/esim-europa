// Compatibilidad de planes por país
// Maps country codes to compatible plan IDs
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ NO USAR COMO FUENTE DE COBERTURA. NO CONSUMIR DESDE EL ASISTENTE.
//
// El nombre engaña. Esta tabla NO dice en qué países funciona una eSIM: dice
// qué planes se le ofrecen a un comprador según DESDE DÓNDE compra. Es una regla
// comercial de la tienda, no un mapa de red.
//
// Tres motivos concretos para no apoyarse en ella:
//
//  1. Mide el país del comprador, no la cobertura del servicio.
//  2. Solo cubre cuatro de los cinco planes vivos: falta el quinto en todas las
//     listas, incluida la de DEFAULT.
//  3. Los comentarios arrastran naming interno («local-m», «M, L, XL, XXL») que
//     ya no forma parte del DTO público. Ver la regla de negocio en
//     `plans-server.ts`.
//
// La cobertura por país vive en `src/lib/coverage.ts`, que es la fuente única
// que consumen el buscador de la portada, el modal de países y la herramienta
// `check_coverage` del asistente. Ninguna otra fuente —esta incluida— está
// autorizada a afirmar que un destino está cubierto.
//
// Este comentario no cambia el comportamiento de nada: la lógica de abajo queda
// exactamente como estaba.
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_COMPATIBILITY_BY_COUNTRY: Record<string, string[]> = {
  // USA: Solo planes M, L, XL, XXL (NO Básico/S)
  "US": [
    "30c52a68-639a-442b-8eb4-aa19c55b2d92",  // local-m (Europa Plus)
    "45412b84-a570-4112-ad28-fb2225f01dc5",  // local-l (Europa Total)
    "61439ac8-772c-4342-8acc-b231e62684fc",  // local-xl (Europa Max)
  ],

  // Canada, Mexico, Central America
  "CA": [
    "30c52a68-639a-442b-8eb4-aa19c55b2d92",
    "45412b84-a570-4112-ad28-fb2225f01dc5",
    "61439ac8-772c-4342-8acc-b231e62684fc",
  ],
  "MX": [
    "30c52a68-639a-442b-8eb4-aa19c55b2d92",
    "45412b84-a570-4112-ad28-fb2225f01dc5",
    "61439ac8-772c-4342-8acc-b231e62684fc",
  ],

  // Default: All local plans available everywhere else
  "DEFAULT": [
    "2bf430af-8a08-4425-a188-7bf8df18cfd8",  // local-s (Europa Básico)
    "30c52a68-639a-442b-8eb4-aa19c55b2d92",  // local-m (Europa Plus)
    "45412b84-a570-4112-ad28-fb2225f01dc5",  // local-l (Europa Total)
    "61439ac8-772c-4342-8acc-b231e62684fc",  // local-xl (Europa Max)
  ],
};

export function getCompatiblePlanIds(countryCode?: string): string[] {
  if (!countryCode) return PLAN_COMPATIBILITY_BY_COUNTRY["DEFAULT"];
  return PLAN_COMPATIBILITY_BY_COUNTRY[countryCode.toUpperCase()] || PLAN_COMPATIBILITY_BY_COUNTRY["DEFAULT"];
}

export function isPlanCompatibleWithCountry(planId: string, countryCode?: string): boolean {
  if (!countryCode) return true;
  const compatible = getCompatiblePlanIds(countryCode);
  return compatible.includes(planId);
}
