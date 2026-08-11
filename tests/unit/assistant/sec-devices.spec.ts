import "./_no-network";

import { test, expect } from "@playwright/test";
import { z } from "zod";

import { lookupDevice } from "@/lib/assistant/server/devices";
import { checkDeviceCompatibilityTool } from "@/lib/assistant/server/tools/check-device-compatibility";
import { executeTool } from "@/lib/assistant/server/tools";

/**
 * Compatibilidad de dispositivos.
 *
 * Dos cosas que verificar. Que reconoce lo que tiene que reconocer, incluso
 * cuando la pregunta llega en forma de frase suelta y no de nombre de catálogo.
 * Y —lo que de verdad importa— que **nunca** dice que un móvil no sirve.
 */

const ctx = { locale: "es" as const };

test.describe("reconoce modelos", () => {
  const consultas: Array<[string, string]> = [
    ["iphone 15", "Apple"],
    ["iPhone 15", "Apple"],
    ["iphone15", "Apple"],
    ["tengo iphone 15 sirve?", "Apple"],
    ["hola, tengo un iPhone 15 Pro Max, ¿me sirve?", "Apple"],
    ["mi celular es un galaxy s23 ultra", "Samsung"],
    ["Galaxy S24 5G", "Samsung"],
    ["pixel 8 pro", "Google"],
    ["tengo un Xperia 1 V", "Sony"],
    ["Nothing Phone 4a Pro", "Nothing Phone"],
  ];

  for (const [consulta, marca] of consultas) {
    test(`"${consulta}" → compatible (${marca})`, async () => {
      const out = await checkDeviceCompatibilityTool.execute({ device: consulta }, ctx);
      expect(out.status).toBe("supported");
      if (out.status !== "supported") return;
      expect(out.brand).toBe(marca);
      expect(out.matchedModels.length).toBeGreaterThan(0);
    });
  }

  test("no confunde el modelo base con la variante Pro", () => {
    const out = lookupDevice("iphone 15");
    expect(out.status).toBe("supported");
    if (out.status !== "supported") return;
    expect(out.matchedModels).toContain("iPhone 15");
    expect(out.matchedModels).not.toContain("iPhone 15 Pro");
  });

  test("elige la variante más específica cuando el usuario la nombra", () => {
    const out = lookupDevice("iphone 15 pro max");
    expect(out.status).toBe("supported");
    if (out.status !== "supported") return;
    expect(out.matchedModels).toEqual(["iPhone 15 Pro Max"]);
  });

  test("resuelve una familia entera cuando el usuario no da la generación", () => {
    const out = lookupDevice("iphone se");
    expect(out.status).toBe("supported");
    if (out.status !== "supported") return;
    expect(out.matchType).toBe("family");
  });

  test("el 5G sobra o falta sin cambiar el resultado", () => {
    expect(lookupDevice("galaxy s24").status).toBe("supported");
    expect(lookupDevice("galaxy s24 5g").status).toBe("supported");
  });

  test("avisa del caso especial del iPhone 16 sin ranura física", () => {
    const out = lookupDevice("iphone 16");
    expect(out.status).toBe("supported");
    if (out.status !== "supported") return;
    expect(out.notes.join(" ")).toContain("eSIM");
  });
});

test.describe("nunca dice que un móvil no sirve", () => {
  const desconocidos = [
    "iphone 6",
    "un nokia viejo",
    "Blackberry Bold",
    "no me acuerdo del modelo",
    "un android",
    "Samsung Galaxy J5",
    "Xiaomi Redmi 9A",
  ];

  for (const consulta of desconocidos) {
    test(`"${consulta}" → unknown, nunca incompatible`, async () => {
      const out = await checkDeviceCompatibilityTool.execute({ device: consulta }, ctx);
      expect(["supported", "unknown"]).toContain(out.status);
      if (out.status === "unknown") {
        expect(out.howToVerify.method).toContain("*#06#");
        expect(out.howToVerify.indicator.toUpperCase()).toContain("EID");
      }
    });
  }

  test("una marca sola no basta para confirmar", () => {
    // "Tengo un iPhone" no se puede responder: hay iPhones sin eSIM.
    const out = lookupDevice("tengo un iphone");
    expect(out.status).toBe("unknown");
  });

  test("pero sí se reconoce la marca, para poder decir algo útil", () => {
    const out = lookupDevice("tengo un iphone");
    if (out.status !== "unknown") return;
    expect(out.brandRecognized).toBe("Apple");
  });

  test("el esquema de salida no admite un estado de incompatibilidad", () => {
    const serializado = JSON.stringify(z.toJSONSchema(checkDeviceCompatibilityTool.result));
    expect(serializado).toContain("supported");
    expect(serializado).toContain("unknown");
    expect(serializado).not.toContain("not_supported");
    expect(serializado).not.toContain("incompatible");
  });

  test("un resultado de incompatibilidad no pasa la validación de salida", () => {
    const falso = { status: "not_supported", brand: "Apple" };
    expect(checkDeviceCompatibilityTool.result.safeParse(falso).success).toBe(false);
  });

  test("la descripción que lee el modelo dice explícitamente que no puede", () => {
    expect(checkDeviceCompatibilityTool.description.toLowerCase()).toContain("nunca");
  });
});

test.describe("borde de entrada", () => {
  test("rechaza una consulta demasiado corta o demasiado larga", async () => {
    await expect(executeTool("check_device_compatibility", { device: "x" }, ctx)).rejects.toThrow(
      /invalid_tool_input/
    );
    await expect(
      executeTool("check_device_compatibility", { device: "a".repeat(200) }, ctx)
    ).rejects.toThrow(/invalid_tool_input/);
  });

  test("una consulta que es puro relleno no inventa una coincidencia", () => {
    const out = lookupDevice("hola tengo un movil");
    expect(out.status).toBe("unknown");
  });
});
