import { Plan } from "@/types";

// Planes hardcoded para desarrollo — en producción se leen de tariffs (Supabase)
export const PLANS: Plan[] = [
  {
    id: "espana-prepago-10",
    slug: "espana-prepago",
    name: "España Prepago",
    type: "prepago",
    data_gb: 10,
    duration_days: 28,
    activation_days: 365,
    price_usd: 24.9,
    zone: "espana",
    countries_count: 1,
    features: [
      "10 GB en España — red 4G/5G",
      "Línea española 🇪🇸 — operador local",
      "28 días desde activación",
      "QR instantáneo por email",
      "Activá hasta 12 meses después",
    ],
  },
  {
    id: "europa-prepago-20",
    slug: "europa-prepago",
    name: "Europa Prepago",
    type: "prepago",
    data_gb: 20,
    duration_days: 28,
    activation_days: 365,
    price_usd: 39.9,
    is_popular: true,
    zone: "europa",
    countries_count: 30,
    features: [
      "20 GB en 30+ países europeos — red 4G/5G",
      "Línea española 🇪🇸 — operador local",
      "28 días desde activación",
      "QR instantáneo por email",
      "Activá hasta 12 meses después",
    ],
  },
  {
    id: "europa-dataonly-20",
    slug: "europa-dataonly",
    name: "Europa DataOnly",
    type: "dataonly",
    data_gb: 20,
    duration_days: 28,
    activation_days: 60,
    price_usd: 44.9,
    zone: "europa",
    countries_count: 30,
    features: [
      "20 GB en 30+ países europeos — red 4G/5G",
      "Línea española 🇪🇸 — operador local",
      "28 días desde activación",
      "QR instantáneo por email",
      "Activá cuando quieras (60 días)",
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug);
}
