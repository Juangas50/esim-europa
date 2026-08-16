import "../assistant/_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { COVERAGE_COUNTRIES, TOTAL_DESTINATIONS } from "@/lib/coverage";
import { PLAN_KEYS } from "@/lib/plan-key";

/**
 * Lo que Ruta34 afirma en público.
 *
 * Durante la Fase 2A aparecieron claims que ya no eran ciertos: «30 países»
 * escrito a mano en ocho sitios, testimonios que citaban tallas del mayorista y
 * dos direcciones de soporte distintas. Ninguno era un fallo de código y por
 * eso ninguna prueba los veía.
 *
 * Estos tests no comparan contra una lista de cadenas prohibidas inventada
 * aquí: comparan contra las fuentes de verdad —`coverage.json` para la
 * cobertura, `plan-key.ts` para los nombres comerciales— de modo que cuando la
 * realidad cambie, lo que falle sea la copia desactualizada y no el test.
 */

const RAIZ = process.cwd();

/** Superficies que ve un comprador. Admin y partner quedan fuera a propósito. */
const SUPERFICIES_PUBLICAS = [
  "src/app/[locale]",
  "src/components/landing",
  "src/components/seo",
  "src/components/shared",
  "src/components/geo",
  "src/components/purchase",
  "src/components/ui",
  "messages",
];

function ficherosDe(dir: string): string[] {
  const absoluto = path.join(RAIZ, dir);
  if (!fs.existsSync(absoluto)) return [];
  const salida: string[] = [];
  for (const entrada of fs.readdirSync(absoluto, { withFileTypes: true })) {
    const relativo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) salida.push(...ficherosDe(relativo));
    else if (/\.(tsx?|json)$/.test(entrada.name)) salida.push(relativo);
  }
  return salida;
}

const PUBLICOS = SUPERFICIES_PUBLICAS.flatMap(ficherosDe);

/** Un comentario no lo lee nadie: solo se audita lo que puede acabar en pantalla. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const leer = (ruta: string) => sinComentarios(fs.readFileSync(path.join(RAIZ, ruta), "utf8"));

test("hay superficies públicas que auditar", () => {
  expect(PUBLICOS.length).toBeGreaterThan(20);
});

// ── Cobertura ─────────────────────────────────────────────────────────────────

test.describe("las cifras de cobertura salen de la fuente", () => {
  /** Cualquier «N países» o «N destinos» escrito a mano. */
  const CIFRA_DE_COBERTURA = /(\d+)\s*\+?\s*(?:países|paises|destinos)/gi;

  /**
   * Excepciones, cada una con su motivo. No es una lista de perdón: es la
   * relación de sitios donde una cifra distinta es correcta o está congelada
   * esperando una decisión.
   */
  const EXCEPCIONES: { archivo: string; cifra: number; motivo: string }[] = [
    {
      archivo: "src/components/ui/CallsTooltip.tsx",
      cifra: 60,
      motivo: "destinos de llamadas internacionales incluidas, no cobertura de datos",
    },
    {
      archivo: "src/components/landing/PlanCard.tsx",
      cifra: 60,
      motivo: "destinos de llamadas internacionales incluidas, no cobertura de datos",
    },
    {
      archivo: "src/app/[locale]/terminos/page.tsx",
      cifra: 30,
      motivo:
        "«más de 30 países» es un mínimo y sigue siendo cierto con 39; es texto legal " +
        "y su redacción no se cambia sin revisión",
    },
  ];

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = leer(archivo);
      for (const [texto, cifraTexto] of fuente.matchAll(CIFRA_DE_COBERTURA)) {
        const cifra = Number(cifraTexto);
        if (cifra === TOTAL_DESTINATIONS) continue;

        const permitida = EXCEPCIONES.find((e) => e.archivo === archivo && e.cifra === cifra);
        expect(
          permitida,
          `«${texto.trim()}» en ${archivo}: la cobertura son ${TOTAL_DESTINATIONS} destinos ` +
            `(${COVERAGE_COUNTRIES.length} en coverage.json). Si la cifra es correcta por otro ` +
            `motivo, decláralo en EXCEPCIONES con su razón.`
        ).toBeTruthy();
      }
    });
  }

  test("las excepciones declaradas siguen existiendo", () => {
    // Una excepción que ya no aplica es basura que tapa el siguiente fallo.
    for (const excepcion of EXCEPCIONES) {
      const fuente = leer(excepcion.archivo);
      expect(
        fuente,
        `sobra la excepción de ${excepcion.archivo} (${excepcion.cifra}): ya no aparece`
      ).toMatch(new RegExp(`${excepcion.cifra}\\s*\\+?\\s*(?:países|paises|destinos)`, "i"));
    }
  });

  test("no queda ninguna lista de países escrita a mano", () => {
    // Cinco nombres seguidos separados por comas es una lista, y las listas de
    // cobertura solo pueden vivir en `coverage.json`.
    const nombres = COVERAGE_COUNTRIES.map((c) => c.name);
    for (const archivo of PUBLICOS) {
      if (archivo.startsWith("src/app/[locale]/destinos")) continue; // páginas por destino
      if (archivo.endsWith("terminos/page.tsx")) continue; // texto legal, congelado
      const fuente = leer(archivo);
      const mencionados = nombres.filter((n) => fuente.includes(`${n},`));
      expect(
        mencionados.length,
        `${archivo} enumera ${mencionados.length} países: ${mencionados.slice(0, 6).join(", ")}…`
      ).toBeLessThan(5);
    }
  });
});

// ── Naming comercial ──────────────────────────────────────────────────────────

test.describe("naming comercial", () => {
  /** Restos del mayorista y de la nomenclatura anterior. */
  const PROHIBIDO = [
    /\bSIM Local\b/,
    /\bLocal\s+(S|M|L|XL|XXL)\b/,
    /\blocal-(s|m|l|xl|xxl)\b/i,
    /\bvodafone/i,
    /\bprovisioning_?code\b/i,
    /\btalla\b/i,
  ];

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = leer(archivo);
      for (const patron of PROHIBIDO) {
        expect(fuente, `${archivo} contra ${patron}`).not.toMatch(patron);
      }
    });
  }

  test("los nombres que se muestran son los cinco comerciales", () => {
    // Los testimonios citan el plan comprado: tiene que ser un nombre vivo.
    const testimonios = leer("src/components/landing/Testimonials.tsx");
    const citados = [...testimonios.matchAll(/plan:\s*"([^"·]+)/g)].map((m) => m[1].trim());
    expect(citados.length).toBeGreaterThan(0);

    const vigentes = PLAN_KEYS.map((k) =>
      k.replace(/^europa-/, "Europa ").replace(/^(Europa )(\w)/, (_, p, c) => p + c.toUpperCase())
    );
    for (const citado of citados) {
      expect(
        vigentes.some((v) => v.toLowerCase() === citado.toLowerCase()),
        `«${citado}» no es un nombre comercial vigente (${vigentes.join(", ")})`
      ).toBe(true);
    }
  });
});

// ── Contacto ──────────────────────────────────────────────────────────────────

test.describe("el email de soporte es uno solo", () => {
  const SOPORTE = "soporte@esimruta34.com";

  /** Direcciones que no son atención al cliente y por tanto no se tocan. */
  const NO_ES_SOPORTE = [
    /@(ejemplo|example)\.com/i, // placeholders de formularios
    /@agencia\.com/i, // ejemplos del alta de partners
  ];

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = leer(archivo);
      const emails = [...fuente.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)].map(
        (m) => m[0]
      );
      for (const email of emails) {
        if (NO_ES_SOPORTE.some((p) => p.test(email))) continue;
        expect(
          email.toLowerCase(),
          `${archivo} publica ${email}; el soporte público es ${SOPORTE}`
        ).toBe(SOPORTE);
      }
    });
  }

  test("y aparece donde el comprador lo busca", () => {
    for (const archivo of [
      "src/components/landing/Footer.tsx",
      "src/components/landing/Contact.tsx",
      "src/components/geo/GeoBlockedPage.tsx",
    ]) {
      expect(leer(archivo), archivo).toContain(SOPORTE);
    }
  });
});

// ── ES / PT ───────────────────────────────────────────────────────────────────

test.describe("las dos lenguas dicen lo mismo", () => {
  const es = JSON.parse(fs.readFileSync(path.join(RAIZ, "messages/es.json"), "utf8"));
  const pt = JSON.parse(fs.readFileSync(path.join(RAIZ, "messages/pt.json"), "utf8"));

  function claves(objeto: unknown, prefijo = ""): string[] {
    if (typeof objeto !== "object" || objeto === null) return [prefijo];
    return Object.entries(objeto).flatMap(([k, v]) =>
      claves(v, prefijo ? `${prefijo}.${k}` : k)
    );
  }

  /**
   * Divergencia que ya existía antes de esta limpieza.
   *
   * Traducirla es escribir copy nuevo, no corregir un dato, así que queda
   * fuera de este trabajo. Se fija aquí como línea base: no se puede reducir
   * sin tocar este fichero, pero sobre todo no puede crecer sin que falle.
   */
  const DESAJUSTE_CONOCIDO = {
    soloEs: [
      "faq.items.international_calls.q",
      "faq.items.international_calls.a",
      "footer.links.about",
      "about.title",
      "about.description",
    ],
    soloPt: ["faq.items.diff.q", "faq.items.diff.a"],
  };

  test("no aparecen claves nuevas sin traducir", () => {
    const soloEs = claves(es).filter((k) => !claves(pt).includes(k));
    const soloPt = claves(pt).filter((k) => !claves(es).includes(k));
    expect({ soloEs, soloPt }).toEqual(DESAJUSTE_CONOCIDO);
  });

  test("las claves que tocamos están en las dos lenguas", () => {
    for (const clave of [
      "benefits.items.coverage.desc",
      "plans.coverage",
      "plans.tabDataSub",
      "plans.dataonly.desc",
    ]) {
      expect(claves(es), `es: ${clave}`).toContain(clave);
      expect(claves(pt), `pt: ${clave}`).toContain(clave);
    }
  });

  test("ninguna de las dos arrastra una cifra de cobertura vieja", () => {
    for (const [lengua, datos] of [["es", es], ["pt", pt]] as const) {
      const texto = JSON.stringify(datos);
      for (const [claim, cifra] of texto.matchAll(/(\d+)\s*\+?\s*(?:países|paises)/gi)) {
        expect(Number(cifra), `${lengua}: «${claim}»`).toBe(TOTAL_DESTINATIONS);
      }
    }
  });
});
