import { test, expect, Page } from "@playwright/test";

/**
 * Integración de la unificación de cobertura.
 *
 * Estos tests no comprueban la fuente de cobertura —de eso se encargan
 * `tests/unit/shared/coverage.spec.ts` y `tests/unit/assistant/sec-coverage.spec.ts`—
 * sino que la portada y el flujo de compra siguen funcionando después de
 * unificarla: que salen los cinco planes en el orden del catálogo, que el
 * buscador filtra donde debe y solo donde debe, y que al pulsar un plan se
 * llega a la compra.
 *
 * Lo que ya cubre `naming.spec.ts` (que `/es` y `/es/compra` responden, que no
 * se filtra naming interno en el HTML público, que los cinco nombres
 * comerciales aparecen en la portada) no se repite aquí.
 *
 * ── Por qué se dobla el catálogo ─────────────────────────────────────────────
 * La rejilla de planes de la portada se pinta en el navegador con lo que
 * devuelve el catálogo vivo. Sin credenciales de base de datos —el caso de este
 * entorno— esa llamada nunca llega a devolver nada y la rejilla se queda vacía,
 * con o sin estos cambios (comprobado también sobre HEAD). Para poder mirar la
 * rejilla hay que responder por el catálogo, y eso se hace aquí interceptando
 * la petición: ni se instala nada ni sale tráfico de la máquina.
 */

/**
 * El cliente de catálogo se construye con las variables públicas de la base de
 * datos y revienta si faltan, antes de llegar a su propio `try`. Sin ellas la
 * rejilla no se pinta y no hay nada que mirar, así que estos tests se saltan en
 * vez de fallar en falso. Para ejecutarlos basta con un destino cualquiera del
 * dominio permitido por la CSP —no se conecta a él, lo responde el doble:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://catalogo-doble.supabase.co \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=doble \
 *   npx playwright test coverage-integration.spec.ts
 */
const CATALOGO_CONSTRUIBLE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

test.skip(
  !CATALOGO_CONSTRUIBLE,
  "Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver cabecera)"
);

const PLANES_EN_ORDEN = [
  "Europa Básico",
  "Europa Plus",
  "Europa Total",
  "Europa Max",
  "Europa Premium",
];

/** Filas tal y como las devuelve el catálogo, sin metadata interna. */
const FILAS_CATALOGO = [
  { id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Europa Básico", price_usd: 29, eu_data_gb: 15, data_gb: 15, highlight: false },
  { id: "aaaaaaaa-0000-4000-8000-000000000002", name: "Europa Plus", price_usd: 39, eu_data_gb: 30, data_gb: 30, highlight: true },
  { id: "aaaaaaaa-0000-4000-8000-000000000003", name: "Europa Total", price_usd: 49, eu_data_gb: 60, data_gb: 60, highlight: false },
  { id: "aaaaaaaa-0000-4000-8000-000000000004", name: "Europa Max", price_usd: 59, eu_data_gb: 120, data_gb: 120, highlight: false },
  { id: "aaaaaaaa-0000-4000-8000-000000000005", name: "Europa Premium", price_usd: 69, eu_data_gb: 270, data_gb: 270, highlight: false },
];

/** El catálogo se pide desde el navegador; sin esto el preflight lo tumba. */
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

type Catalogo = "vivo" | "caido";

/**
 * Responde por el catálogo sin tocar la red.
 *
 * - `vivo`: el catálogo contesta y la portada pinta lo que venga de él.
 * - `caido`: contesta con error, que es como la portada acaba en el catálogo
 *   local de emergencia. Es el camino donde las claves comerciales importan.
 */
async function doblarCatalogo(page: Page, modo: Catalogo) {
  await page.route("**/rest/v1/tariffs*", (route) =>
    modo === "vivo"
      ? route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: CORS,
          body: JSON.stringify(FILAS_CATALOGO),
        })
      : route.fulfill({
          status: 500,
          contentType: "application/json",
          headers: CORS,
          body: JSON.stringify({ message: "catálogo no disponible" }),
        })
  );
}

/**
 * Las tarjetas del selector de planes del buscador —no las del bloque de
 * precios, que es otra sección y no filtra por país.
 */
function tarjetasDePlan(page: Page) {
  return page.locator('div.grid-cols-5 a[href^="/es/compra?plan="]');
}

function buscador(page: Page) {
  return page.locator('input[placeholder*="Buscar país"]').first();
}

async function irAPortada(page: Page, modo: Catalogo = "caido") {
  await doblarCatalogo(page, modo);
  await page.goto("/es", { waitUntil: "domcontentloaded" });
  await expect(tarjetasDePlan(page).first()).toBeVisible({ timeout: 20_000 });
}

async function nombresVisibles(page: Page) {
  return (await tarjetasDePlan(page).allTextContents()).map((t) =>
    t.replace(/\s+/g, " ").trim()
  );
}

test.describe("CI-001 · la portada muestra el catálogo entero", () => {
  for (const modo of ["vivo", "caido"] as const) {
    test(`los cinco planes, en el orden del catálogo (catálogo ${modo})`, async ({ page }) => {
      await irAPortada(page, modo);

      await expect(tarjetasDePlan(page)).toHaveCount(5);
      const nombres = await nombresVisibles(page);
      for (const [i, esperado] of PLANES_EN_ORDEN.entries()) {
        expect(nombres[i], `posición ${i}`).toContain(esperado);
      }
    });
  }

  test("con el catálogo local, el enlace lleva la clave comercial", async ({ page }) => {
    await irAPortada(page, "caido");

    const hrefs = await tarjetasDePlan(page).evaluateAll((nodos) =>
      nodos.map((n) => n.getAttribute("href") ?? "")
    );
    const claves = hrefs.map(
      (h) => new URL(h, "http://localhost").searchParams.get("plan") ?? ""
    );

    expect(claves).toEqual([
      "europa-basico",
      "europa-plus",
      "europa-total",
      "europa-max",
      "europa-premium",
    ]);
    // Ni identificador de mayorista ni talla de operador delante del comprador.
    for (const clave of claves) {
      expect(clave).not.toMatch(/^local-/);
    }
  });
});

test.describe("CI-002 · el buscador de países", () => {
  test("buscar Francia no oculta ningún plan", async ({ page }) => {
    await irAPortada(page);

    await buscador(page).fill("Francia");
    await expect(tarjetasDePlan(page)).toHaveCount(5);
  });

  test.describe("Estados Unidos oculta Europa Básico, y solo ese", () => {
    for (const forma of ["Estados Unidos", "EEUU", "USA", "US"]) {
      test(`escrito «${forma}»`, async ({ page }) => {
        await irAPortada(page);

        await buscador(page).fill(forma);
        await expect(tarjetasDePlan(page)).toHaveCount(4);

        const texto = (await nombresVisibles(page)).join(" | ");
        expect(texto).not.toContain("Europa Básico");
        for (const plan of PLANES_EN_ORDEN.slice(1)) {
          expect(texto, plan).toContain(plan);
        }
      });
    }
  });

  test("la excepción también se aplica con el catálogo vivo", async ({ page }) => {
    // El filtro va por la clave derivada del nombre comercial, no por el
    // identificador de la fila: da igual de qué fuente venga el plan.
    await irAPortada(page, "vivo");

    await buscador(page).fill("EEUU");
    await expect(tarjetasDePlan(page)).toHaveCount(4);
    expect((await nombresVisibles(page)).join(" | ")).not.toContain("Europa Básico");
  });

  test("una consulta parcial no oculta nada", async ({ page }) => {
    await irAPortada(page);

    // El fallo que tenía el buscador: cuatro letras bastaban para que «esta»
    // disparara el filtro de Estados Unidos y escondiera el plan más barato.
    for (const parcial of ["esta", "franc", "u"]) {
      await buscador(page).fill(parcial);
      await expect(tarjetasDePlan(page), parcial).toHaveCount(5);
    }
  });

  test("un país fuera de la lista no oculta planes", async ({ page }) => {
    await irAPortada(page);

    await buscador(page).fill("Marruecos");
    await expect(tarjetasDePlan(page)).toHaveCount(5);
    await expect(page.getByText("No encontramos ese país")).toBeVisible();
  });

  test("vaciar la búsqueda devuelve los cinco planes", async ({ page }) => {
    await irAPortada(page);

    await buscador(page).fill("EEUU");
    await expect(tarjetasDePlan(page)).toHaveCount(4);

    await buscador(page).fill("");
    await expect(tarjetasDePlan(page)).toHaveCount(5);
  });
});

test.describe("CI-003 · de la portada a la compra", () => {
  test("pulsar un plan lleva al flujo de compra", async ({ page }) => {
    await irAPortada(page);

    const tarjeta = tarjetasDePlan(page).nth(1); // Europa Plus
    await tarjeta.click();

    await page.waitForURL("**/compra?plan=europa-plus", { timeout: 20_000 });
    await expect(page.getByText("Europa Plus").first()).toBeVisible({ timeout: 20_000 });
  });

  /**
   * Las dos identidades con las que puede llegar `?plan=`.
   *
   * El enlace del buscador lleva la clave comercial (`europa-plus`); el del
   * bloque de precios lleva el identificador de la fila del catálogo —un UUID
   * en producción, el identificador heredado cuando se sirve el catálogo local.
   * Las dos tienen que abrir la compra en el paso de datos, con el plan puesto:
   * si no, el comprador que ya eligió tiene que volver a elegir.
   *
   * El paso 2 se reconoce por «Tu información básica»; el paso 1 vuelve a
   * mostrar el selector de planes.
   */
  test("el plan llega preseleccionado desde la clave comercial", async ({ page }) => {
    await irAPortada(page);
    await tarjetasDePlan(page).nth(1).click(); // Europa Plus
    await page.waitForURL("**/compra?plan=europa-plus", { timeout: 20_000 });

    await expect(page.getByText("Tu información básica")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Europa Plus").first()).toBeVisible();
  });

  test("el plan llega preseleccionado desde el identificador de la fila", async ({ page }) => {
    // Este entorno sirve el catálogo local, cuyo identificador de fila no es un
    // UUID; el camino de código que se ejerce es el mismo que en producción.
    await page.goto("/es/compra?plan=local-m", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Tu información básica")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Europa Plus").first()).toBeVisible();
  });

  test("una clave desconocida en la URL no rompe la compra", async ({ page }) => {
    const respuesta = await page.goto("/es/compra?plan=clave-que-no-existe", {
      waitUntil: "domcontentloaded",
    });
    expect(respuesta?.status()).toBeLessThan(400);
    // Degrada al selector de planes en vez de romperse.
    await expect(page.getByText("Europa Básico").first()).toBeVisible({ timeout: 20_000 });
  });
});
