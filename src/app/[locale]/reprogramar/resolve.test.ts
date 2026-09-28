import { describe, it, expect, vi, beforeEach } from "vitest";

// Dataset controlado — simula filas reales de b2c_orders. El mock de
// createAdminClient() parsea el filtro .or() que arma resolveAuthorizedGroup
// (mismo formato PostgREST real: and(order_ref.eq.X,reschedule_token.eq.Y),...)
// y devuelve exactamente las filas cuyo (order_ref, reschedule_token) matchea
// — igual que haría Postgres — para probar la lógica de autorización real
// sin una base de datos.
const DATASET = [
  { id: "1", order_ref: "R34-A", status: "paid", activation_date: "2026-10-15", created_at: "2026-09-01T00:00:01Z", customer_name: "Sofía", customer_email: "sofia@example.com", payment_id: "pay_1", locale: "es", tariffs: { name: "Europa Plus" } },
  { id: "2", order_ref: "R34-B", status: "paid", activation_date: "2026-10-15", created_at: "2026-09-01T00:00:02Z", customer_name: "Sofía", customer_email: "sofia@example.com", payment_id: "pay_1", locale: "es", tariffs: { name: "Europa Plus" } },
  { id: "3", order_ref: "R34-C", status: "qr_sent", activation_date: "2026-10-15", created_at: "2026-09-01T00:00:03Z", customer_name: "Sofía", customer_email: "sofia@example.com", payment_id: "pay_1", locale: "es", tariffs: { name: "Europa Plus" } },
  { id: "4", order_ref: "R34-D", status: "paid", activation_date: "2026-10-20", created_at: "2026-09-01T00:00:04Z", customer_name: "Juan", customer_email: "juan@example.com", payment_id: "pay_2", locale: "pt", tariffs: { name: "Data 10 GB" } },
];

const TOKEN_OF: Record<string, string> = {
  "R34-A": "00000000-0000-0000-0000-00000000000a",
  "R34-B": "00000000-0000-0000-0000-00000000000b",
  "R34-C": "00000000-0000-0000-0000-00000000000c",
  "R34-D": "00000000-0000-0000-0000-00000000000d",
};

function parseOrFilter(filter: string): Array<{ ref: string; token: string }> {
  const pairs: Array<{ ref: string; token: string }> = [];
  const re = /and\(order_ref\.eq\.([^,]+),reschedule_token\.eq\.([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(filter))) pairs.push({ ref: m[1], token: m[2] });
  return pairs;
}

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        or: (filter: string) => {
          const requested = parseOrFilter(filter);
          const matched = DATASET.filter((row) =>
            requested.some((p) => p.ref === row.order_ref && p.token === TOKEN_OF[row.order_ref])
          );
          return Promise.resolve({ data: matched, error: null });
        },
      }),
    }),
  }),
}));

const { parsePairsParam, isValidLegacyPair, resolveAuthorizedGroup } = await import("./resolve");

describe("parsePairsParam (rows=)", () => {
  it("parses a well-formed multi-pair rows= value", () => {
    const result = parsePairsParam("R34-A:00000000-0000-0000-0000-00000000000a,R34-B:00000000-0000-0000-0000-00000000000b");
    expect(result).toEqual([
      { ref: "R34-A", token: "00000000-0000-0000-0000-00000000000a" },
      { ref: "R34-B", token: "00000000-0000-0000-0000-00000000000b" },
    ]);
  });

  it("rejects an empty value", () => {
    expect(parsePairsParam("")).toBeNull();
  });

  it("rejects more than 10 pairs (max eSIMs per compra)", () => {
    const many = Array.from({ length: 11 }, (_, i) => `R34-${i}:00000000-0000-0000-0000-00000000000${i.toString(16)}`).join(",");
    expect(parsePairsParam(many)).toBeNull();
  });

  it("rejects a pair with a malformed token", () => {
    expect(parsePairsParam("R34-A:not-a-uuid")).toBeNull();
  });

  it("rejects a pair with no ':' separator", () => {
    expect(parsePairsParam("R34-A-no-colon")).toBeNull();
  });

  it("rejects a ref containing filter-breaking characters", () => {
    expect(parsePairsParam("R34-A,injected:00000000-0000-0000-0000-00000000000a")).toBeNull();
  });

  it("rejects duplicate refs within the same link (corrupted link)", () => {
    const pair = "R34-A:00000000-0000-0000-0000-00000000000a";
    expect(parsePairsParam(`${pair},${pair}`)).toBeNull();
  });
});

describe("isValidLegacyPair (?ref=&token=)", () => {
  it("accepts a valid legacy pair — indefinite backward compatibility", () => {
    expect(isValidLegacyPair("R34-A", "00000000-0000-0000-0000-00000000000a")).toEqual({
      ref: "R34-A",
      token: "00000000-0000-0000-0000-00000000000a",
    });
  });

  it("rejects when either param is missing", () => {
    expect(isValidLegacyPair(undefined, "00000000-0000-0000-0000-00000000000a")).toBeNull();
    expect(isValidLegacyPair("R34-A", undefined)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(isValidLegacyPair("R34-A", "not-a-uuid")).toBeNull();
  });
});

describe("resolveAuthorizedGroup — all-or-nothing authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("authorizes a single legacy pair", async () => {
    const result = await resolveAuthorizedGroup([{ ref: "R34-A", token: TOKEN_OF["R34-A"] }]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rows.map((r) => r.order_ref)).toEqual(["R34-A"]);
  });

  it("authorizes a full multi-row group when every pair is valid", async () => {
    const result = await resolveAuthorizedGroup([
      { ref: "R34-A", token: TOKEN_OF["R34-A"] },
      { ref: "R34-B", token: TOKEN_OF["R34-B"] },
      { ref: "R34-C", token: TOKEN_OF["R34-C"] },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rows).toHaveLength(3);
  });

  it("rejects the WHOLE set when one pair is invalid (all-or-nothing, zero partial auth)", async () => {
    const result = await resolveAuthorizedGroup([
      { ref: "R34-A", token: TOKEN_OF["R34-A"] },
      { ref: "R34-B", token: "00000000-0000-0000-0000-0000000000ff" }, // token incorrecto
    ]);
    expect(result.ok).toBe(false);
  });

  it("rejects a pair referencing a real order_ref with someone else's token", async () => {
    const result = await resolveAuthorizedGroup([{ ref: "R34-A", token: TOKEN_OF["R34-B"] }]);
    expect(result.ok).toBe(false);
  });

  it("rejects mixing rows from two different payment_id — never authorizes by payment_id alone", async () => {
    const result = await resolveAuthorizedGroup([
      { ref: "R34-A", token: TOKEN_OF["R34-A"] }, // pay_1
      { ref: "R34-D", token: TOKEN_OF["R34-D"] }, // pay_2
    ]);
    expect(result.ok).toBe(false);
  });

  it("still resolves a group containing an already-delivered row (caller decides editable vs disabled)", async () => {
    const result = await resolveAuthorizedGroup([
      { ref: "R34-A", token: TOKEN_OF["R34-A"] },
      { ref: "R34-C", token: TOKEN_OF["R34-C"] }, // status: qr_sent
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const statuses = result.rows.map((r) => r.status);
      expect(statuses).toContain("paid");
      expect(statuses).toContain("qr_sent");
    }
  });

  it("returns rows in canonical order regardless of the order pairs were declared", async () => {
    const result = await resolveAuthorizedGroup([
      { ref: "R34-B", token: TOKEN_OF["R34-B"] },
      { ref: "R34-A", token: TOKEN_OF["R34-A"] },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rows.map((r) => r.order_ref)).toEqual(["R34-A", "R34-B"]);
  });
});
