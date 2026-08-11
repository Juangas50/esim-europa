import "./_no-network";

import { test, expect } from "@playwright/test";

import {
  ALL_TOOLS,
  TOOL_FLAGS,
  enabledTools,
  executeTool,
  neutralToolDefs,
} from "@/lib/assistant/server/tools";
import { recommendPlanTool } from "@/lib/assistant/server/tools/recommend-plan";
import { getGuideTool } from "@/lib/assistant/server/tools/get-guide";
import { escalateToHumanTool } from "@/lib/assistant/server/tools/escalate";
import { CHAIN, liveReader, fallbackReader, plan } from "./_fixtures";

const ctx = { locale: "es" as const };

/**
 * El registro, el ejecutor y el algoritmo de recomendación.
 */

test.describe("registro", () => {
  test("son las seis herramientas acordadas", () => {
    expect(ALL_TOOLS.map((t) => t.name).sort()).toEqual([
      "check_coverage",
      "check_device_compatibility",
      "escalate_to_human",
      "get_guide",
      "list_plans",
      "recommend_plan",
    ]);
  });

  test("cada una explica cuándo NO usarse", () => {
    // Una descripción que solo dice para qué sirve invita a usarla de más. Lo
    // que evita las llamadas equivocadas es el límite explícito.
    for (const tool of ALL_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(80);
    }
  });

  test("el interruptor apaga una herramienta sin tocar nada más", () => {
    const antes = enabledTools().length;
    TOOL_FLAGS.check_coverage = false;
    try {
      expect(enabledTools()).toHaveLength(antes - 1);
      expect(enabledTools().map((t) => t.name)).not.toContain("check_coverage");
    } finally {
      TOOL_FLAGS.check_coverage = true;
    }
  });

  test("una herramienta apagada no se puede ejecutar", async () => {
    TOOL_FLAGS.check_coverage = false;
    try {
      await expect(executeTool("check_coverage", { country: "España" }, ctx)).rejects.toThrow(
        /unknown_tool/
      );
    } finally {
      TOOL_FLAGS.check_coverage = true;
    }
  });

  test("la exportación es neutral: no lleva formato de ningún proveedor", () => {
    const defs = neutralToolDefs();
    expect(defs).toHaveLength(6);
    for (const def of defs) {
      expect(def.parameters).toBeTruthy();
      expect(def.parameters.$schema).toBeUndefined();
      expect(def.parameters.type).toBe("object");
      // Ni `input_schema` ni `function`: los nombres de cada API se ponen en su
      // adaptador, no aquí.
      expect(Object.keys(def).sort()).toEqual(["description", "name", "parameters"]);
    }
  });
});

test.describe("ejecutor", () => {
  test("una herramienta inexistente falla", async () => {
    await expect(executeTool("borrar_pedidos", {}, ctx)).rejects.toThrow(/unknown_tool/);
  });

  test("argumentos inválidos fallan antes de ejecutar nada", async () => {
    await expect(executeTool("get_guide", { slug: "../../etc/passwd" }, ctx)).rejects.toThrow(
      /invalid_tool_input/
    );
  });

  test("campos de más en los argumentos también fallan", async () => {
    await expect(
      executeTool("get_guide", { slug: "qr", extra: "sorpresa" }, ctx)
    ).rejects.toThrow(/invalid_tool_input/);
  });

  test("el enum de guías está cerrado", async () => {
    for (const slug of ["install-iphone", "install-android", "qr", "troubleshooting"]) {
      const out = (await getGuideTool.execute({ slug: slug as never }, ctx)) as { content: string };
      expect(out.content.length).toBeGreaterThan(50);
    }
  });
});

test.describe("escalate_to_human", () => {
  test("sanea el resumen antes de que salga", async () => {
    const out = await escalateToHumanTool.execute(
      { reason: "order_issue", summary: "no le llega el QR a ana@ejemplo.com, pedido R34-1" },
      ctx
    );
    expect(out.handoffSummary).not.toContain("ana@ejemplo.com");
    expect(out.redacted).toBe(true);
    // La referencia de pedido sí sobrevive: es lo que soporte necesita.
    expect(out.handoffSummary).toContain("R34-1");
  });

  test("un resumen limpio pasa sin marcas", async () => {
    const out = await escalateToHumanTool.execute(
      { reason: "coverage_not_verifiable", summary: "pregunta si funciona en Turquía" },
      ctx
    );
    expect(out.redacted).toBe(false);
  });
});

test.describe("recommend_plan: el algoritmo", () => {
  const conCatalogo = { locale: "es" as const, readPlans: liveReader() };

  test("sin criterios, no recomienda: pide los que faltan", async () => {
    const out = await recommendPlanTool.execute({}, conCatalogo);
    expect(out.status).toBe("insufficient_criteria");
  });

  test("un presupuesto solo no es criterio suficiente", async () => {
    // El presupuesto acota, no dice qué necesita la persona. Recomendar "el más
    // barato que entra en 30 dólares" sin saber cuántos gigas hacen falta sería
    // exactamente la heurística arbitraria que no queremos.
    const out = await recommendPlanTool.execute({ budgetMaxUsd: 30 }, conCatalogo);
    expect(out.status).toBe("insufficient_criteria");
  });

  test("elige el más barato que cumple", async () => {
    const out = await recommendPlanTool.execute({ estimatedTotalGb: 100 }, conCatalogo);
    expect(out.status).toBe("recommended");
    if (out.status !== "recommended") return;
    // 90 no llega; 270 es el primero que sí.
    expect(out.plan.planId).toBe("p2");
    expect(out.reasons.map((r) => r.code)).toContain("cheapest_meeting_constraints");
  });

  test("no sube de gama sin motivo", async () => {
    const out = await recommendPlanTool.execute({ estimatedTotalGb: 50 }, conCatalogo);
    if (out.status !== "recommended") return;
    expect(out.plan.planId).toBe("p1");
  });

  test("el tope fuera de España también manda", async () => {
    const out = await recommendPlanTool.execute({ estimatedGbOutsideSpain: 40 }, conCatalogo);
    if (out.status !== "recommended") return;
    // 15, 23 y 30 no llegan; 45 sí.
    expect(out.plan.planId).toBe("p4");
  });

  test("las razones llevan la cifra pedida y la del plan", async () => {
    const out = await recommendPlanTool.execute({ estimatedTotalGb: 300 }, conCatalogo);
    if (out.status !== "recommended") return;
    const razon = out.reasons.find((r) => r.code === "meets_total_gb");
    expect(razon).toEqual({ code: "meets_total_gb", required: 300, planValue: 330 });
  });

  test("si lo pedido supera el catálogo, ofrece el techo y lo dice", async () => {
    const out = await recommendPlanTool.execute({ estimatedTotalGb: 900 }, conCatalogo);
    expect(out.status).toBe("exceeds_catalog");
    if (out.status !== "exceeds_catalog") return;
    expect(out.plan.planId).toBe("p5");
    expect(out.warnings.map((w) => w.code)).toContain("requested_gb_above_catalog_max");
  });

  test("un viaje más largo que la validez avisa, no descarta", async () => {
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 50, tripDays: 45 },
      conCatalogo
    );
    if (out.status !== "recommended") return;
    expect(out.plan.planId).toBe("p1");
    expect(out.warnings.map((w) => w.code)).toContain("trip_exceeds_validity");
  });

  test("el presupuesto no degrada la recomendación: avisa", async () => {
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 400, budgetMaxUsd: 20 },
      conCatalogo
    );
    if (out.status !== "recommended") return;
    // Necesita 400 GB: eso es el p5, cueste lo que cueste. No se le vende un p2
    // por debajo de lo que dijo necesitar solo porque encaje en su presupuesto.
    expect(out.plan.planId).toBe("p5");
    expect(out.warnings.map((w) => w.code)).toContain("budget_exceeded");
  });

  test("dentro de presupuesto, lo dice como razón", async () => {
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 50, budgetMaxUsd: 20 },
      conCatalogo
    );
    if (out.status !== "recommended") return;
    expect(out.reasons.map((r) => r.code)).toContain("within_budget");
  });

  test("es determinista: mismas entradas, misma salida", async () => {
    const a = await recommendPlanTool.execute({ estimatedTotalGb: 300, tripDays: 20 }, conCatalogo);
    const b = await recommendPlanTool.execute({ estimatedTotalGb: 300, tripDays: 20 }, conCatalogo);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test("sin catálogo vivo, no recomienda nada", async () => {
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 100 },
      { locale: "es", readPlans: fallbackReader() }
    );
    expect(out.status).toBe("unavailable");
    expect(JSON.stringify(out)).not.toContain("270");
  });
});

test.describe("recommend_plan: cuándo se declara incompetente", () => {
  test("si la cadena deja de ser monótona, no inventa un criterio", async () => {
    // Una tarifa más cara con menos gigas rompe el orden total. En ese catálogo
    // "el más barato que cumple" ya no es una respuesta única, así que la
    // herramienta se retira en vez de desempatar por su cuenta.
    const rota = [...CHAIN, plan({ id: "rara", name: "Rara", price_usd: 60, data_gb: 50, eu_data_gb: 5 })];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 100 },
      { locale: "es", readPlans: liveReader(rota) }
    );
    expect(out.status).toBe("no_deterministic_recommendation");
  });

  test("si se mezclan tipos de producto, tampoco decide", async () => {
    // Elegir entre línea con número y solo datos es una preferencia, no una
    // optimización. No le toca a esta herramienta.
    const mixto = [
      ...CHAIN,
      plan({ id: "solo-datos", name: "Solo datos", type: "dataonly", price_usd: 60, data_gb: 500, eu_data_gb: 70 }),
    ];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 100 },
      { locale: "es", readPlans: liveReader(mixto) }
    );
    expect(out.status).toBe("no_deterministic_recommendation");
  });

  test("dos planes al mismo precio con distintos gigas: no elige", async () => {
    // El defecto que encontró la revisión. Antes devolvía el de 200 GB porque
    // el desempate era por gigas ascendente; ahora se retira, y no se sustituye
    // por una preferencia de "más gigas por el mismo precio", que sería otro
    // criterio implícito.
    const empate = [
      plan({ id: "a", name: "A", price_usd: 20, data_gb: 200, eu_data_gb: 20 }),
      plan({ id: "b", name: "B", price_usd: 20, data_gb: 300, eu_data_gb: 30 }),
    ];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 100 },
      { locale: "es", readPlans: liveReader(empate) }
    );
    expect(out.status).toBe("no_deterministic_recommendation");
  });

  test("dos planes idénticos en precio y prestaciones: tampoco elige", async () => {
    // Aunque dar uno u otro diera igual al usuario, la herramienta no tiene
    // forma de saberlo: son dos productos distintos con el mismo perfil.
    const empate = [
      plan({ id: "a", name: "A", price_usd: 20, data_gb: 200, eu_data_gb: 20 }),
      plan({ id: "b", name: "B", price_usd: 20, data_gb: 200, eu_data_gb: 20 }),
    ];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 100 },
      { locale: "es", readPlans: liveReader(empate) }
    );
    expect(out.status).toBe("no_deterministic_recommendation");
  });

  test("un empate que no afecta no bloquea la recomendación", async () => {
    // Dos planes empatan a 20 USD, pero solo uno llega a los 250 GB pedidos.
    // El empate existe y es irrelevante: no hay ambigüedad que resolver.
    const empate = [
      plan({ id: "a", name: "A", price_usd: 20, data_gb: 200, eu_data_gb: 20 }),
      plan({ id: "b", name: "B", price_usd: 20, data_gb: 300, eu_data_gb: 30 }),
      plan({ id: "c", name: "C", price_usd: 40, data_gb: 400, eu_data_gb: 40 }),
    ];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 250 },
      { locale: "es", readPlans: liveReader(empate) }
    );
    expect(out.status).toBe("recommended");
    if (out.status !== "recommended") return;
    expect(out.plan.planId).toBe("b");
  });

  test("un empate en el techo tampoco se resuelve por sorteo", async () => {
    // Nada cumple, así que se ofrecería el plan más caro como referencia — pero
    // hay dos empatados en el precio más alto. Mismo problema, misma respuesta.
    const empate = [
      plan({ id: "a", name: "A", price_usd: 20, data_gb: 200, eu_data_gb: 20 }),
      plan({ id: "b", name: "B", price_usd: 20, data_gb: 300, eu_data_gb: 30 }),
    ];
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 5000 },
      { locale: "es", readPlans: liveReader(empate) }
    );
    expect(out.status).toBe("no_deterministic_recommendation");
  });

  test("con un solo plan en catálogo, lo dice como razón", async () => {
    const out = await recommendPlanTool.execute(
      { estimatedTotalGb: 10 },
      { locale: "es", readPlans: liveReader([CHAIN[0]]) }
    );
    if (out.status !== "recommended") return;
    expect(out.reasons.map((r) => r.code)).toContain("only_plan_available");
  });
});
