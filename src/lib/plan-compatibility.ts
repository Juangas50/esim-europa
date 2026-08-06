// Compatibilidad de planes por país
// Maps country codes to compatible plan IDs

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
