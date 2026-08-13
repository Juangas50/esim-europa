import "../assistant/_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import {
  COVERAGE_COUNTRIES,
  TOTAL_DESTINATIONS,
  destinationsForPlan,
  findCoverageCountry,
  plansCovering,
  resolveCountryForSearch,
  plansExcluding,
  searchCoverageCountries,
} from "@/lib/coverage";
import { PLAN_KEYS, toPlanKey } from "@/lib/plan-key";
import { PLANS } from "@/lib/plans";
import { toAssistantPlanDto } from "@/lib/assistant/server/dto";
import type { Plan } from "@/types";

/**
 * La fuente canónica de cobertura.
 *
 * Antes de esto había tres listas escritas a mano —el buscador de la portada, el
 * modal del hero y una tabla que en realidad medía otra cosa— que no coincidían
 * entre sí. Estos tests existen para que no vuelva a haber dos.
 */

const RUTA = path.join(process.cwd(), "src/data/coverage.json");

test.describe("forma de la lista", () => {
  test("son 39 destinos", () => {
    expect(TOTAL_DESTINATIONS).toBe(39);
    expect(COVERAGE_COUNTRIES).toHaveLength(39);
  });

  test("Europa Básico cubre 38", () => {
    expect(destinationsForPlan("europa-basico")).toBe(38);
  });

  test("las otras cuatro gamas cubren 39", () => {
    for (const key of ["europa-plus", "europa-total", "europa-max", "europa-premium"]) {
      expect(destinationsForPlan(key), key).toBe(39);
    }
  });

  test("Estados Unidos es la única excepción", () => {
    const conExcepciones = COVERAGE_COUNTRIES.filter((c) => c.excludedPlans.length > 0);
    expect(conExcepciones.map((c) => c.code)).toEqual(["US"]);
    expect(conExcepciones[0].excludedPlans).toEqual(["europa-basico"]);
  });

  test("los otros 38 destinos están en las cinco gamas", () => {
    for (const country of COVERAGE_COUNTRIES) {
      if (country.code === "US") continue;
      expect(plansCovering(country), country.name).toEqual([...PLAN_KEYS]);
      expect(plansExcluding(country), country.name).toEqual([]);
    }
  });

  test("los códigos ISO no se repiten", () => {
    const codes = COVERAGE_COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

test.describe("resolución de países", () => {
  test("reconoce Estados Unidos por sus cuatro formas", () => {
    for (const forma of ["Estados Unidos", "EEUU", "USA", "US", "ee.uu.", "united states"]) {
      const found = findCoverageCountry(forma);
      expect(found?.code, forma).toBe("US");
    }
  });

  test("reconoce nombre, código y alias de otros destinos", () => {
    expect(findCoverageCountry("Francia")?.code).toBe("FR");
    expect(findCoverageCountry("FR")?.code).toBe("FR");
    expect(findCoverageCountry("france")?.code).toBe("FR");
    expect(findCoverageCountry("  TURQUÍA  ")?.code).toBe("TR");
    expect(findCoverageCountry("Holanda")?.code).toBe("NL");
    expect(findCoverageCountry("chequia")?.code).toBe("CZ");
  });

  test("no resuelve por coincidencia parcial", () => {
    // El fallo que tenía el buscador: cuatro letras bastaban para ocultar un
    // plan. La resolución es exacta; la subcadena solo alimenta sugerencias.
    for (const parcial of ["esta", "estad", "us a", "u", "franc", "tur"]) {
      expect(findCoverageCountry(parcial), parcial).toBeNull();
    }
  });

  test("un país fuera de la lista no resuelve", () => {
    for (const fuera of ["Marruecos", "Andorra", "Japón", "Freedonia", "Argentina"]) {
      expect(findCoverageCountry(fuera), fuera).toBeNull();
    }
  });

  test("las sugerencias sí buscan por subcadena", () => {
    expect(searchCoverageCountries("esta").map((c) => c.code)).toContain("US");
    expect(searchCoverageCountries("tur").map((c) => c.code)).toContain("TR");
    expect(searchCoverageCountries("")).toEqual([]);
  });
});

test.describe("resolución del buscador de la web", () => {
  // A diferencia del asistente, el buscador puede resolver lo tecleado a
  // medias — pero solo cuando la lista entera responde con un país y uno solo.

  test("las formas exactas siguen resolviendo", () => {
    for (const forma of ["Estados Unidos", "EEUU", "USA", "US", "ee.uu."]) {
      expect(resolveCountryForSearch(forma)?.code, forma).toBe("US");
    }
    expect(resolveCountryForSearch("Francia")?.code).toBe("FR");
    expect(resolveCountryForSearch("es")?.code).toBe("ES"); // código exacto
  });

  test("un principio inequívoco resuelve sin terminar la palabra", () => {
    for (const parcial of ["esta", "estados", "estados uni", "estados unido", "eeu", "ame"]) {
      expect(resolveCountryForSearch(parcial)?.code, parcial).toBe("US");
    }
    expect(resolveCountryForSearch("franc")?.code).toBe("FR");
    expect(resolveCountryForSearch("turqu")?.code).toBe("TR");
  });

  test("si la consulta admite más de un país, no decide", () => {
    // Ojo: «ital» NO va aquí — solo lo cumple Italia, así que sí resuelve.
    for (const ambigua of ["a", "u", "e", "i", "an"]) {
      expect(searchCoverageCountries(ambigua).length, ambigua).toBeGreaterThan(1);
      expect(resolveCountryForSearch(ambigua), ambigua).toBeNull();
    }
  });

  test("una forma exacta manda sobre la ambigüedad", () => {
    // «es» es subcadena de media lista, pero también es el código de España.
    // Lo que el usuario escribió existe tal cual: no hay nada que adivinar.
    expect(searchCoverageCountries("es").length).toBeGreaterThan(1);
    expect(resolveCountryForSearch("es")?.code).toBe("ES");
  });

  test("si no coincide con nada, no decide", () => {
    for (const fuera of ["Marruecos", "Freedonia", "zzzz", "japon"]) {
      expect(resolveCountryForSearch(fuera), fuera).toBeNull();
    }
  });

  test("un trozo de en medio no decide, aunque sea único", () => {
    // «dos» solo aparece en «Estados Unidos», pero no es el principio de nada:
    // quien escribe eso no está escribiendo un país.
    for (const trozo of ["dos", "idos", "tad", "ric", "ates"]) {
      expect(searchCoverageCountries(trozo).length, trozo).toBe(1);
      expect(resolveCountryForSearch(trozo), trozo).toBeNull();
    }
  });

  test("dos caracteres no bastan aunque sean únicos", () => {
    // «eu» solo casa con el alias «eeuu». Pero casi siempre es alguien
    // empezando a escribir «Europa», y esconderle el plan Básico ahí sería
    // exactamente el fallo que estamos evitando.
    for (const corta of ["eu", "me", "of", "uu"]) {
      expect(searchCoverageCountries(corta).length, corta).toBe(1);
      expect(resolveCountryForSearch(corta), corta).toBeNull();
    }
  });

  test("el asistente no hereda esta tolerancia", () => {
    // `findCoverageCountry` sigue exigiendo forma exacta: una máquina que
    // afirma cobertura no adivina a qué país se refería nadie.
    for (const parcial of ["esta", "estados", "franc", "eeu"]) {
      expect(findCoverageCountry(parcial), parcial).toBeNull();
    }
  });

  test("ninguna consulta de dos caracteres puede esconder un plan", () => {
    // Barrido, no muestreo: si mañana alguien añade un alias corto, esto falla.
    const alfabeto = "abcdefghijklmnopqrstuvwxyz";
    for (const a of alfabeto) {
      for (const b of alfabeto) {
        const q = a + b;
        const resuelto = resolveCountryForSearch(q);
        if (!resuelto) continue;
        // Solo puede resolver si es una forma exacta (un código ISO).
        expect(findCoverageCountry(q), `«${q}» resolvió sin ser forma exacta`).not.toBeNull();
      }
    }
  });
});

test.describe("claves comerciales", () => {
  test("los cinco nombres producen las cinco claves", () => {
    const nombres = ["Europa Básico", "Europa Plus", "Europa Total", "Europa Max", "Europa Premium"];
    expect(nombres.map(toPlanKey)).toEqual([...PLAN_KEYS]);
  });

  test("el fallback produce exactamente esas claves", () => {
    expect(PLANS.map((p) => p.slug)).toEqual([...PLAN_KEYS]);
  });

  test("catálogo vivo y fallback coinciden para el mismo producto", () => {
    // Misma tarifa vista desde las dos fuentes: la fila de la base de datos
    // llega con UUID y sin slug; el fallback, con el identificador heredado.
    // Lo único que comparten es el nombre comercial — y basta.
    const desdeCatalogoVivo = {
      ...PLANS[0],
      id: "30c52a68-639a-442b-8eb4-aa19c55b2d92",
      slug: toPlanKey(PLANS[0].name),
    } as Plan;
    const desdeFallback = { ...PLANS[0], id: "local-s", slug: "local-s" } as Plan;

    expect(toAssistantPlanDto(desdeCatalogoVivo).key).toBe(toAssistantPlanDto(desdeFallback).key);
    expect(toAssistantPlanDto(desdeFallback).key).toBe("europa-basico");
  });

  test("ninguna clave comercial choca con un identificador de fila", () => {
    // El flujo de compra resuelve `?plan=` aceptando id o slug. Eso solo es
    // seguro si los dos espacios de identificadores son disjuntos: si el slug
    // de un plan coincidiera con el id de otro, la URL sería ambigua y el
    // comprador podría acabar pagando otra tarifa.
    const catalogoLocal = PLANS.map((p) => ({ id: p.id, slug: p.slug }));
    const catalogoVivo = PLANS.map((p, i) => ({
      id: `aaaaaaaa-0000-4000-8000-00000000000${i + 1}`,
      slug: toPlanKey(p.name),
    }));

    for (const catalogo of [catalogoLocal, catalogoVivo]) {
      const ids = new Set(catalogo.map((p) => p.id));
      for (const plan of catalogo) {
        // Un plan puede tener id === slug (no es ambiguo: es el mismo plan);
        // lo que no puede es que su slug sea el id de OTRO.
        const choca = catalogo.some((otro) => otro.id === plan.slug && otro.id !== plan.id);
        expect(choca, `${plan.slug} choca con un id ajeno`).toBe(false);
      }
      expect(ids.size).toBe(catalogo.length);
    }
  });

  test("una clave inventada no cubre nada", () => {
    const francia = findCoverageCountry("Francia")!;
    expect(plansCovering(francia)).not.toContain("local-s");
    expect(destinationsForPlan("plan-que-no-existe")).toBe(39); // no excluido por nadie
  });
});

test.describe("las superficies consumen la fuente, no una copia", () => {
  const SUPERFICIES = [
    "src/components/landing/Benefits.tsx",
    "src/components/shared/CountriesModal.tsx",
    "src/lib/assistant/server/tools/check-coverage.ts",
  ];

  for (const ruta of SUPERFICIES) {
    const fuente = fs.readFileSync(path.join(process.cwd(), ruta), "utf8");

    test(`${ruta} importa de @/lib/coverage`, () => {
      expect(fuente).toMatch(/from ["']@\/lib\/coverage["']/);
    });

    test(`${ruta} no lleva su propia lista de países`, () => {
      const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      // Tres nombres bastan: una lista escrita a mano no puede omitirlos.
      for (const pais of ["Alemania", "Portugal", "Grecia"]) {
        expect(codigo, `${ruta} · ${pais}`).not.toContain(pais);
      }
    });
  }

  test("el modal cuenta los destinos, no los escribe", () => {
    // No se puede abrir en navegador: el modal existe en el hero pero hoy
    // ningún control lo abre (`setShowCountries` nunca se llama con `true`).
    // Es anterior a este trabajo; se verifica aquí a nivel de fuente.
    const modal = fs.readFileSync(
      path.join(process.cwd(), "src/components/shared/CountriesModal.tsx"),
      "utf8"
    );
    expect(modal).toContain("{TOTAL_DESTINATIONS} destinos");
    expect(modal).toContain("COVERAGE_COUNTRIES.map");
    expect(modal).toContain("No incluido en Europa Básico");
    expect(modal).toContain("plansExcluding(country)");
    // Nada de «39+»: la cifra es exacta o no se pone.
    expect(modal).not.toMatch(/\d+\s*\+\s*(países|destinos)/i);
  });
});

test.describe("la fuente no filtra identidad interna", () => {
  const raw = fs.readFileSync(RUTA, "utf8");

  test("no contiene UUIDs", () => {
    expect(raw).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  test("no contiene naming ni códigos de proveedor", () => {
    const prohibidos = ["vodafone", "local-s", "local-m", "local-l", "local-xl", "local-xxl", "tariff"];
    for (const termino of prohibidos) {
      expect(raw.toLowerCase(), termino).not.toContain(termino);
    }
  });

  test("no contiene tallas de operador", () => {
    for (const country of COVERAGE_COUNTRIES) {
      for (const key of country.excludedPlans) {
        expect(PLAN_KEYS as readonly string[]).toContain(key);
      }
    }
  });

  test("no guarda gigas: eso es del catálogo", () => {
    // Ojo: "GB" a secas SÍ aparece — es el código ISO del Reino Unido. Lo que
    // no puede aparecer es una cantidad de datos.
    expect(raw).not.toMatch(/\d+\s*GB/i);
    expect(raw).not.toMatch(/totalGb|outsideSpainMaxGb|data_gb|eu_data_gb/);
  });
});
