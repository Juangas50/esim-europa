import { test, expect, Page } from "@playwright/test";

/**
 * El buscador de cobertura, de punta a punta.
 *
 * Este fichero existía antes y estaba verde mientras la rejilla de planes
 * aparecía vacía en producción. El agujero era el propio test: doblaba la
 * respuesta del catálogo e inyectaba las variables públicas de la base de
 * datos, así que esquivaba por construcción la única condición que rompía —que
 * el navegador no pudiera construir su cliente— y encima se saltaba entero
 * cuando esas variables faltaban, que era justo el caso roto.
 *
 * Ahora el catálogo llega del servidor como props, así que no hay nada que
 * doblar ni ninguna condición que saltarse: si la portada carga, la rejilla
 * tiene planes. Estos tests corren siempre.
 *
 * Lo que ya cubre `naming.spec.ts` no se repite aquí.
 */

const PLANES_EN_ORDEN = [
  "Europa Básico",
  "Europa Plus",
  "Europa Total",
  "Europa Max",
  "Europa Premium",
];

const SIN_BASICO = PLANES_EN_ORDEN.slice(1);

/** Destinos que cubren las cinco gamas, uno por familia de la lista. */
const CUBIERTOS_POR_TODOS = [
  "Francia",
  "Reino Unido",
  "Turquía",
  "Ucrania",
  "Moldavia",
  "Kosovo",
  "Vaticano",
  "Mónaco",
];

/** Las cuatro formas en que alguien escribe Estados Unidos. */
const FORMAS_DE_EEUU = ["Estados Unidos", "EEUU", "USA", "US"];

/**
 * Las tarjetas del selector del buscador. No las del bloque de precios, que es
 * otra sección y no filtra por país.
 */
function tarjetasDePlan(page: Page) {
  return page.locator('div.grid-cols-5 a[href*="/compra?plan="]');
}

function buscador(page: Page) {
  return page.locator('input[placeholder*="Buscar país"]').first();
}

/** El desplegable: sugerencias o el aviso. Solo se pinta desde React. */
function desplegable(page: Page) {
  return page.getByText(/4G\/5G|No encontramos ese país/).first();
}

/**
 * Espera a que el buscador esté vivo, no solo pintado.
 *
 * Hace falta desde que las cards vienen servidas en el HTML: antes solo
 * aparecían cuando el navegador terminaba de cargar el catálogo, así que verlas
 * implicaba que la página ya estaba hidratada. Ahora se ven desde el primer
 * pintado, y escribir antes de que React enganche su listener deja el texto
 * puesto sin que el filtro se entere. Peor: reescribir el mismo valor no
 * dispara ningún evento, así que reintentar tal cual no desbloquea nada — hay
 * que vaciar y volver a escribir.
 */
async function asegurarHidratado(page: Page) {
  const input = buscador(page);

  await expect(async () => {
    await input.fill("");
    await input.fill("Francia");
    await expect(desplegable(page)).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 20_000 });

  await input.fill("");
  await expect(desplegable(page)).toBeHidden();
}

async function irAPortada(page: Page, locale: "es" | "pt" = "es") {
  await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
  await expect(tarjetasDePlan(page).first()).toBeVisible({ timeout: 20_000 });
  await asegurarHidratado(page);
}

async function buscar(page: Page, texto: string) {
  await buscador(page).fill(texto);
  await expect(buscador(page)).toHaveValue(texto);
}

async function nombresVisibles(page: Page) {
  return (await tarjetasDePlan(page).allTextContents()).map((t) =>
    t.replace(/\s+/g, " ").trim()
  );
}

/** Comprueba el resultado de una consulta: cuántas gamas y cuáles. */
async function esperarGamas(page: Page, esperadas: string[], contexto: string) {
  await expect(tarjetasDePlan(page), contexto).toHaveCount(esperadas.length);
  const texto = (await nombresVisibles(page)).join(" | ");
  for (const gama of PLANES_EN_ORDEN) {
    if (esperadas.includes(gama)) {
      expect(texto, `${contexto}: falta ${gama}`).toContain(gama);
    } else {
      expect(texto, `${contexto}: sobra ${gama}`).not.toContain(gama);
    }
  }
}

test.describe("CI-001 · la portada trae el catálogo hecho", () => {
  test("carga con las cinco gamas, en el orden del catálogo", async ({ page }) => {
    await irAPortada(page);

    await expect(tarjetasDePlan(page)).toHaveCount(5);
    const nombres = await nombresVisibles(page);
    for (const [i, esperado] of PLANES_EN_ORDEN.entries()) {
      expect(nombres[i], `posición ${i}`).toContain(esperado);
    }
  });

  test("las cards ya están en el HTML, sin esperar a ninguna consulta", async ({ page }) => {
    // La regresión que arreglamos: la rejilla se pintaba vacía y se rellenaba
    // después, si es que se rellenaba. Ahora viene servida.
    await page.goto("/es", { waitUntil: "domcontentloaded" });
    await expect(tarjetasDePlan(page)).toHaveCount(5, { timeout: 5_000 });
  });

  test("el buscador y el bloque de precios cuentan lo mismo", async ({ page }) => {
    // Misma fuente, un solo catálogo: si discreparan, una de las dos secciones
    // estaría sirviendo algo distinto.
    await irAPortada(page);

    const delBuscador = await nombresVisibles(page);
    const delBloque = await page
      .locator('a[href*="/compra?plan="]')
      .filter({ hasText: /Elegir plan/i })
      .count();

    expect(delBuscador).toHaveLength(5);
    expect(delBloque).toBe(5);

    for (const gama of PLANES_EN_ORDEN) {
      expect(delBuscador.join(" | "), gama).toContain(gama);
      await expect(page.getByText(gama).first(), gama).toBeVisible();
    }
  });
});

test.describe("CI-002 · el buscador filtra por cobertura", () => {
  for (const pais of CUBIERTOS_POR_TODOS) {
    test(`${pais} mantiene las cinco`, async ({ page }) => {
      await irAPortada(page);
      await buscar(page, pais);
      await esperarGamas(page, PLANES_EN_ORDEN, pais);
    });
  }

  for (const forma of FORMAS_DE_EEUU) {
    test(`«${forma}» deja cuatro y quita solo Europa Básico`, async ({ page }) => {
      await irAPortada(page);
      await buscar(page, forma);
      await esperarGamas(page, SIN_BASICO, forma);
    });
  }

  test("escribir a medias basta cuando no hay duda", async ({ page }) => {
    await irAPortada(page);

    // Si de los 39 destinos solo uno empieza así, no hace falta terminar la
    // palabra para ver su cobertura.
    for (const parcial of ["estados", "estados uni", "estados unido", "esta"]) {
      await buscar(page, parcial);
      await esperarGamas(page, SIN_BASICO, `a medias «${parcial}»`);
    }
  });

  test("escribir a medias un destino de todos los planes no quita nada", async ({ page }) => {
    await irAPortada(page);

    for (const parcial of ["franc", "turqu", "reino un", "ital"]) {
      await buscar(page, parcial);
      await esperarGamas(page, PLANES_EN_ORDEN, `a medias «${parcial}»`);
    }
  });

  test("una consulta ambigua no oculta nada", async ({ page }) => {
    await irAPortada(page);

    // Varios países la cumplen: mientras haya duda, no se decide por nadie.
    for (const ambigua of ["a", "u", "e", "an"]) {
      await buscar(page, ambigua);
      await esperarGamas(page, PLANES_EN_ORDEN, `ambigua «${ambigua}»`);
    }
  });

  test("dos caracteres nunca ocultan un plan", async ({ page }) => {
    await irAPortada(page);

    // «eu» solo casa con el alias de Estados Unidos, pero quien lo teclea está
    // empezando a escribir «Europa». Es justo el momento en que esconder el
    // plan Básico sería más absurdo.
    for (const corta of ["eu", "me", "of", "uu"]) {
      await buscar(page, corta);
      await esperarGamas(page, PLANES_EN_ORDEN, `corta «${corta}»`);
    }
  });

  test("un trozo suelto de un nombre no oculta nada", async ({ page }) => {
    await irAPortada(page);

    // «dos» solo aparece en «Estados Unidos», pero no es el principio de nada.
    for (const trozo of ["dos", "idos", "tad", "ric"]) {
      await buscar(page, trozo);
      await esperarGamas(page, PLANES_EN_ORDEN, `trozo «${trozo}»`);
    }
  });

  test("un país fuera de la lista no oculta nada", async ({ page }) => {
    await irAPortada(page);

    for (const fuera of ["Marruecos", "Japón", "Freedonia", "zzzz"]) {
      await buscar(page, fuera);
      await esperarGamas(page, PLANES_EN_ORDEN, `desconocido «${fuera}»`);
    }
    await expect(page.getByText("No encontramos ese país")).toBeVisible();
  });

  test("vaciar la búsqueda restaura las cinco", async ({ page }) => {
    await irAPortada(page);

    await buscar(page, "EEUU");
    await esperarGamas(page, SIN_BASICO, "EEUU");

    await buscar(page, "");
    await esperarGamas(page, PLANES_EN_ORDEN, "búsqueda vacía");
  });
});

test.describe("CI-003 · las dos lenguas", () => {
  for (const locale of ["es", "pt"] as const) {
    test(`/${locale}: cinco gamas, y Estados Unidos deja cuatro`, async ({ page }) => {
      await irAPortada(page, locale);

      await expect(tarjetasDePlan(page)).toHaveCount(5);
      // El nombre comercial no se traduce: es el mismo producto.
      const nombres = await nombresVisibles(page);
      for (const [i, esperado] of PLANES_EN_ORDEN.entries()) {
        expect(nombres[i], `${locale} · posición ${i}`).toContain(esperado);
      }

      await buscar(page, "Estados Unidos");
      await esperarGamas(page, SIN_BASICO, `${locale} · Estados Unidos`);

      // Y el enlace respeta la lengua desde la que se compra.
      const href = await tarjetasDePlan(page).first().getAttribute("href");
      expect(href, locale).toContain("/compra?plan=");
    });
  }
});

test.describe("CI-004 · de la portada a la compra", () => {
  test("la card lleva a la compra con su plan", async ({ page }) => {
    await irAPortada(page);

    const tarjeta = tarjetasDePlan(page).nth(1); // Europa Plus
    await tarjeta.click();

    await page.waitForURL("**/compra?plan=*", { timeout: 20_000 });
    await expect(page.getByText("Tu información básica")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Europa Plus").first()).toBeVisible();
  });

  test("cada card lleva a su gama, sin cruces", async ({ page }) => {
    // Si un identificador resolviera al plan de otro, se vería aquí: se compra
    // una tarifa distinta de la que se pulsó.
    await irAPortada(page);
    const enlaces = await tarjetasDePlan(page).evaluateAll((nodos) =>
      nodos.map((n) => ({
        href: n.getAttribute("href") ?? "",
        nombre: (n.textContent ?? "").replace(/\s+/g, " ").trim(),
      }))
    );

    for (const [i, enlace] of enlaces.entries()) {
      const gama = PLANES_EN_ORDEN[i];
      expect(enlace.nombre, `card ${i}`).toContain(gama);

      await page.goto(enlace.href, { waitUntil: "domcontentloaded" });
      await expect(page.getByText("Tu información básica"), gama).toBeVisible({
        timeout: 20_000,
      });
      const resumen = await page.locator("body").innerText();
      expect(resumen, `${gama}: el resumen no coincide`).toContain(gama);
      for (const otra of PLANES_EN_ORDEN.filter((g) => g !== gama)) {
        expect(resumen, `${gama}: el resumen menciona ${otra}`).not.toContain(otra);
      }
    }
  });

  test("una clave desconocida no rompe la compra", async ({ page }) => {
    const respuesta = await page.goto("/es/compra?plan=clave-que-no-existe", {
      waitUntil: "domcontentloaded",
    });
    expect(respuesta?.status()).toBeLessThan(400);
    await expect(page.getByText("Europa Básico").first()).toBeVisible({ timeout: 20_000 });
  });

  test("la clave comercial también preselecciona", async ({ page }) => {
    await page.goto("/es/compra?plan=europa-plus", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Tu información básica")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Europa Plus").first()).toBeVisible();
  });
});
