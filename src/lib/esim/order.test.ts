import { describe, it, expect } from "vitest";
import { canonicalSort, labelWithinGroup, groupByPaymentAndActivationDate } from "./order";

function row(
  id: string,
  created_at: string,
  order_ref: string,
  extra: { payment_id?: string; activation_date?: string } = {}
) {
  return { id, created_at, order_ref, payment_id: extra.payment_id ?? null, activation_date: extra.activation_date ?? null };
}

describe("canonicalSort", () => {
  it("orders by created_at ASC", () => {
    const rows = [
      row("b", "2026-09-01T00:00:02Z", "ref-b"),
      row("a", "2026-09-01T00:00:01Z", "ref-a"),
      row("c", "2026-09-01T00:00:03Z", "ref-c"),
    ];
    expect(canonicalSort(rows).map((r) => r.order_ref)).toEqual(["ref-a", "ref-b", "ref-c"]);
  });

  it("breaks ties with id ASC when created_at is identical", () => {
    const rows = [
      row("zzz", "2026-09-01T00:00:00Z", "ref-z"),
      row("aaa", "2026-09-01T00:00:00Z", "ref-a"),
    ];
    expect(canonicalSort(rows).map((r) => r.order_ref)).toEqual(["ref-a", "ref-z"]);
  });

  it("does not mutate the input array", () => {
    const rows = [row("b", "2026-09-01T00:00:02Z", "ref-b"), row("a", "2026-09-01T00:00:01Z", "ref-a")];
    const original = [...rows];
    canonicalSort(rows);
    expect(rows).toEqual(original);
  });

  it("is independent of the incoming array order (never trusts insert/selection order)", () => {
    const rows = [
      row("c", "2026-09-01T00:00:03Z", "ref-c"),
      row("a", "2026-09-01T00:00:01Z", "ref-a"),
      row("b", "2026-09-01T00:00:02Z", "ref-b"),
    ];
    const shuffled = [rows[2], rows[0], rows[1]];
    expect(canonicalSort(rows).map((r) => r.id)).toEqual(canonicalSort(shuffled).map((r) => r.id));
  });
});

describe("labelWithinGroup", () => {
  it("numbers a full group 1..N", () => {
    const group = canonicalSort([
      row("a", "2026-09-01T00:00:01Z", "ref-a"),
      row("b", "2026-09-01T00:00:02Z", "ref-b"),
      row("c", "2026-09-01T00:00:03Z", "ref-c"),
    ]);
    expect(labelWithinGroup("ref-a", group)).toBe("eSIM 1 de 3");
    expect(labelWithinGroup("ref-b", group)).toBe("eSIM 2 de 3");
    expect(labelWithinGroup("ref-c", group)).toBe("eSIM 3 de 3");
  });

  it("keeps the original position for a partial selection (never renumbers against the subset)", () => {
    // Grupo original: 1, 2, 3. Selección: 1 y 3. Debe mostrar "eSIM 1 de 3"
    // y "eSIM 3 de 3" — nunca "1 de 2"/"2 de 2" (FASE 4B §4, ejemplo aprobado).
    const fullGroup = canonicalSort([
      row("a", "2026-09-01T00:00:01Z", "ref-a"),
      row("b", "2026-09-01T00:00:02Z", "ref-b"),
      row("c", "2026-09-01T00:00:03Z", "ref-c"),
    ]);
    const selected = ["ref-a", "ref-c"];
    const labels = selected.map((ref) => labelWithinGroup(ref, fullGroup));
    expect(labels).toEqual(["eSIM 1 de 3", "eSIM 3 de 3"]);
  });
});

describe("groupByPaymentAndActivationDate", () => {
  it("splits a purchase into separate groups when activation_date diverges", () => {
    // A/C misma fecha (15/10), B distinta (18/10) → dos grupos: [A,C] y [B].
    const rows = [
      row("a", "2026-09-01T00:00:01Z", "ref-a", { payment_id: "pay_1", activation_date: "2026-10-15" }),
      row("b", "2026-09-01T00:00:02Z", "ref-b", { payment_id: "pay_1", activation_date: "2026-10-18" }),
      row("c", "2026-09-01T00:00:03Z", "ref-c", { payment_id: "pay_1", activation_date: "2026-10-15" }),
    ];
    const groups = groupByPaymentAndActivationDate(rows);
    expect(groups).toHaveLength(2);
    const refs = groups.map((g) => g.map((r) => r.order_ref).sort());
    expect(refs).toContainEqual(["ref-a", "ref-c"]);
    expect(refs).toContainEqual(["ref-b"]);
  });

  it("keeps a single group when all rows share payment_id and activation_date", () => {
    const rows = [
      row("a", "2026-09-01T00:00:01Z", "ref-a", { payment_id: "pay_1", activation_date: "2026-10-15" }),
      row("b", "2026-09-01T00:00:02Z", "ref-b", { payment_id: "pay_1", activation_date: "2026-10-15" }),
    ];
    const groups = groupByPaymentAndActivationDate(rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].map((r) => r.order_ref)).toEqual(["ref-a", "ref-b"]);
  });

  it("never merges different payment_id groups even on the same date", () => {
    const rows = [
      row("a", "2026-09-01T00:00:01Z", "ref-a", { payment_id: "pay_1", activation_date: "2026-10-15" }),
      row("b", "2026-09-01T00:00:02Z", "ref-b", { payment_id: "pay_2", activation_date: "2026-10-15" }),
    ];
    const groups = groupByPaymentAndActivationDate(rows);
    expect(groups).toHaveLength(2);
  });

  it("returns each group already in canonical order", () => {
    const rows = [
      row("c", "2026-09-01T00:00:03Z", "ref-c", { payment_id: "pay_1", activation_date: "2026-10-15" }),
      row("a", "2026-09-01T00:00:01Z", "ref-a", { payment_id: "pay_1", activation_date: "2026-10-15" }),
      row("b", "2026-09-01T00:00:02Z", "ref-b", { payment_id: "pay_1", activation_date: "2026-10-15" }),
    ];
    const [group] = groupByPaymentAndActivationDate(rows);
    expect(group.map((r) => r.order_ref)).toEqual(["ref-a", "ref-b", "ref-c"]);
  });
});
