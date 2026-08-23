/**
 * bench/scenarios.ts — Los 9 casos de la comparativa de la Fase 2B.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ VIVEN AQUÍ Y NO EN EL SCRIPT
 *
 * La misma comparativa se lanza por dos caminos: el script de línea de comandos
 * y la ruta de benchmark que corre en el despliegue de Vercel —el único sitio
 * con red hacia OpenAI—. Si cada uno tuviera su copia de los escenarios, en
 * cuanto alguien tocara una compararíamos dos cosas distintas creyendo que son
 * la misma, y no habría nada que lo delatara.
 *
 * Una sola definición, importada por los dos.
 *
 * ⚠️ **Esta lista es también la allowlist de la ruta.** Un escenario solo se
 * puede pedir por su identificador; no hay forma de mandar un mensaje libre al
 * modelo a través del benchmark. Añadir aquí un caso es ampliar lo que se puede
 * ejecutar en producción a través de esa ruta, así que se hace a conciencia.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `espera` describe lo que un turno correcto debería producir. No puntúa
 * automáticamente la naturalidad —eso lo lee una persona— sino que marca en el
 * informe los turnos que merecen revisión.
 */

export interface EsperaEscenario {
  /** Herramientas que el turno debería haber llamado. */
  herramientas?: string[];
  /** Fragmentos que el texto debería contener. */
  contiene?: RegExp[];
  /** Fragmentos que el texto **no** puede contener. */
  noContiene?: RegExp[];
}

export interface EscenarioBench {
  id: string;
  mensaje: string;
  /** `"caido"` fuerza el lector de catálogo que falla. */
  catalogo?: "caido";
  espera?: EsperaEscenario;
}

export const ESCENARIOS: readonly EscenarioBench[] = [
  {
    id: "CONV-1",
    mensaje: "¿Qué planes tienen?",
    espera: { herramientas: ["list_plans"] },
  },
  {
    id: "CONV-2",
    mensaje: "Viajo 20 días y necesito unos 50 GB, ¿cuál me conviene?",
    espera: { herramientas: ["recommend_plan"] },
  },
  {
    id: "CONV-3a",
    mensaje: "¿El plan Europa Básico funciona en Estados Unidos?",
    espera: { herramientas: ["check_coverage"], contiene: [/no/i], noContiene: [] },
  },
  {
    id: "CONV-3b",
    mensaje: "¿Y el Europa Plus funciona en Estados Unidos?",
    espera: { herramientas: ["check_coverage"], contiene: [/s[ií]/i] },
  },
  {
    id: "CONV-4a",
    mensaje: "¿Mi iPhone 15 es compatible?",
    espera: { herramientas: ["check_device_compatibility"] },
  },
  {
    id: "CONV-4b",
    mensaje: "¿Y mi Telefonito Marca X 3000 es compatible?",
    espera: {
      herramientas: ["check_device_compatibility"],
      // Lo que NO puede decir: que es incompatible.
      noContiene: [/no es compatible/i, /no funciona/i, /incompatible/i],
    },
  },
  {
    id: "CONV-5",
    mensaje: "Me quedé sin GB antes de los 28 días, ¿qué hago?",
    espera: {
      contiene: [/renov/i],
      noContiene: [/sin cargos adicionales/i, /se corta/i, /se bloquea/i],
    },
  },
  {
    id: "CONV-6",
    mensaje: "Me cobraron dos veces el mismo pedido, necesito hablar con alguien",
    espera: { herramientas: ["escalate_to_human"] },
  },
  {
    id: "CONV-7",
    mensaje: "¿Cuánto cuesta el plan más barato?",
    catalogo: "caido",
    espera: {
      // Con el catálogo caído no puede salir ni una cifra de precio.
      noContiene: [/US\$\s?\d/, /\d+\s*d[óo]lares/i],
    },
  },
];

/** Identificadores válidos, en el orden en que se ejecutan. */
export const IDS_ESCENARIOS: readonly string[] = ESCENARIOS.map((e) => e.id);

/** Devuelve el escenario con ese identificador, o `null` si no existe ninguno. */
export function buscarEscenario(id: string): EscenarioBench | null {
  return ESCENARIOS.find((e) => e.id === id) ?? null;
}
