import type { Plan } from "@/types";

// ── SIM Local — línea española con número, llamadas, SMS y datos ──────────────
// Tamaños S / M / L / XL / XXL — mismo producto, distintos GB

const LOCAL_PLANS: Plan[] = [
  {
    id: "local-s",
    slug: "local-s",
    name: "SIM Local S",
    type: "local",
    size: "S",
    data_gb: 5,
    duration_days: 28,
    activation_days: 365,
    price_usd: 19.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "5 GB datos 4G/5G",
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "local-m",
    slug: "local-m",
    name: "SIM Local M",
    type: "local",
    size: "M",
    data_gb: 10,
    duration_days: 28,
    activation_days: 365,
    price_usd: 29.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "10 GB datos 4G/5G",
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "local-l",
    slug: "local-l",
    name: "SIM Local L",
    type: "local",
    size: "L",
    data_gb: 20,
    duration_days: 28,
    activation_days: 365,
    price_usd: 39.9,
    is_popular: true,
    zone: "espana",
    countries_count: 1,
    features: [
      "20 GB datos 4G/5G",
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "local-xl",
    slug: "local-xl",
    name: "SIM Local XL",
    type: "local",
    size: "XL",
    data_gb: 30,
    duration_days: 28,
    activation_days: 365,
    price_usd: 49.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "30 GB datos 4G/5G",
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
      "QR instantáneo por email",
    ],
  },
  {
    id: "local-xxl",
    slug: "local-xxl",
    name: "SIM Local XXL",
    type: "local",
    size: "XXL",
    data_gb: 50,
    duration_days: 28,
    activation_days: 365,
    price_usd: 69.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "50 GB datos 4G/5G",
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      "28 días de validez",
      "QR instantáneo por email",
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
