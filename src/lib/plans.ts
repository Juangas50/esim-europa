import type { Plan } from "@/types";

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
    position: 1,
    data_gb: 5,
    eu_data_gb: 15,
    duration_days: 28,
    activation_days: 365,
    price_usd: 19.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "Número español 🇪🇸 incluido",
      "5 GB en España · 15 GB roaming UE",
      "Llamadas y SMS ilimitados",
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
    position: 2,
    data_gb: 10,
    eu_data_gb: 23,
    duration_days: 28,
    activation_days: 365,
    price_usd: 29.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "Número español 🇪🇸 incluido",
      "10 GB en España · 23 GB roaming UE",
      "Llamadas y SMS ilimitados",
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
    position: 3,
    data_gb: 20,
    eu_data_gb: 31,
    duration_days: 28,
    activation_days: 365,
    price_usd: 39.9,
    is_popular: true,
    zone: "espana",
    countries_count: 1,
    features: [
      "Número español 🇪🇸 incluido",
      "20 GB en España · 31 GB roaming UE",
      "Llamadas y SMS ilimitados",
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
    position: 4,
    data_gb: 30,
    eu_data_gb: 37,
    duration_days: 28,
    activation_days: 365,
    price_usd: 49.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "Número español 🇪🇸 incluido",
      "30 GB en España · 37 GB roaming UE",
      "Llamadas y SMS ilimitados",
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
    position: 5,
    data_gb: 50,
    eu_data_gb: 52,
    duration_days: 28,
    activation_days: 365,
    price_usd: 69.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "Número español 🇪🇸 incluido",
      "50 GB en España · 52 GB roaming UE",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
    ],
  },
];

// ── Data Traveler — solo datos, sin número ni llamadas, multi-país ─────────────

const DATAONLY_PLANS: Plan[] = [
  {
    id: "data-5gb",
    slug: "data-5gb",
    name: "Data 5 GB",
    type: "dataonly",
    data_gb: 5,
    duration_days: 28,
    activation_days: 60,
    price_usd: 19.9,
    zone: "europa",
    countries_count: 30,
    features: [
      "5 GB en 30+ países europeos",
      "Red 4G/5G",
      "Sin número ni llamadas — solo datos",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "data-10gb",
    slug: "data-10gb",
    name: "Data 10 GB",
    type: "dataonly",
    data_gb: 10,
    duration_days: 28,
    activation_days: 60,
    price_usd: 29.9,
    is_popular: true,
    zone: "europa",
    countries_count: 30,
    features: [
      "10 GB en 30+ países europeos",
      "Red 4G/5G",
      "Sin número ni llamadas — solo datos",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "data-20gb",
    slug: "data-20gb",
    name: "Data 20 GB",
    type: "dataonly",
    data_gb: 20,
    duration_days: 28,
    activation_days: 60,
    price_usd: 39.9,
    zone: "europa",
    countries_count: 30,
    features: [
      "20 GB en 30+ países europeos",
      "Red 4G/5G",
      "Sin número ni llamadas — solo datos",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "data-30gb",
    slug: "data-30gb",
    name: "Data 30 GB",
    type: "dataonly",
    data_gb: 30,
    duration_days: 28,
    activation_days: 60,
    price_usd: 49.9,
    zone: "europa",
    countries_count: 30,
    features: [
      "30 GB en 30+ países europeos",
      "Red 4G/5G",
      "Sin número ni llamadas — solo datos",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
];

// ── Export ────────────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [...LOCAL_PLANS, ...DATAONLY_PLANS];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug);
}
