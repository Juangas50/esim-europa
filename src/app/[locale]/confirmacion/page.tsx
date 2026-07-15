import { getPlanById } from "@/lib/plans-server";
import { createAdminClient } from "@/lib/supabase/server";
import ConfirmacionView from "./ConfirmacionView";

export const dynamic = "force-dynamic";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; plan?: string; qty?: string; mid?: string }>;
}) {
  const { ref, plan: planId, qty, mid } = await searchParams;
  const orderRef = ref ?? "—";
  const quantity = parseInt(qty ?? "1", 10) || 1;

  const [plan, order] = await Promise.all([
    planId ? getPlanById(planId) : Promise.resolve(undefined),
    ref
      ? createAdminClient()
          .from("b2c_orders")
          .select("activation_date")
          .eq("order_ref", ref)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);

  return (
    <ConfirmacionView
      orderRef={orderRef}
      planId={planId ?? ""}
      quantity={quantity}
      planName={plan?.name ?? "Tu eSIM"}
      priceUsd={plan?.price_usd ?? 0}
      coverage={plan?.countries_count ?? null}
      dataGb={plan?.data_gb ?? null}
      validityDays={plan?.duration_days ?? null}
      activationDate={order?.activation_date ?? null}
      metaEventId={mid ?? null}
    />
  );
}
