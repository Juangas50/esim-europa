import { createAdminClient } from "@/lib/supabase/server";
import ReprogramarView from "./ReprogramarView";

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReprogramarPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; token?: string }>;
}) {
  const { ref, token } = await searchParams;

  if (!ref || !token || !TOKEN_RE.test(token)) {
    return <ReprogramarView status="invalid" />;
  }

  const { data: order } = await createAdminClient()
    .from("b2c_orders")
    .select("order_ref, status, activation_date, created_at, tariffs(name)")
    .eq("order_ref", ref)
    .eq("reschedule_token", token)
    .maybeSingle();

  if (!order) {
    return <ReprogramarView status="invalid" />;
  }

  if (order.status !== "paid") {
    return <ReprogramarView status="already-delivered" />;
  }

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const maxDate = new Date(
    new Date(order.created_at).getTime() + 365 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return (
    <ReprogramarView
      status="form"
      orderRef={order.order_ref}
      token={token}
      planName={(order as { tariffs?: { name?: string } }).tariffs?.name ?? "tu eSIM"}
      currentDate={order.activation_date}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}
