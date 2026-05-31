/**
 * plans-server.ts — Server-side plan fetching from Supabase tariffs table.
 * Only import this from Server Components, Route Handlers, or Server Actions.
 * Client components should receive plans as props.
 *
 * Falls back to hardcoded PLANS if Supabase is not configured or returns empty.
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { Plan, PlanType, PlanSize } from "@/types";
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
  position: number | null;
  eu_data_gb: number | null;  // GB en roaming UE (solo planes local/España)
  web_visible: boolean | null; // false = oculto en la web B2C (ej. dataonly mientras no está habilitado)
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

const SIZE_TOKENS = new Set(["S", "M", "L", "XL", "XXL"]);

/**
 * Infiere el tamaño S/M/L/XL/XXL.
 * Prioridad: badge explícito → token en el nombre → derivar de GB.
 * El campo `position` NO afecta la talla — solo controla el orden de
 * izquierda a derecha (1 = más a la izquierda).
 */
function inferSize(name: string, badge: string | null, data_gb: number): PlanSize | undefined {
  // 1. Badge explícito (ej. "S", "M", "XL") — campo badge en Supabase
  if (badge) {
    const b = badge.trim().toUpperCase();
    if (SIZE_TOKENS.has(b)) return b as PlanSize;
  }
  // 2. Alguna palabra del nombre ES la talla (ej. "S", "SIM M", "Local XL")
  for (const token of name.trim().toUpperCase().split(/\s+/)) {
    if (SIZE_TOKENS.has(token)) return token as PlanSize;
  }
  // 3. Fallback por GB
  if (data_gb <= 5)  return "S";
  if (data_gb <= 10) return "M";
  if (data_gb <= 20) return "L";
  if (data_gb <= 35) return "XL";
  return "XXL";
}

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
    // Talla S/M/L/XL/XXL solo para planes locales (data-only no tiene talla)
    size: type === "local" ? inferSize(t.name, t.badge, t.data_gb) : undefined,
    position: t.position ?? undefined,
    data_gb: t.data_gb,
    eu_data_gb: t.eu_data_gb ?? undefined,
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
 * Returns active plans.
 * webOnly: true → filtra por web_visible=true (tienda B2C).
 * webOnly: false (default) → devuelve todos (portal B2B, admin).
 * Falls back to hardcoded PLANS when Supabase is unavailable.
 */
export async function getPlans(opts?: { webOnly?: boolean }): Promise<Plan[]> {
  const webOnly = opts?.webOnly ?? false;
  const fallback = webOnly ? PLANS.filter((p) => p.type !== "dataonly") : PLANS;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("tariffs")
      .select(
        "id, name, type, data_gb, eu_data_gb, validity_days, badge, highlight, active, price_usd, zone, countries_count, activation_days, position, web_visible"
      )
      .eq("active", true);

    if (webOnly) query = query.eq("web_visible", true);

    const { data, error } = await query.order("position", { ascending: true, nullsFirst: false });

    if (error) {
      console.warn("[plans] Supabase error, using fallback:", error.message);
      return fallback;
    }
    if (!data || data.length === 0) {
      console.warn("[plans] No active tariffs found, using fallback");
      return fallback;
    }

    return (data as TariffRow[]).map(mapTariffToPlan);
  } catch (err) {
    console.warn("[plans] Unexpected error, using fallback:", err);
    return fallback;
  }
}

/**
 * Returns a single plan by its ID.
 * webOnly: true → devuelve undefined si web_visible=false (bloquea checkout de planes ocultos).
 */
export async function getPlanById(id: string, opts?: { webOnly?: boolean }): Promise<Plan | undefined> {
  const webOnly = opts?.webOnly ?? false;

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("tariffs")
      .select(
        "id, name, type, data_gb, eu_data_gb, validity_days, badge, highlight, active, price_usd, zone, countries_count, activation_days, position, web_visible"
      )
      .eq("id", id);

    if (webOnly) query = query.eq("web_visible", true);

    const { data, error } = await query.single();

    if (error || !data) {
      const fallback = PLANS.find((p) => p.id === id);
      if (fallback && webOnly && fallback.type === "dataonly") return undefined;
      return fallback;
    }

    return mapTariffToPlan(data as TariffRow);
  } catch {
    const fallback = PLANS.find((p) => p.id === id);
    if (fallback && webOnly && fallback.type === "dataonly") return undefined;
    return fallback;
  }
}
