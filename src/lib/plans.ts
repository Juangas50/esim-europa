import type { Plan } from "@/types";

// ⚠️ FALLBACK DE EMERGENCIA — NO es la fuente de verdad.
//
// La fuente de verdad del catálogo es la tabla `tariffs` en Supabase, leída por
// `plans-server.ts`. Este archivo solo se usa si esa lectura falla, y existe
// para que la web no se quede en blanco durante una caída.
//
// Sincronizado con producción el 2026-08-09. Si cambiás una tarifa en
// /admin/tarifas, actualizá también este archivo — si divergen, una caída de
// Supabase hace que la tienda muestre otro producto a otro precio.
//
// Nota sobre los GB: `data_gb` es la bolsa TOTAL del plan y `eu_data_gb` es el
// máximo de esa MISMA bolsa que puede gastarse fuera de España. No son bolsas
// que se sumen.

// ── SIM Local — línea española con número, llamadas, SMS y datos ──────────────
// Tamaños S / M / L / XL / XXL — mismo producto, distintos GB

const LOCAL_PLANS: Plan[] = [
  {
    id: "local-s",
    slug: "local-s",
    name: "Europa Básico",
    vodafone_code: "Vodafone S",
    type: "local",
    size: "S",
    data_gb: 90,
    eu_data_gb: 15,
    duration_days: 28,
    activation_days: 365,
    price_usd: 15.0,
    zone: "europa",
    countries_count: 30,
    features: [
      "90 GB de datos 4G/5G en total",
      "Hasta 15 GB de esos 90 GB fuera de España",
      "Número español incluido",
      "Llamadas y SMS ilimitados en España",
      "28 días de validez",
    ],
  },
  {
    id: "local-m",
    slug: "local-m",
    name: "Europa Plus",
    vodafone_code: "Vodafone M",
    type: "local",
    size: "M",
    data_gb: 270,
    eu_data_gb: 23,
    duration_days: 28,
    activation_days: 365,
    price_usd: 20.0,
    zone: "europa",
    countries_count: 30,
    features: [
      "270 GB de datos 4G/5G en total",
      "Hasta 23 GB de esos 270 GB fuera de España",
      "Número español incluido",
      "Llamadas y SMS ilimitados en España",
      "28 días de validez",
    ],
  },
  {
    id: "local-l",
    slug: "local-l",
    name: "Europa Total",
    vodafone_code: "Vodafone L",
    type: "local",
    size: "L",
    data_gb: 330,
    eu_data_gb: 30,
    duration_days: 28,
    activation_days: 365,
    price_usd: 30.0,
    zone: "europa",
    countries_count: 30,
    features: [
      "330 GB de datos 4G/5G en total",
      "Hasta 30 GB de esos 330 GB fuera de España",
      "Número español incluido",
      "Llamadas y SMS ilimitados en España",
      "28 días de validez",
    ],
  },
  {
    id: "local-xl",
    slug: "local-xl",
    name: "Europa Max",
    vodafone_code: "Vodafone XL",
    type: "local",
    size: "XL",
    data_gb: 380,
    eu_data_gb: 45,
    duration_days: 28,
    activation_days: 365,
    price_usd: 40.0,
    zone: "europa",
    countries_count: 30,
    features: [
      "380 GB de datos 4G/5G en total",
      "Hasta 45 GB de esos 380 GB fuera de España",
      "Número español incluido",
      "Llamadas y SMS ilimitados en España",
      "28 días de validez",
    ],
  },
  {
    id: "local-xxl",
    slug: "local-xxl",
    name: "Europa Premium",
    vodafone_code: "Vodafone XXL",
    type: "local",
    size: "XXL",
    data_gb: 430,
    eu_data_gb: 60,
    duration_days: 28,
    activation_days: 365,
    price_usd: 50.0,
    zone: "europa",
    countries_count: 30,
    features: [
      "430 GB de datos 4G/5G en total",
      "Hasta 60 GB de esos 430 GB fuera de España",
      "Número español incluido",
      "Llamadas y SMS ilimitados en España",
      "28 días de validez",
    ],
  },
];

// ── Export ────────────────────────────────────────────────────────────────────

// No hay planes `dataonly` en el catálogo de producción: las cinco tarifas
// activas son de tipo `prepago` (línea española con número, llamadas y SMS).
export const PLANS: Plan[] = [...LOCAL_PLANS];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug);
}
