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
  vodafone_code: string | null;  // Código Vodafone para activación (ej: "Vodafone S", "Vodafone M")
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
 * Talla S/M/L/XL/XXL del plan.
 *
 * Fuente única: `vodafone_code`, el código del operador — campo obligatorio en
 * /admin/tarifas, con valores del tipo "Vodafone S" … "Vodafone XXL". Como
 * respaldo se busca la talla como palabra suelta en el nombre comercial.
 *
 * Si no se puede determinar, devuelve `undefined` de forma deliberada.
 * Antes esta función adivinaba la talla por tramos de GB (`> 35 GB → XXL`), lo
 * que con el catálogo real (90–430 GB) etiquetaba las cinco tarifas como XXL y
 * hacía que todas llegaran a Stripe como "eSIM Plan XXL". Preferimos no saber
 * la talla a inventarla.
 *
 * Nunca leer `badge` aquí: en /admin/tarifas ese campo es el textarea de
 * "Características (una por línea)", no una talla.
 */
function inferSize(name: string, vodafone_code: string | null): PlanSize | undefined {
  for (const source of [vodafone_code, name]) {
    if (!source) continue;
    for (const token of source.trim().toUpperCase().split(/\s+/)) {
      if (SIZE_TOKENS.has(token)) return token as PlanSize;
    }
  }
  return undefined;
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
  eu_data_gb: number | null,
  validity_days: number | null,
  type: PlanType,
  activation_days: number
): string[] {
  const days = validity_days ?? 28;
  // `data_gb` es la bolsa TOTAL y `eu_data_gb` el máximo de esa MISMA bolsa que
  // puede gastarse fuera de España. No se suman.
  const euLimit = eu_data_gb
    ? [`Hasta ${eu_data_gb} GB de esos ${data_gb} GB fuera de España`]
    : [];

  if (type === "local") {
    return [
      `${data_gb} GB de datos 4G/5G en total`,
      ...euLimit,
      "Número español 🇪🇸 incluido",
      "Llamadas y SMS ilimitados en España",
      `${days} días de validez`,
    ];
  }

  // dataonly
  const activationLabel =
    activation_days >= 365
      ? "Activá hasta 12 meses después"
      : `Activá cuando quieras (${activation_days} días)`;
  return [
    `${data_gb} GB de datos en total`,
    ...euLimit,
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
    vodafone_code: t.vodafone_code ?? undefined,
    badge: t.badge ?? undefined,
    type,
    // Talla S/M/L/XL/XXL solo para planes locales (data-only no tiene talla)
    size: type === "local" ? inferSize(t.name, t.vodafone_code) : undefined,
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
      t.eu_data_gb,
      t.validity_days,
      type,
      activation_days
    ),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

const TARIFF_COLUMNS =
  "id, name, vodafone_code, type, data_gb, eu_data_gb, validity_days, badge, highlight, active, price_usd, zone, countries_count, activation_days, position, web_visible";

/** De dónde salieron los planes que se están devolviendo. */
export type PlansSource = "supabase" | "fallback";

export interface PlansResult {
  plans: Plan[];
  source: PlansSource;
}

/**
 * Igual que `getPlans`, pero informando de si los datos salieron de Supabase o
 * del fallback de emergencia. Úsalo cuando la superficie que consume los planes
 * necesite avisar (o comportarse distinto) en modo degradado.
 */
export async function getPlansWithSource(opts?: { webOnly?: boolean }): Promise<PlansResult> {
  const webOnly = opts?.webOnly ?? false;
  const fallbackPlans = webOnly ? PLANS.filter((p) => p.type !== "dataonly") : PLANS;
  const degraded = (reason: string): PlansResult => {
    // console.error, no warn: servir el fallback significa que la web está
    // mostrando un catálogo que puede estar desactualizado. Tiene que ser
    // visible en los logs, no pasar desapercibido.
    console.error(`[plans] CATÁLOGO DEGRADADO — sirviendo fallback local. Motivo: ${reason}`);
    return { plans: fallbackPlans, source: "fallback" };
  };

  try {
    const supabase = createAdminClient();
    let query = supabase.from("tariffs").select(TARIFF_COLUMNS).eq("active", true);

    if (webOnly) query = query.eq("web_visible", true);

    const { data, error } = await query.order("position", { ascending: true, nullsFirst: false });

    if (error) return degraded(`error de Supabase: ${error.message}`);
    if (!data || data.length === 0) return degraded("la consulta no devolvió tarifas activas");

    return { plans: (data as TariffRow[]).map(mapTariffToPlan), source: "supabase" };
  } catch (err) {
    return degraded(`excepción inesperada: ${String(err)}`);
  }
}

/**
 * Returns active plans.
 * webOnly: true → filtra por web_visible=true (tienda B2C).
 * webOnly: false (default) → devuelve todos (portal B2B, admin).
 * Falls back to hardcoded PLANS when Supabase is unavailable.
 */
export async function getPlans(opts?: { webOnly?: boolean }): Promise<Plan[]> {
  const { plans } = await getPlansWithSource(opts);
  return plans;
}

/**
 * Returns a single plan by its ID.
 *
 * webOnly: true → superficie de venta (tienda y checkout). Aquí el fallback
 * está deliberadamente desactivado: si no podemos confirmar el plan contra el
 * catálogo vivo, devolvemos `undefined` y el checkout responde "Plan no
 * disponible" en vez de cobrar con un precio potencialmente obsoleto. Vender a
 * ciegas es peor que no vender.
 *
 * webOnly: false → superficies posteriores a la compra (webhook de Stripe,
 * página de confirmación). Ahí sí se usa el fallback: el cobro ya ocurrió y
 * solo necesitamos nombre y GB para el email; quedarse sin plan rompería la
 * entrega del pedido.
 */
export async function getPlanById(id: string, opts?: { webOnly?: boolean }): Promise<Plan | undefined> {
  const webOnly = opts?.webOnly ?? false;

  const fallback = (reason: string): Plan | undefined => {
    if (webOnly) {
      console.error(
        `[plans] Plan ${id} no confirmado contra el catálogo vivo (${reason}). ` +
          `Se bloquea la venta en vez de usar el fallback.`
      );
      return undefined;
    }
    console.error(`[plans] CATÁLOGO DEGRADADO para el plan ${id} (${reason}) — usando fallback local.`);
    return PLANS.find((p) => p.id === id);
  };

  try {
    const supabase = createAdminClient();
    let query = supabase.from("tariffs").select(TARIFF_COLUMNS).eq("id", id);

    if (webOnly) query = query.eq("web_visible", true);

    const { data, error } = await query.single();

    if (error || !data) return fallback(error?.message ?? "sin resultados");

    return mapTariffToPlan(data as TariffRow);
  } catch (err) {
    return fallback(`excepción inesperada: ${String(err)}`);
  }
}
