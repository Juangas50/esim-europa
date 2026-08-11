import { defineConfig } from "@playwright/test";

/**
 * Configuración de los tests unitarios del asistente.
 *
 * Aparte de la de QA (`playwright.config.ts`) y por un motivo concreto: aquella
 * arranca `next dev` en el puerto 3002 y abre un navegador. Estos tests no
 * necesitan ninguna de las dos cosas — son funciones puras, esquemas y un
 * proveedor de mentira— y además **no deben** tener un servidor delante: parte
 * de lo que verifican es que la Fase 2A no abre un socket.
 *
 * Se reutiliza el runner de Playwright en vez de instalar Vitest o Jest porque
 * ya está en el proyecto, entiende TypeScript y respeta el alias `@/*` del
 * tsconfig. Una dependencia menos que auditar.
 */
export default defineConfig({
  testDir: "./tests/unit",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
});
