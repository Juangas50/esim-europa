import { describe, it, expect } from "vitest";
import { emailConfirmacionB2C, emailAvisoClienteProgramado, emailFechaReprogramada } from "./templates";

// Claude Design detectó "28 días" hardcodeado en los masters de Email 1 y 2
// (FASE 4A.2 §3) — el contrato real es planDays, derivado de
// tariffs.validity_days. Esta prueba fija ese comportamiento: un plan de
// duración distinta de 28 nunca debe mostrar "28 días" en el HTML.
describe("planDays no está hardcodeado en Email 1/2", () => {
  it("emailConfirmacionB2C usa el planDays real (45), no 28", () => {
    const { html } = emailConfirmacionB2C({
      customerName: "Sofía",
      orderRefs: ["R34-A"],
      totalCount: 1,
      planName: "Europa Larga",
      planDays: 45,
      planType: "local",
    });
    expect(html).toContain("45 días");
    expect(html).not.toContain("28 días");
  });

  it("emailAvisoClienteProgramado usa el planDays real (45), no 28", () => {
    const { html } = emailAvisoClienteProgramado({
      customerName: "Sofía",
      orderRefs: ["R34-A"],
      totalCount: 1,
      planName: "Europa Larga",
      planDays: 45,
      activationDate: "30 de septiembre de 2026",
      type: "local",
    });
    expect(html).toContain("45 días");
    expect(html).not.toContain("28 días");
  });

  it("un plan de 28 días real sigue mostrando 28 días (no es un valor prohibido, solo no debe estar hardcodeado)", () => {
    const { html } = emailConfirmacionB2C({
      customerName: "Sofía",
      orderRefs: ["R34-A"],
      totalCount: 1,
      planName: "Europa Plus",
      planDays: 28,
      planType: "local",
    });
    expect(html).toContain("28 días");
  });
});

describe("Email 1/2 MULTI — subject aprobado y referencias sin referencia global", () => {
  it("usa el subject MULTI aprobado y lista REFERENCIAS DE PEDIDO en orden canónico", () => {
    const { subject, html } = emailConfirmacionB2C({
      customerName: "Sofía",
      orderRefs: ["R34-A", "R34-B", "R34-C"],
      totalCount: 3,
      planName: "Europa Plus",
      planDays: 28,
      planType: "local",
    });
    expect(subject).toBe("Tu compra está confirmada — recibirás tus eSIMs en 24 horas");
    expect(html).toContain("REFERENCIAS DE PEDIDO");
    expect(html).toContain("eSIM 1 de 3");
    expect(html).toContain("eSIM 2 de 3");
    expect(html).toContain("eSIM 3 de 3");
    expect(html).not.toMatch(/REFERENCIA DE PEDIDO(?!S)/); // singular block no debe aparecer en MULTI
  });

  it("SINGLE mantiene el subject y la referencia singular del master", () => {
    const { subject, html } = emailConfirmacionB2C({
      customerName: "Sofía",
      orderRefs: ["R34-A"],
      totalCount: 1,
      planName: "Europa Plus",
      planDays: 28,
      planType: "local",
    });
    expect(subject).toBe("Tu compra está confirmada — recibirás tu eSIM en 24 horas");
    expect(html).toContain("REFERENCIA DE PEDIDO");
    expect(html).not.toContain("REFERENCIAS DE PEDIDO");
  });
});

describe("Email 4 — numeración MULTI·SELECCIÓN conserva la posición original", () => {
  it("selección parcial (1 y 3 de 3) muestra 'eSIM 1 de 3' / 'eSIM 3 de 3', nunca renumerado a 1/2 de 2", () => {
    const { subject, html } = emailFechaReprogramada({
      customerName: "Sofía",
      orderRef: "R34-A",
      planName: "Europa Plus",
      newActivationDate: "30 de septiembre de 2026",
      rescheduleUrl: "https://www.esimruta34.com/es/reprogramar?rows=a:1,c:3",
      affectedEsims: [
        { label: "eSIM 1 de 3", orderRef: "R34-A" },
        { label: "eSIM 3 de 3", orderRef: "R34-C" },
      ],
      isPartialSelection: true,
    });
    expect(subject).toBe("Actualizamos la fecha de tus eSIMs Ruta34");
    expect(html).toContain("eSIM 1 de 3");
    expect(html).toContain("eSIM 3 de 3");
    expect(html).not.toContain("eSIM 2 de 2");
    expect(html).not.toContain("1 de 2");
    expect(html).toContain("El resto de tus eSIMs mantiene su fecha de activaci");
  });

  it("MULTI·TODAS no muestra la línea 'El resto de tus eSIMs...'", () => {
    const { html } = emailFechaReprogramada({
      customerName: "Sofía",
      orderRef: "R34-A",
      planName: "Europa Plus",
      newActivationDate: "30 de septiembre de 2026",
      affectedEsims: [
        { label: "eSIM 1 de 3", orderRef: "R34-A" },
        { label: "eSIM 2 de 3", orderRef: "R34-B" },
        { label: "eSIM 3 de 3", orderRef: "R34-C" },
      ],
    });
    expect(html).not.toContain("El resto de tus eSIMs mantiene su fecha de activaci");
  });

  it("SINGLE no incluye ninguna lista de eSIMs afectadas ni referencia global", () => {
    const { subject, html } = emailFechaReprogramada({
      customerName: "Sofía",
      orderRef: "R34-A",
      planName: "Europa Plus",
      newActivationDate: "30 de septiembre de 2026",
    });
    expect(subject).toBe("Actualizamos la fecha de tu eSIM Ruta34");
    expect(html).not.toContain("APLICA A");
  });

  it("sin rescheduleUrl, oculta el CTA y usa el fallback aprobado enlazando al soporte real", () => {
    const { html } = emailFechaReprogramada({
      customerName: "Sofía",
      orderRef: "R34-A",
      planName: "Europa Plus",
      newActivationDate: "30 de septiembre de 2026",
    });
    expect(html).toContain("Si necesit");
    expect(html).not.toContain("Reprogramar activación");
  });
});
