import ReprogramarView from "./ReprogramarView";
import { resolveAuthorizedGroup, parsePairsParam, isValidLegacyPair, type ReprogramarPair } from "./resolve";
import { labelWithinGroup } from "@/lib/esim/order";

export const dynamic = "force-dynamic";

export default async function ReprogramarPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; token?: string; rows?: string }>;
}) {
  const { ref, token, rows: rowsParam } = await searchParams;

  // rows= (multi, Alternativa A) tiene prioridad si está presente; si no,
  // cae al formato legacy ?ref=&token= — que sigue funcionando indefinidamente.
  const pairs: ReprogramarPair[] | null = rowsParam
    ? parsePairsParam(rowsParam)
    : isValidLegacyPair(ref, token)
      ? [isValidLegacyPair(ref, token)!]
      : null;

  if (!pairs) {
    return <ReprogramarView status="invalid" />;
  }

  const result = await resolveAuthorizedGroup(pairs);
  if (!result.ok) {
    return <ReprogramarView status="invalid" />;
  }

  const { rows } = result;
  const editableCount = rows.filter((r) => r.status === "paid").length;
  if (editableCount === 0) {
    return <ReprogramarView status="already-delivered" />;
  }

  const primary = rows[0];
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const maxDate = new Date(new Date(primary.created_at).getTime() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <ReprogramarView
      status="form"
      planName={primary.tariff_name ?? "tu eSIM"}
      minDate={minDate}
      maxDate={maxDate}
      pairs={pairs}
      rows={rows.map((r) => ({
        orderRef: r.order_ref,
        label: labelWithinGroup(r.order_ref, rows),
        editable: r.status === "paid",
        currentDate: r.activation_date,
      }))}
    />
  );
}
