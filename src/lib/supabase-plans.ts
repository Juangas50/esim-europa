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
    // Traer solo tarifas con web_visible = true, ordenadas por position
    const { data, error } = await client
      .from("tariffs")
      .select("*")
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

    console.log("Tariffs from Supabase:", data[0]);

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      price_usd: t.price_usd,
      eu_data_gb: t.eu_data_gb,
      data_gb: t.data_gb,
      slug: t.id, // Usar ID como slug para URLs
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
    is_popular: p.is_popular,
  }));
}
