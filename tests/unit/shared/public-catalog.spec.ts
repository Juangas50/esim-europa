import "../assistant/_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { PLANS } from "@/lib/plans";

/**
 * La frontera entre el catálogo y el navegador.
 *
 * El catálogo se resuelve una vez en el servidor y viaja al navegador como
 * props. Todo lo que esté en ese objeto es legible desde «ver código fuente»:
 * no hace falta que un componente lo pinte, basta con que lo reciba.
 *
 * Estos tests existen porque esa frontera es fácil de cruzar sin darse cuenta.
 * Ampliar el `select` del servidor es una línea; que esa línea arrastre
 * metadata de provisión hasta la portada es invisible en revisión.
 */

const RAIZ = process.cwd();
const leer = (ruta: string) => fs.readFileSync(path.join(RAIZ, ruta), "utf8");

/**
 * Los campos que el navegador puede ver. La lista es exhaustiva a propósito:
 * añadir uno obliga a pasar por aquí, y por tanto a pensarlo.
 */
const CAMPOS_PUBLICOS = [
  "id",
  "slug",
  "name",
  "badge",
  "type",
  "position",
  "data_gb",
  "eu_data_gb",
  "duration_days",
  "activation_days",
  "price_usd",
  "is_popular",
  "zone",
  "features",
] as const;

/** Lo que no puede cruzar, escrito como patrón y no como lista cerrada. */
const CAMPOS_PROHIBIDOS = [
  /vodafone/i,
  /provisioning/i,
  /provision_/i,
  /\bsize\b/i,
  /\btalla\b/i,
  /_code\b/i,
  /secret/i,
  /\bkey\b/i,
  /token/i,
  /internal/i,
  /wholesale|mayorista/i,
];

test.describe("el DTO que cruza al navegador", () => {
  test("un plan no lleva más campos que los públicos", () => {
    for (const plan of PLANS) {
      const sobrantes = Object.keys(plan).filter(
        (k) => !(CAMPOS_PUBLICOS as readonly string[]).includes(k)
      );
      expect(sobrantes, `${plan.name} lleva campos no declarados`).toEqual([]);
    }
  });

  test("ningún nombre de campo huele a metadata interna", () => {
    for (const campo of CAMPOS_PUBLICOS) {
      for (const patron of CAMPOS_PROHIBIDOS) {
        expect(campo, `${campo} contra ${patron}`).not.toMatch(patron);
      }
    }
  });

  test("el tipo público no crece sin pasar por esta lista", () => {
    // Si alguien añade un campo a `Plan`, este test falla aunque el campo sea
    // inofensivo. Esa es la intención: la frontera se cruza a mano.
    const tipos = leer("src/types/index.ts");
    const bloque = tipos.match(/export interface Plan \{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(bloque, "no se encontró la interfaz Plan").not.toBe("");

    const declarados = [...bloque.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]);
    expect(declarados.sort()).toEqual([...CAMPOS_PUBLICOS].sort());
  });

  test("el select del servidor no pide columnas de provisión", () => {
    const servidor = leer("src/lib/plans-server.ts");
    const select = servidor.match(/TARIFF_COLUMNS\s*=\s*\n?\s*"([^"]+)"/)?.[1] ?? "";
    expect(select, "no se encontró la lista de columnas").not.toBe("");

    for (const columna of select.split(",").map((c) => c.trim())) {
      for (const patron of CAMPOS_PROHIBIDOS) {
        expect(columna, `columna ${columna} contra ${patron}`).not.toMatch(patron);
      }
    }
  });
});

test.describe("una sola carga del catálogo", () => {
  const portada = leer("src/app/[locale]/page.tsx");
  const benefits = leer("src/components/landing/Benefits.tsx");

  test("la portada consulta el catálogo por el camino del servidor", () => {
    expect(portada).toContain('from "@/lib/plans-server"');
    expect(portada).toMatch(/const plans = await getPlans\(/);
  });

  test("las dos secciones reciben exactamente el mismo catálogo", () => {
    // No basta con que las dos reciban «unos planes»: tiene que ser la misma
    // variable. Dos llamadas distintas a `getPlans()` podrían degradar de forma
    // distinta y dejar la página contradiciéndose a sí misma.
    const aPlans = portada.match(/<Plans\s+plans=\{(\w+)\}/)?.[1];
    const aBenefits = portada.match(/<Benefits\s+plans=\{(\w+)\}/)?.[1];

    expect(aPlans, "<Plans> no recibe el catálogo").toBeTruthy();
    expect(aBenefits, "<Benefits> no recibe el catálogo").toBeTruthy();
    expect(aBenefits).toBe(aPlans);
  });

  test("el buscador no vuelve a consultar el catálogo por su cuenta", () => {
    // Este es el fallo que dejó la rejilla vacía en producción: una segunda
    // consulta, desde el navegador, con su propio cliente y su propia forma de
    // fallar. Que no vuelva.
    expect(benefits).not.toMatch(/@\/lib\/supabase/);
    expect(benefits).not.toMatch(/supabase-plans/);
    expect(benefits).not.toMatch(/createClient|createBrowserClient/);
    expect(benefits).not.toMatch(/\bfetch\s*\(/);
    expect(benefits).not.toMatch(/useEffect/);
    expect(benefits).toMatch(/plans: Plan\[\]/);
  });

  test("no queda ningún módulo que consulte el catálogo desde el navegador", () => {
    const clientes = fs
      .readdirSync(path.join(RAIZ, "src/lib"))
      .filter((f) => f.endsWith(".ts"))
      .filter((f) => {
        const fuente = leer(`src/lib/${f}`);
        return (
          fuente.includes('from "@/lib/supabase/client"') && /from\s*\(\s*["']tariffs/.test(fuente)
        );
      });
    expect(clientes, "vuelve a haber un catálogo de navegador").toEqual([]);
  });
});
