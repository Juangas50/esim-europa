import "./_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import dns from "node:dns";

import { NetworkAccessError } from "./_no-network";
import { AVAILABLE_PROVIDERS, createProvider } from "@/lib/assistant/server/provider";

/**
 * El candado, y la comprobación de que nadie se lo salta.
 *
 * Dos mitades. La primera verifica que el candado cierra: si algo intenta salir
 * a la red, revienta. La segunda verifica que está puesto en todos los tests de
 * la carpeta — un candado que solo protege el archivo donde está no protege
 * nada, y es exactamente el tipo de garantía que se pierde el día que alguien
 * añade un test nuevo y copia mal la cabecera.
 */

test.describe("candado de red", () => {
  test("fetch está bloqueado", async () => {
    await expect(fetch("https://api.example.com/v1/messages")).rejects.toThrow(NetworkAccessError);
  });

  test("http y https están bloqueados", () => {
    expect(() => http.request("http://example.com")).toThrow(NetworkAccessError);
    expect(() => https.request("https://example.com")).toThrow(NetworkAccessError);
  });

  test("los sockets y el DNS están bloqueados", () => {
    expect(() => net.connect(443, "example.com")).toThrow(NetworkAccessError);
    expect(() => dns.lookup("example.com", () => {})).toThrow(NetworkAccessError);
  });

  test("el mensaje de error nombra el destino, para poder depurarlo", async () => {
    await expect(fetch("https://catalogo.interno/tariffs")).rejects.toThrow(/catalogo\.interno/);
  });
});

test.describe("cobertura del candado", () => {
  test("todos los specs de la suite lo importan", () => {
    // Recorre el árbol entero de `tests/unit`, no solo esta carpeta: el día que
    // alguien añada un directorio nuevo, sus specs también quedan cubiertos.
    const raiz = path.resolve(__dirname, "..");

    const specs: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".spec.ts")) specs.push(full);
      }
    };
    walk(raiz);

    expect(specs.length).toBeGreaterThan(1);

    const sinCandado = specs.filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      // Tiene que ser la primera línea de código: importar el candado después de
      // otro módulo deja una ventana en la que ese módulo ya se ha ejecutado.
      const firstImport = source.split("\n").find((l) => l.trim().startsWith("import"));
      return !firstImport?.includes("_no-network");
    });

    expect(
      sinCandado.map((f) => path.relative(raiz, f)),
      "specs que no instalan el candado de red primero"
    ).toEqual([]);
  });
});

test.describe("proveedores disponibles", () => {
  test("en Fase 2A solo existe el proveedor de pruebas", () => {
    expect(AVAILABLE_PROVIDERS).toEqual(["fake"]);
  });

  test("pedir cualquier otro proveedor falla en vez de caer en uno real", () => {
    // El cast es el escenario que se quiere cubrir: alguien forzando el tipo.
    expect(() => createProvider("anthropic" as never)).toThrow(/no disponible/);
    expect(() => createProvider("openai" as never)).toThrow(/no disponible/);
  });

  test("el proveedor de pruebas no tiene cliente HTTP", async () => {
    const provider = createProvider("fake");
    // Si tuviese uno, esta llamada saldría a la red y el candado la cazaría.
    const res = await provider.complete({
      system: "s",
      messages: [{ role: "user", content: [{ type: "text", text: "hola" }] }],
      tools: [],
      maxOutputTokens: 10,
    });
    expect(res.stopReason).toBe("end_turn");
  });
});
