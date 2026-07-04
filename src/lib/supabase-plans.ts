import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/plans";

export interface TariffPlan {
  id: string;
  name: string;
  price_usd: number;
  eu_data_gb?: number;
  data_gb?: number;
  slug: string;
  is_popular?: boolean;
}

export async function getTariffsFromSupabase(): Promise<TariffPlan[]> {
  const client = createClient();

  try {
    // Intentar traer de Supabase
    const { data, error } = await client
      .from("tariffs")
      .select("*");

    if (error) {
      console.warn("Error fetching tariffs from Supabase, using local fallback:", error);
      return getLocalPlans();
    }

    if (!data || data.length === 0) {
      console.warn("No tariffs found in Supabase, using local fallback");
      return getLocalPlans();
    }

    console.log("Tariffs from Supabase:", data[0]); // Debug: ver estructura

    return data.map((t: any) => ({
      id: t.id,
      name: t.name || t.tariff_name,
      price_usd: t.price_usd || t.price || t.precio,
      eu_data_gb: t.eu_data_gb || t.eu_gb || t.roaming_gb,
      data_gb: t.data_gb || t.gb,
      slug: t.slug || t.id,
      is_popular: t.is_popular || t.recommended,
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
    is_popular: p.is_popular,
  }));
}
