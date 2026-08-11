import "./_no-network";

import { test, expect } from "@playwright/test";

import { sanitizeForModel } from "@/lib/assistant/server/sanitize";

/**
 * El sanitizador, medido por sus dos fallos posibles.
 *
 * Un sanitizador se puede equivocar en dos direcciones y las dos son graves. Si
 * deja pasar un ICCID, mandamos el identificador de la SIM de un cliente a un
 * tercero. Si se lleva por delante "270 GB" o "28 días", el asistente deja de
 * poder mantener la conversación para la que existe.
 *
 * Por eso el archivo tiene dos bloques del mismo tamaño. El segundo no es
 * relleno: es el que se rompe cuando alguien "endurece" una regla de más.
 */

test.describe("redacta lo que no puede salir", () => {
  test("ICCID", () => {
    const r = sanitizeForModel("mi iccid es 8934071100012345678 gracias");
    expect(r.text).not.toContain("8934071100012345678");
    expect(r.redactions.iccid).toBe(1);
  });

  test("ICCID pegado a otro texto", () => {
    const r = sanitizeForModel("ICCID:8934071100012345678.");
    expect(r.text).not.toContain("8934071100012345678");
  });

  test("IMEI", () => {
    const r = sanitizeForModel("el imei es 356938035643809");
    expect(r.text).not.toContain("356938035643809");
    expect(r.redactions.imei).toBe(1);
  });

  test("EID de 32 dígitos", () => {
    const eid = "89049032005008882600033489521234";
    const r = sanitizeForModel(`me sale ${eid} al marcar *#06#`);
    expect(r.text).not.toContain(eid);
    expect(r.redactions.eid).toBe(1);
    // El resto de la frase sobrevive: es lo que da contexto para responder.
    expect(r.text).toContain("*#06#");
  });

  test("cadena de activación LPA", () => {
    const r = sanitizeForModel("me dieron LPA:1$smdp.ejemplo.com$K2-4B7X-99QQ para instalar");
    expect(r.text).not.toContain("smdp.ejemplo.com");
    expect(r.text).not.toContain("K2-4B7X-99QQ");
    expect(r.redactions.activation_code).toBe(1);
    expect(r.text).toContain("para instalar");
  });

  test("email", () => {
    const r = sanitizeForModel("escribime a juan.perez+viajes@gmail.com por favor");
    expect(r.text).not.toContain("juan.perez+viajes@gmail.com");
    expect(r.redactions.email).toBe(1);
  });

  test("teléfono internacional", () => {
    const r = sanitizeForModel("mi numero es +54 9 11 3658 3054");
    expect(r.text).not.toContain("3658");
    expect(r.redactions.phone).toBe(1);
  });

  test("teléfono español de nueve dígitos", () => {
    const r = sanitizeForModel("llamame al 612345678");
    expect(r.text).not.toContain("612345678");
    expect(r.redactions.phone).toBe(1);
  });

  test("tarjeta de pago que pasa Luhn", () => {
    const r = sanitizeForModel("pagué con la 4111 1111 1111 1111");
    expect(r.text).not.toContain("4111");
    expect(r.redactions.card).toBe(1);
  });

  test("código largo sin forma conocida", () => {
    const r = sanitizeForModel("la referencia interna es 12345678901234567890");
    expect(r.text).not.toContain("12345678901234567890");
  });

  test("credencial con pinta de token", () => {
    const r = sanitizeForModel("me pasaron esta clave sk9Xy2Lm4Qp7Rt1Vw8Zb3Nd6Hf0Jk5G para entrar");
    expect(r.text).not.toContain("sk9Xy2Lm4Qp7Rt1Vw8Zb3Nd6Hf0Jk5G");
    expect(r.redactions.token).toBe(1);
    expect(r.text).toContain("para entrar");
  });

  test("varios datos en el mismo mensaje", () => {
    const r = sanitizeForModel("soy ana@ejemplo.com, iccid 8934071100012345678, tel 612345678");
    expect(r.text).not.toContain("ana@ejemplo.com");
    expect(r.text).not.toContain("8934071100012345678");
    expect(r.text).not.toContain("612345678");
    expect(Object.keys(r.redactions).length).toBeGreaterThanOrEqual(3);
  });
});

test.describe("URLs: política conservadora", () => {
  test("una URL externa se redacta entera", () => {
    const r = sanitizeForModel("me mandaron esto: https://portal-activacion.ejemplo.com/go?tk=9f3a");
    expect(r.text).not.toContain("portal-activacion");
    expect(r.text).not.toContain("9f3a");
    expect(r.redactions.external_url).toBe(1);
    expect(r.text).toContain("me mandaron esto:");
  });

  test("da igual que el token de la query sea corto", () => {
    // El patrón de credencial exige 28+ caracteres; la regla de URL no mira
    // dentro, y por eso funciona: no hay token demasiado corto para colarse.
    const r = sanitizeForModel("entra en https://otro.sitio/x?t=ab-12");
    expect(r.text).not.toContain("ab-12");
  });

  test("una URL de Ruta34 conserva origen y ruta", () => {
    const r = sanitizeForModel("mirá https://www.esimruta34.com/help/install/iphone");
    expect(r.text).toBe("mirá https://www.esimruta34.com/help/install/iphone");
    expect(Object.keys(r.redactions)).toEqual([]);
  });

  test("pero pierde la query y el fragmento", () => {
    const r = sanitizeForModel("https://esimruta34.com/confirmacion?order=R34-1&token=abcdef#qr");
    expect(r.text).toBe("https://esimruta34.com/confirmacion");
    expect(r.redactions.url_parameters).toBe(1);
  });

  test("una ruta de Ruta34 con un identificador largo se descarta", () => {
    const r = sanitizeForModel("https://esimruta34.com/pedido/8934071100012345678");
    expect(r.text).not.toContain("8934071100012345678");
    expect(r.text).toBe("https://esimruta34.com/");
  });

  test("las credenciales embebidas en el host propio no sobreviven", () => {
    const r = sanitizeForModel("https://admin:secreta@esimruta34.com/panel");
    expect(r.text).not.toContain("secreta");
    expect(r.text).not.toContain("admin:");
  });

  test("un host que solo se parece al nuestro es externo", () => {
    const r = sanitizeForModel("https://esimruta34.com.phishing.net/login?s=1");
    expect(r.redactions.external_url).toBe(1);
    expect(r.text).not.toContain("phishing");
  });

  test("una ruta suelta con query pierde la query y conserva la ruta", () => {
    const r = sanitizeForModel("entrá en /help/qr?token=abcdef y mirá");
    expect(r.text).toBe("entrá en /help/qr y mirá");
    expect(r.redactions.url_parameters).toBe(1);
  });

  test("la puntuación de la frase no se traga la URL", () => {
    const r = sanitizeForModel("está en https://www.esimruta34.com/help.");
    expect(r.text).toBe("está en https://www.esimruta34.com/help.");
  });

  test("un ICCID dentro de una URL externa desaparece con ella", () => {
    const r = sanitizeForModel("https://sitio.ext/activar/8934071100012345678");
    expect(r.text).not.toContain("8934071100012345678");
    expect(r.redactions.external_url).toBe(1);
  });
});

test.describe("no destruye lo que hace falta para conversar", () => {
  const intactos = [
    "necesito 270 GB para el viaje",
    "el plan dura 28 días, ¿verdad?",
    "¿me alcanzan 15 GB fuera de España?",
    "cuesta 39,90 USD o son 40 dólares",
    "tengo un iPhone 15 Pro Max",
    "mi celular es un Galaxy S24 Ultra 5G",
    "viajo 21 días a España y luego 5 días más",
    "el Europa Premium son 430 GB con 60 GB fuera",
    "salgo el 12/09/2026 y vuelvo el 03/10/2026",
    "marqué *#06# y no me aparece nada",
    "¿el Pixel 8 Pro sirve?",
    "somos 4 personas y queremos 2 eSIM",
    // Rutas de la web sin parámetros: son la referencia que da el asistente al
    // derivar a una guía, y tienen que sobrevivir tal cual.
    "seguí los pasos de /help/install/android",
    "lo dice en /help/troubleshooting",
    "mirá https://www.esimruta34.com/help/qr",
  ];

  for (const frase of intactos) {
    test(`intacta: "${frase}"`, () => {
      const r = sanitizeForModel(frase);
      expect(r.text).toBe(frase);
      expect(Object.keys(r.redactions)).toEqual([]);
    });
  }

  test("una referencia de pedido corta sobrevive", () => {
    // Las referencias de pedido son necesarias para ayudar y no son PII por sí
    // solas. Si el sanitizador se las comiera, soporte dejaría de funcionar.
    const r = sanitizeForModel("mi pedido es R34-2026-0815");
    expect(r.text).toContain("R34-2026-0815");
  });

  test("una palabra larga en castellano no se confunde con un token", () => {
    const r = sanitizeForModel("necesito contrarrevolucionariamente ayuda con la instalación");
    expect(Object.keys(r.redactions)).toEqual([]);
  });

  test("un texto sin nada sensible se devuelve igual", () => {
    const frase = "hola, quiero comprar una eSIM para Europa en septiembre";
    expect(sanitizeForModel(frase).text).toBe(frase);
  });
});

test.describe("el informe de redacción es apto para logs", () => {
  test("cuenta categorías, no guarda contenido", () => {
    const r = sanitizeForModel("iccid 8934071100012345678 y otro 8934071100087654321");
    expect(r.redactions.iccid).toBe(2);
    const serializado = JSON.stringify(r.redactions);
    expect(serializado).not.toContain("8934071100012345678");
    expect(serializado).not.toContain("8934071100087654321");
  });
});
