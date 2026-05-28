/**
 * plans-server.ts — Server-side plan fetching from Supabase tariffs table.
 * Only import this from Server Components, Route Handlers, or Server Actions.
 * Client components should receive plans as props.
 *
 * Falls back to hardcoded PLANS if Supabase is not configured or returns empty.
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { Plan, PlanType } from "@/types";
import { PLANS } from "@/lib/plans";

// ── Supabase row shape ────────────────────────────────────────────────────────

interface TariffRow {
  id: string;
  name: string;
  type: string;            // esim_type enum from B2B portal
  data_gb: number;
  validity_days: number | null;
  badge: string | null;
  highlight: boolean | null;
  active: boolean | null;
  price_usd: number | null;
  zone: string | null;
  countries_count: number | null;
  activation_days: number | null;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapType(raw: string): PlanType {
  const t = raw.toLowerCase();
  if (t.includes("data") || t === "data_only" || t === "dataonly") return "dataonly";
  // "prepago", "local", "voz", "sim_local", etc. → local
  return "local";
}

function inferZone(name: string): "espana" | "europa" {
  const n = name.toLowerCase();
  if (n.includes("espa") || n.includes("spain")) return "espana";
  return "europa";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function generateFeatures(
  data_gb: number,
  validity_days: number | null,
  type: PlanType,
  zone: "espana" | "europa",
  activation_days: number
): string[] {
  const days = validity_days ?? 28;

  if (type === "local") {
    return [
      `${data_gb} GB datos 4G/5G`,
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados",
      `${days} días de validez`,
      "QR instantáneo por email",
    ];
  }

  // dataonly
  const coverage = zone === "espana" ? "España" : "30+ países europeos";
  const activationLabel =
    activation_days >= 365
      ? "Activá hasta 12 meses después"
      : `Activá cuando quieras (${activation_days} días)`;
  return [
    `${data_gb} GB en ${coverage}`,
    "Red 4G/5G",
    "Sin número ni llamadas — solo datos",
    `${days} días de validez`,
    activationLabel,
  ];
}

function mapTariffToPlan(t: TariffRow): Plan {
  const type = mapType(t.type);
  const zone = (t.zone as "espana" | "europa" | null) ?? inferZone(t.name);
  const activation_days =
    t.activation_days ?? (type === "local" ? 365 : 60);

  return {
    id: t.id,
    slug: slugify(t.name),
    name: t.name,
    type,
    data_gb: t.data_gb,
    duration_days: t.validity_days ?? 28,
    activation_days,
    price_usd: t.price_usd ?? 0,
    is_popular: t.highlight ?? false,
    zone,
    countries_count:
      t.countries_count ?? (zone === "espana" ? 1 : 30),
    features: generateFeatures(
      t.data_gb,
      t.validity_days,
      type,
      zone,
      activation_days
    ),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns all active plans sorted by price ascending.
 * Falls back to hardcoded PLANS when Supabase is unavailable or empty.
 */
export async function getPlans(): Promise<Plan[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tariffs")
      .select(
        "id, name, type, data_gb, validity_days, badge, highlight, active, price_usd, zone, countries_count, activation_days"
      )
      .eq("active", true)
      .order("price_usd", { ascending: true });

    if (error) {
      console.warn("[plans] Supabase error, using fallback:", error.message);
      return PLANS;
    }

    if (!data || data.length === 0) {
      console.warn("[plans] No active tariffs found, using fallback");
      return PLANS;
    }

    return (data as TariffRow[]).map(mapTariffToPlan);
  } catch (err) {
    console.warn("[plans] Unexpected error, using fallback:", err);
    return PLANS;
  }
}

/**
 * Returns a single plan by its ID (UUID from tariffs, or legacy string ID).
 * Tries Supabase first, falls back to hardcoded PLANS.
 */
export async function getPlanById(id: string): Promise<Plan | undefined> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tariffs")
      .select(
        "id, name, type, data_gb, validity_days, badge, highlight, active, price_usd, zone, countries_count, activation_days"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      // Fall back to hardcoded plans (legacy string IDs)
      return PLANS.find((p) => p.id === id);
    }

    return mapTariffToPlan(data as TariffRow);
  } catch {
    return PLANS.find((p) => p.id === id);
  }
}
