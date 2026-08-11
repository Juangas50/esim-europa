import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/plans";
import { toPlanKey } from "@/lib/plan-key";

/** Las columnas que este cliente pide, y solo esas. */
interface TariffRow {
  id: string;
  name: string;
  price_usd: number | null;
  eu_data_gb: number | null;
  data_gb: number | null;
  highlight: boolean | null;
}

export interface TariffPlan {
  id: string;
  name: string;
  price_usd: number;
  eu_data_gb?: number;
  data_gb?: number;
  slug: string;
  /** Clave comercial estable (`europa-basico`). Ver `plan-key.ts`. */
  key: string;
  is_popular?: boolean;
}

export async function getTariffsFromSupabase(): Promise<TariffPlan[]> {
  const client = createClient();

  try {
    // Traer solo tarifas con web_visible = true, ordenadas por position
    const { data, error } = await client
      .from("tariffs")
      // Columnas explícitas: este cliente corre en el NAVEGADOR con la anon key.
      // Un select("*") arrastraría metadata interna de provisión (vodafone_code)
      // hasta el bundle del cliente.
      .select("id, name, price_usd, eu_data_gb, data_gb, highlight")
      .eq("web_visible", true)
      .order("position", { ascending: true });

    if (error) {
      console.warn("Error fetching tariffs from Supabase, using local fallback:", error);
      return getLocalPlans();
    }

    if (!data || data.length === 0) {
      console.warn("No tariffs found in Supabase, using local fallback");
      return getLocalPlans();
    }

    return (data as TariffRow[]).map((t) => ({
      id: t.id,
      name: t.name,
      price_usd: t.price_usd ?? 0,
      eu_data_gb: t.eu_data_gb ?? undefined,
      data_gb: t.data_gb ?? undefined,
      slug: t.id, // Usar ID como slug para URLs
      key: toPlanKey(t.name),
      is_popular: t.highlight || false,
    }));
  } catch (error) {
    console.warn("Error connecting to Supabase, using local fallback:", error);
    return getLocalPlans();
  }
}

function getLocalPlans(): TariffPlan[] {
  return PLANS.filter((p) => p.type === "local").map((p) => ({
    id: p.id,
    name: p.name,
    price_usd: p.price_usd,
    eu_data_gb: p.eu_data_gb,
    data_gb: p.data_gb,
    slug: p.slug,
    key: toPlanKey(p.name),
    is_popular: p.is_popular,
  }));
}
