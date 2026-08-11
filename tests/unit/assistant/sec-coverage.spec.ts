import "./_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import { checkCoverageTool } from "@/lib/assistant/server/tools/check-coverage";
import { executeTool } from "@/lib/assistant/server/tools";
import { COVERAGE_COUNTRIES, plansCovering, plansExcluding } from "@/lib/coverage";
import { PLAN_KEYS } from "@/lib/plan-key";

/**
 * `check_coverage`, ya sobre la fuente canónica.
 *
 * Lo que estos tests protegen no es solo que las respuestas sean correctas hoy,
 * sino que **salgan del mismo sitio que las de la web**. Si alguien vuelve a
 * escribir una lista de países dentro de esta herramienta, el bloque final falla.
 */

const ctx = { locale: "es" as const };

test.describe("destinos cubiertos por las cinco gamas", () => {
  const destinos = [
    "Francia",
    "Reino Unido",
    "Turquía",
    "Ucrania",
    "Moldavia",
    "Kosovo",
    "Vaticano",
    "Mónaco",
    "España",
    "Portugal",
  ];

  for (const pais of destinos) {
    test(`${pais} → las cinco`, async () => {
      const out = await checkCoverageTool.execute({ country: pais }, ctx);
      expect(out.status).toBe("covered_by_all_plans");
      if (out.status !== "covered_by_all_plans") return;
      expect(out.includedInPlans).toEqual([...PLAN_KEYS]);
    });
  }
});

test.describe("Estados Unidos, la excepción", () => {
  test("lo incluyen cuatro gamas y lo excluye Europa Básico", async () => {
    const out = await checkCoverageTool.execute({ country: "Estados Unidos" }, ctx);
    expect(out.status).toBe("covered_with_exceptions");
    if (out.status !== "covered_with_exceptions") return;

    expect(out.includedInPlans).toEqual([
      "europa-plus",
      "europa-total",
      "europa-max",
      "europa-premium",
    ]);
    expect(out.excludedFromPlans).toEqual(["europa-basico"]);
  });

  test("se reconoce escrito de cuatro formas", async () => {
    for (const forma of ["EEUU", "USA", "US", "estados unidos"]) {
      const out = await checkCoverageTool.execute({ country: forma }, ctx);
      expect(out.status, forma).toBe("covered_with_exceptions");
    }
  });

  test("el resultado obliga a avisar antes de la compra", async () => {
    const out = await checkCoverageTool.execute({ country: "US" }, ctx);
    if (out.status !== "covered_with_exceptions") return;
    expect(out.message.toLowerCase()).toContain("antes");
  });
});

test.describe("destinos fuera de la lista", () => {
  const fuera = ["Marruecos", "Andorra", "Japón", "Argentina", "Freedonia", "??"];

  for (const pais of fuera) {
    test(`${pais} → no se afirma cobertura`, async () => {
      const out = await checkCoverageTool.execute({ country: pais }, ctx);
      expect(out.status).toBe("not_in_coverage");
    });
  }

  test("no afirma lo contrario tampoco: dice que no puede confirmarlo", async () => {
    const out = await checkCoverageTool.execute({ country: "Marruecos" }, ctx);
    if (out.status !== "not_in_coverage") return;
    expect(out.message).toContain("no puedes confirmarlo");
    expect(out.message.toLowerCase()).toContain("no afirmes que no funciona");
  });

  test("una coincidencia parcial no inventa un país", async () => {
    // "esta" fue durante meses suficiente para que la web ocultara un plan.
    for (const parcial of ["esta", "franc", "tur", "u"]) {
      const out = await checkCoverageTool.execute({ country: parcial }, ctx);
      expect(out.status, parcial).toBe("not_in_coverage");
    }
  });
});

test.describe("separación entre cobertura y gigas", () => {
  test("ninguna respuesta lleva cifras de datos", async () => {
    for (const pais of ["Francia", "Estados Unidos", "Marruecos"]) {
      const out = await checkCoverageTool.execute({ country: pais }, ctx);
      const texto = JSON.stringify(out);
      expect(texto, pais).not.toMatch(/\bGB\b/i);
      expect(texto, pais).not.toContain("totalGb");
      expect(texto, pais).not.toContain("outsideSpainMaxGb");
    }
  });

  test("el esquema no tiene dónde meter un giga", () => {
    const schema = JSON.stringify(z.toJSONSchema(checkCoverageTool.result));
    expect(schema).not.toContain("Gb");
    expect(schema).not.toContain("price");
  });

  test("la descripción le dice al modelo que necesita list_plans para eso", () => {
    expect(checkCoverageTool.description).toContain("list_plans");
  });
});

test.describe("borde de entrada", () => {
  test("rechaza consultas vacías o absurdamente largas", async () => {
    await expect(executeTool("check_coverage", { country: "x" }, ctx)).rejects.toThrow(
      /invalid_tool_input/
    );
    await expect(
      executeTool("check_coverage", { country: "a".repeat(200) }, ctx)
    ).rejects.toThrow(/invalid_tool_input/);
  });

  test("el ejecutor valida la salida, no solo la entrada", async () => {
    const out = await executeTool("check_coverage", { country: "Italia" }, ctx);
    expect((out as { status: string }).status).toBe("covered_by_all_plans");
  });
});

test.describe("misma fuente que la web", () => {
  test("la herramienta responde lo mismo que el módulo de cobertura", async () => {
    for (const country of COVERAGE_COUNTRIES) {
      const out = await checkCoverageTool.execute({ country: country.name }, ctx);
      if (out.status === "not_in_coverage") {
        throw new Error(`${country.name} está en la fuente pero la tool no lo reconoce`);
      }
      expect(out.includedInPlans, country.name).toEqual(plansCovering(country));
      if (out.status === "covered_with_exceptions") {
        expect(out.excludedFromPlans, country.name).toEqual(plansExcluding(country));
      }
    }
  });

  test("la herramienta no tiene su propia lista de países", () => {
    const fuente = fs.readFileSync(
      path.join(process.cwd(), "src/lib/assistant/server/tools/check-coverage.ts"),
      "utf8"
    );
    expect(fuente).toContain('from "@/lib/coverage"');

    // Ningún nombre de país escrito a mano en el CÓDIGO. Los comentarios se
    // quitan antes: un ejemplo didáctico no es una lista de cobertura.
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const pais of ["Francia", "Turquía", "Reino Unido", "Portugal", "Italia", "España"]) {
      expect(codigo, pais).not.toContain(pais);
    }
  });
});
