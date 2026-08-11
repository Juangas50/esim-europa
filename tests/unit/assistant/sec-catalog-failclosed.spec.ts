import "./_no-network";

import { test, expect } from "@playwright/test";

import { getAssistantCatalog } from "@/lib/assistant/server/catalog";
import { toAssistantPlanDto, assistantPlanSchema } from "@/lib/assistant/server/dto";
import { listPlansTool } from "@/lib/assistant/server/tools/list-plans";
import { CHAIN, liveReader, fallbackReader, throwingReader, emptyReader, plan } from "./_fixtures";

/**
 * Fail closed, comprobado por sus cuatro caminos.
 *
 * El catálogo puede fallar de cuatro maneras distintas y las cuatro tienen que
 * terminar en el mismo sitio: sin precios y sin gigas. Basta con que una sola
 * de ellas se cuele para que el asistente pueda afirmar un precio que no está
 * respaldado, que es exactamente el fallo que esta regla existe para evitar.
 */

test.describe("cuándo hay catálogo", () => {
  test("con source supabase, entrega los planes", async () => {
    const result = await getAssistantCatalog(liveReader());
    expect(result.status).toBe("live");
    if (result.status !== "live") return;
    expect(result.plans).toHaveLength(CHAIN.length);
  });
});

test.describe("cuándo no lo hay", () => {
  test("el fallback local NO cuenta como catálogo", async () => {
    const result = await getAssistantCatalog(fallbackReader());
    expect(result.status).toBe("unavailable");
  });

  test("una excepción tampoco", async () => {
    const result = await getAssistantCatalog(throwingReader());
    expect(result.status).toBe("unavailable");
  });

  test("una respuesta vacía tampoco", async () => {
    const result = await getAssistantCatalog(emptyReader());
    expect(result.status).toBe("unavailable");
  });

  test("un plan que no valida invalida el catálogo entero", async () => {
    // Gigas de roaming por encima del total: contradicción. No se sirve el
    // subconjunto sano — si una fila está mal, no sabemos qué más está mal.
    const corrupto = [
      ...CHAIN,
      plan({ id: "malo", name: "Gama rota", data_gb: 10, eu_data_gb: 999 }),
    ];
    const result = await getAssistantCatalog(liveReader(corrupto));
    expect(result.status).toBe("unavailable");
  });
});

test.describe("lo que llega al modelo cuando no hay catálogo", () => {
  test("no lleva precios ni gigas por ningún campo", async () => {
    const out = await listPlansTool.execute({}, { locale: "es", readPlans: fallbackReader() });

    expect(out.status).toBe("unavailable");

    const serializado = JSON.stringify(out);
    for (const p of CHAIN) {
      expect(serializado).not.toContain(String(p.price_usd));
      expect(serializado).not.toContain(String(p.data_gb));
      expect(serializado).not.toContain(p.name);
    }
  });

  test("tampoco lleva el motivo técnico del fallo", async () => {
    const out = await listPlansTool.execute({}, { locale: "es", readPlans: throwingReader() });
    const serializado = JSON.stringify(out);
    // El `reason` interno decía "conexión rechazada". Eso se queda en los logs.
    expect(serializado).not.toContain("conexión rechazada");
    expect(serializado).not.toContain("supabase");
  });
});

test.describe("el DTO protege la semántica de los gigas", () => {
  test("renombra los campos ambiguos", () => {
    const dto = toAssistantPlanDto(CHAIN[1]);
    expect(dto.data.totalGb).toBe(270);
    expect(dto.data.outsideSpainMaxGb).toBe(23);
    expect(JSON.stringify(dto)).not.toContain("data_gb");
    expect(JSON.stringify(dto)).not.toContain("eu_data_gb");
  });

  test("lleva un discriminador explícito, no un booleano suelto", () => {
    expect(toAssistantPlanDto(CHAIN[0]).data.kind).toBe("spain_line_with_roaming_cap");
  });

  test("la contradicción es irrepresentable", () => {
    expect(() =>
      assistantPlanSchema.parse({
        planId: "x",
        name: "X",
        data: { kind: "spain_line_with_roaming_cap", totalGb: 10, outsideSpainMaxGb: 20 },
        validityDays: 28,
        activationWindowDays: 365,
        priceUsd: 10,
        includesSpanishNumber: true,
        includesUnlimitedCallsSmsInSpain: true,
      })
    ).toThrow();
  });

  test("no arrastra metadata que el modelo no necesita", () => {
    const dto = toAssistantPlanDto(CHAIN[0]);
    const claves = Object.keys(dto);
    for (const prohibida of ["slug", "badge", "position", "is_popular", "features", "countries_count", "zone", "type"]) {
      expect(claves).not.toContain(prohibida);
    }
  });
});
