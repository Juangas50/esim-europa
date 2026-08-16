/**
 * plans-server.ts — Lectura del catálogo desde la tabla `tariffs` de Supabase.
 * Importar solo desde Server Components, Route Handlers o Server Actions.
 * Los componentes cliente reciben los planes como props.
 *
 * Si Supabase no está disponible se usa el fallback de `plans.ts`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGLA DE NEGOCIO: separación identidad comercial ↔ provisión interna
 *
 * La provisión mayorista se contrata con Vodafone España, pero Ruta34 NO
 * comercializa bajo naming Vodafone. Los únicos nombres públicos del producto
 * son los de Ruta34: Europa Básico / Plus / Total / Max / Premium.
 *
 * · `vodafone_code` y cualquier talla del operador son METADATA TÉCNICA INTERNA.
 * · Viven en `TariffRow` (privado de este módulo) y en `ProvisioningRef`.
 * · NO forman parte del DTO público `Plan`, porque `Plan` se serializa en el
 *   payload RSC y es legible desde el navegador.
 * · Nunca deben alimentar naming comercial, UI, checkout visible, descripciones
 *   de Stripe, emails, SEO/JSON-LD, analytics de cliente ni el futuro chatbot.
 *
 * La asociación producto Ruta34 ↔ referencia de provisión se resuelve solo en
 * servidor y por `tariff.id` — ver `getProvisioningRef()` al final del archivo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { Plan, PlanType } from "@/types";
import { PLANS } from "@/lib/plans";
import { toPlanKey } from "@/lib/plan-key";

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
  activation_days: number | null;
  position: number | null;
  eu_data_gb: number | null;  // GB en roaming UE (solo planes local/España)
  web_visible: boolean | null; // false = oculto en la web B2C (ej. dataonly mientras no está habilitado)
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
    slug: toPlanKey(t.name),
    name: t.name,
    badge: t.badge ?? undefined,
    type,
    position: t.position ?? undefined,
    data_gb: t.data_gb,
    eu_data_gb: t.eu_data_gb ?? undefined,
    duration_days: t.validity_days ?? 28,
    activation_days,
    price_usd: t.price_usd ?? 0,
    is_popular: t.highlight ?? false,
    zone,
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
  "id, name, type, data_gb, eu_data_gb, validity_days, badge, highlight, active, price_usd, zone, activation_days, position, web_visible";

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

// ── Provisión interna (server-only) ───────────────────────────────────────────

/**
 * Referencia técnica de provisión de una tarifa.
 *
 * ⚠️ NUNCA pasar esto como prop a un componente cliente ni incluirlo en una
 * respuesta pública: es metadata del mayorista, no identidad de producto.
 * El nombre comercial que ve el cliente sale siempre de `Plan.name`.
 */
export interface ProvisioningRef {
  /** `tariffs.id` — la única clave con la que se cruza producto ↔ provisión. */
  tariffId: string;
  /** Código de tarifa del mayorista. Uso exclusivamente interno. */
  provisioningCode: string | null;
}

/**
 * Resuelve la referencia de provisión de una tarifa por su `id`.
 *
 * Pensado para flujos internos de aprovisionamiento y soporte (panel de admin,
 * preparación de la entrega). Lanza si se invoca desde el navegador: es la
 * barrera que impide que esta metadata acabe en una superficie pública aunque
 * alguien importe este módulo por error desde un componente cliente.
 */
export async function getProvisioningRef(tariffId: string): Promise<ProvisioningRef | null> {
  if (typeof window !== "undefined") {
    throw new Error(
      "getProvisioningRef() es server-only: la referencia de provisión no puede salir al cliente."
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tariffs")
      .select("id, vodafone_code")
      .eq("id", tariffId)
      .single();

    if (error || !data) {
      console.error(`[provisioning] No se pudo resolver la tarifa ${tariffId}: ${error?.message ?? "sin resultados"}`);
      return null;
    }

    return {
      tariffId: data.id as string,
      provisioningCode: (data.vodafone_code as string | null) ?? null,
    };
  } catch (err) {
    console.error(`[provisioning] Excepción resolviendo la tarifa ${tariffId}: ${String(err)}`);
    return null;
  }
}
