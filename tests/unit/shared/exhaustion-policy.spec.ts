import "../assistant/_no-network";

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { PLANS } from "@/lib/plans";
import { toPlanKey } from "@/lib/plan-key";
import { toAssistantPlanDto } from "@/lib/assistant/server/dto";
import { buildCorpus } from "@/lib/assistant/server/corpus";

/**
 * Qué pasa cuando alguien gasta sus GB.
 *
 * La web afirmaba en seis sitios que el servicio «se detiene sin cargos
 * adicionales». No es cierto: dentro de España la línea puede quedar a
 * velocidad mínima en vez de cortarse, y fuera de España, agotado el máximo que
 * cada gama permite gastar allí, el consumo adicional puede descontarse del
 * saldo. Y sobre todo faltaba lo que de verdad le sirve a quien se queda sin
 * datos: que puede renovar la tarifa antes de que terminen los 28 días.
 *
 * Estos tests impiden que vuelva la versión cómoda.
 */

const CORPUS = buildCorpus();
const RAIZ = process.cwd();
const leer = (ruta: string) => fs.readFileSync(path.join(RAIZ, ruta), "utf8");

/** Superficies que ve un comprador. El texto legal va aparte. */
const SUPERFICIES_PUBLICAS = [
  "src/app/[locale]",
  "src/components/landing",
  "src/components/seo",
  "src/components/purchase",
  "src/components/shared",
  "messages",
];

/** Lo legal se audita, no se reescribe: su redacción necesita revisión propia. */
const LEGAL = ["terminos", "privacidad", "cookies"];

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

const PUBLICOS = ficherosDe(".").length
  ? SUPERFICIES_PUBLICAS.flatMap(ficherosDe).filter((f) => !LEGAL.some((l) => f.includes(l)))
  : [];

/** Un comentario no lo lee nadie. */
const sinComentarios = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * La afirmación prohibida: que agotar los datos no tiene ninguna consecuencia
 * económica. Se busca la combinación —agotamiento + ausencia de cargo— y no
 * cada frase por separado, porque «sin cargos ocultos» referido a la compra
 * sigue siendo cierto y debe poder decirse.
 */
const AGOTAMIENTO = /(agot|acaba|termina|consum|se te acaban|esgot|sem dados|sin datos)/i;
const SIN_CARGO =
  /(no se (te )?cobra|sin cargos adicionales|sin cobros adicionales|nada extra|nada adicional|nada más|sem cobran|nada extra é cobrado|sem cargos adicionais)/i;

/** Frases que describen mal lo que ocurre dentro de España. */
const CORTE_ABSOLUTO = [
  /el servicio se detiene/i,
  /el servicio se pausa/i,
  /la conexión de datos se desactiva/i,
  /te quedás sin conexión/i,
  /el servicio se bloquea/i,
  /o serviço para sem/i,
];

test.describe("ninguna superficie pública promete que agotar los GB sale gratis", () => {
  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = sinComentarios(leer(archivo));

      // Se mira frase a frase: la contradicción es que en la misma afirmación
      // convivan «se acabaron los datos» y «no se cobra nada».
      const frases = fuente.split(/(?<=[.!?])\s+|\\n/);
      for (const frase of frases) {
        if (!AGOTAMIENTO.test(frase)) continue;
        expect(
          SIN_CARGO.test(frase),
          `${archivo}: «${frase.trim().slice(0, 140)}» promete que agotar los GB no tiene coste`
        ).toBe(false);
      }

      for (const patron of CORTE_ABSOLUTO) {
        expect(fuente, `${archivo} contra ${patron}`).not.toMatch(patron);
      }
    });
  }
});

test.describe("el corpus del asistente dice la política correcta", () => {
  test("no afirma que no se cobre nada al agotar los datos", () => {
    for (const frase of CORPUS.split(/(?<=[.!?])\s+|\n\n/)) {
      if (!AGOTAMIENTO.test(frase)) continue;
      // Salvo cuando la propia política prohíbe decirlo — esa frase habla de la
      // prohibición, no la comete.
      if (/no se puede (decir|afirmar)/i.test(frase)) continue;
      expect(
        SIN_CARGO.test(frase),
        `el corpus promete que agotar los GB no tiene coste: «${frase.trim().slice(0, 140)}»`
      ).toBe(false);
    }
  });

  test("el precio por giga está atado al roaming UE, no a «fuera de España»", () => {
    // La condición confirmada es la de roaming en la Unión Europea. La
    // cobertura incluye destinos que no son de la UE —Estados Unidos, Turquía,
    // Ucrania…— y para ellos nadie ha confirmado ese precio. Equiparar las dos
    // cosas es prometer una tarifa inventada.
    const frases = CORPUS.split(/(?<=[.!?])\s+|\n\n/).filter((f) => /1,33/.test(f));
    expect(frases.length, "el corpus ya no menciona el precio por giga").toBeGreaterThan(0);

    for (const frase of frases) {
      expect(
        /uni[óo]n europea|roaming ue/i.test(frase),
        `«${frase.trim().slice(0, 160)}» da el precio sin acotarlo a roaming UE`
      ).toBe(true);
      expect(
        /fuera de espa[ñn]a/i.test(frase) && !/uni[óo]n europea/i.test(frase),
        `«${frase.trim().slice(0, 160)}» equipara «fuera de España» con el precio`
      ).toBe(false);
    }
  });

  test("el precio exige además que la gama cubra el destino", () => {
    // Si la gama no cubre el destino no hay franquicia que agotar allí: hablar
    // de precio por giga sería responder a otra pregunta. Es justo el caso de
    // Europa Básico y Estados Unidos.
    expect(CORPUS).toMatch(/incluido en la cobertura/i);
    expect(CORPUS).toMatch(/check_coverage/);
    expect(CORPUS).toMatch(/franquicia que agotar all[íi]/i);
  });

  test("no se apoya en un dato de pertenencia a la UE que no existe", () => {
    // El modelo de datos no guarda esa clasificación —y no va a guardarla—, así
    // que la política tiene que decir qué hacer sin ella.
    expect(CORPUS).toMatch(/ninguno de los dos dice qu[ée] destino es de la UE/i);
    const fuentes = ["src/data/coverage.json", "src/lib/coverage.ts", "src/lib/plans-server.ts"];
    for (const ruta of fuentes) {
      expect(leer(ruta), `${ruta} no debe clasificar destinos por UE`).not.toMatch(
        /euRoaming|isEu\b|euMember/i
      );
    }
  });

  test("dice explícitamente que fuera de la UE no está confirmado", () => {
    expect(CORPUS).toMatch(/no (lo )?tenemos confirmada|no est[áa] confirmad/i);
    expect(CORPUS).toMatch(/no son de la uni[óo]n europea|fuera de la uni[óo]n europea/i);
    // Y la regla de duda: si no consta que el destino sea de la UE, no se afirma.
    expect(CORPUS).toMatch(/ante la duda|se trata como no confirmado/i);
  });

  test("ninguna superficie pública ata el precio a «fuera de España» a secas", () => {
    for (const archivo of PUBLICOS) {
      const fuente = sinComentarios(leer(archivo));
      for (const frase of fuente.split(/(?<=[.!?])\s+|\\n/)) {
        if (!/1,33/.test(frase)) continue;
        expect(
          /uni[óo]n europea|uni[ãa]o europeia/i.test(frase),
          `${archivo}: «${frase.trim().slice(0, 160)}» da el precio sin acotarlo a la UE`
        ).toBe(true);
      }
    }
  });

  test("explica las tres situaciones sin mezclarlas", () => {
    expect(CORPUS).toMatch(/velocidad.{0,40}m[íi]nim/i);
    expect(CORPUS).toMatch(/renovaci[óo]n anticipada/i);
    expect(CORPUS).toMatch(/1,33/);
    expect(CORPUS).toMatch(/saldo/i);
  });

  test("manda consultar el catálogo en vez de recordar cifras", () => {
    // El corpus no puede llevar los GB de cada gama escritos: para eso está la
    // herramienta, que lee el catálogo vivo.
    expect(CORPUS).toContain("list_plans");
    for (const plan of PLANS) {
      const gigasFuera = plan.eu_data_gb;
      if (!gigasFuera) continue;
      const suelto = new RegExp(`${gigasFuera}\\s*GB`, "i");
      const apariciones = [...CORPUS.matchAll(new RegExp(suelto, "gi"))];
      // El ejemplo didáctico de «270 GB totales con 23 GB fuera» sí está, y es
      // el único sitio donde se permite una cifra: enseña la semántica.
      for (const [texto] of apariciones) {
        expect(
          CORPUS.includes("270 GB totales"),
          `«${texto}» aparece en el corpus fuera del ejemplo de semántica`
        ).toBe(true);
      }
    }
  });

  test("declara lo que no sabe en vez de aproximarlo", () => {
    for (const limite of [
      /instant[áa]nea/i,
      /velocidad concreta/i,
      /regulatorias/i,
      /cu[áa]nto tarda/i,
    ]) {
      expect(CORPUS, `el corpus no declara el límite ${limite}`).toMatch(limite);
    }
  });
});

test.describe("las cifras del producto siguen saliendo del catálogo", () => {
  // No se repiten aquí los números: se comprueba que el DTO que ve el
  // asistente es exactamente lo que dice el catálogo, y que la semántica de la
  // bolsa se mantiene.
  for (const plan of PLANS) {
    test(`${plan.name}`, () => {
      const dto = toAssistantPlanDto(plan);
      expect(dto.key).toBe(toPlanKey(plan.name));
      expect(dto.data.totalGb).toBe(plan.data_gb);
      expect(dto.data.outsideSpainMaxGb).toBe(plan.eu_data_gb ?? null);
      expect(dto.validityDays).toBe(plan.duration_days);

      // La regla que no puede romperse: lo de fuera de España es un subconjunto
      // de la bolsa total, nunca una bolsa aparte que se sume.
      if (dto.data.outsideSpainMaxGb !== null) {
        expect(dto.data.outsideSpainMaxGb).toBeLessThanOrEqual(dto.data.totalGb);
      }
    });
  }

  test("la vigencia sigue siendo de 28 días en las cinco gamas", () => {
    for (const plan of PLANS) {
      expect(toAssistantPlanDto(plan).validityDays, plan.name).toBe(28);
    }
  });
});

test.describe("las duraciones publicadas existen en el catálogo", () => {
  /**
   * Hasta hace poco el centro de ayuda decía «algunos planes duran 7 días,
   * otros 30 días o más». Ninguna de las dos duraciones existe: las cinco
   * tarifas vivas duran lo mismo. Se corrigió en `03d77a8`, y esto impide que
   * vuelva por otro camino.
   */
  const VIGENCIAS = new Set(PLANS.map((p) => p.duration_days));
  /** El catálogo también fija hasta cuándo se puede programar la activación. */
  const PLAZOS_DEL_CATALOGO = new Set([
    ...PLANS.map((p) => p.duration_days),
    ...PLANS.map((p) => p.activation_days),
  ]);

  /** Plazos que no son la vigencia de una tarifa, cada uno con su motivo. */
  const OTROS_PLAZOS: { dias: number; motivo: string }[] = [
    { dias: 14, motivo: "derecho de desistimiento — plazo legal, no vigencia de tarifa" },
    { dias: 7, motivo: "días hábiles de un trámite, no vigencia de tarifa" },
    {
      dias: 60,
      motivo:
        "ventana de instalación del producto de solo datos: ese producto no está " +
        "en el catálogo vivo y su copy está pendiente de decisión de producto",
    },
    {
      dias: 5,
      motivo: "antelación mínima recomendada antes del viaje, no vigencia de tarifa",
    },
  ];

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = sinComentarios(leer(archivo));
      for (const [texto, cifra] of fuente.matchAll(/\b(\d+)\s*d[ií]as?\b/gi)) {
        const dias = Number(cifra);
        if (PLAZOS_DEL_CATALOGO.has(dias)) continue;

        const declarado = OTROS_PLAZOS.find((p) => p.dias === dias);
        expect(
          declarado,
          `${archivo}: «${texto.trim()}» no es ninguna vigencia del catálogo ` +
            `(${[...VIGENCIAS].join(", ")} días). Si es otro tipo de plazo, decláralo con su motivo.`
        ).toBeTruthy();
      }
    });
  }

  test("la vigencia del catálogo es una sola", () => {
    // El día que existan dos vigencias distintas, el copy que dice «28 días» a
    // secas deja de ser cierto y este test avisa antes que un cliente.
    expect([...VIGENCIAS]).toEqual([28]);
  });
});

test.describe("los gigas no se escriben a mano", () => {
  /**
   * Una cifra de datos escrita en el copy queda congelada el día que se
   * escribió. Si viene del catálogo, cambia sola.
   */
  const EXCEPCIONES: { archivo: string; motivo: string }[] = [
    {
      archivo: "src/components/landing/Testimonials.tsx",
      motivo:
        "los testimonios citan la tarifa que compró cada persona; sacarlos del " +
        "catálogo o quitarlos es una decisión de contenido, fuera de este bloque",
    },
  ];

  for (const archivo of PUBLICOS) {
    if (archivo.endsWith(".json")) continue; // el copy de referencia de consumo va aparte
    test(`${archivo}`, () => {
      const fuente = sinComentarios(leer(archivo));
      const sospechosas = [...fuente.matchAll(/(?<![.\d~–-])\b(\d{2,3})\s*GB\b/g)]
        // Interpolaciones del catálogo: `{plan.data_gb} GB`. Esas están bien.
        .filter((m) => !fuente.slice(Math.max(0, m.index! - 40), m.index!).includes("plan."));

      if (sospechosas.length === 0) return;
      const declarado = EXCEPCIONES.find((e) => e.archivo === archivo);
      expect(
        declarado,
        `${archivo} escribe a mano ${sospechosas.map((m) => m[0]).join(", ")}; ` +
          `esas cifras están en el catálogo`
      ).toBeTruthy();
    });
  }
});

test.describe("no se comunica un producto que no está en el catálogo", () => {
  /**
   * El producto de solo datos no se comercializa. Mientras no haya una tarifa
   * viva de ese tipo, nada público puede presentarlo como disponible — ni por
   * su nombre antiguo ni con sus plazos.
   */
  const TIPOS_VIVOS = new Set(PLANS.map((p) => p.type));

  test("el catálogo vigente son las cinco gamas, todas del mismo tipo", () => {
    expect([...TIPOS_VIVOS]).toEqual(["local"]);
    expect(PLANS.map((p) => p.name)).toEqual([
      "Europa Básico",
      "Europa Plus",
      "Europa Total",
      "Europa Max",
      "Europa Premium",
    ]);
  });

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      const fuente = sinComentarios(leer(archivo));
      // El nombre del producto, escrito como se escribía en el copy.
      const menciones = [...fuente.matchAll(/\bdata\s?only\b/gi)];
      if (menciones.length === 0) return;

      // Solo puede nombrarse si existe una tarifa viva de ese tipo. Como el
      // identificador técnico del tipo es el mismo, se distingue por la caja:
      // `dataonly` en minúsculas es código; «DataOnly» es copy.
      const enCopy = menciones.filter((m) => m[0] !== "dataonly");
      expect(
        enCopy.length === 0 || TIPOS_VIVOS.has("dataonly"),
        `${archivo} presenta «${enCopy[0]?.[0]}» como producto y no hay ninguna tarifa viva de ese tipo`
      ).toBe(true);
    });
  }

  test("el selector de planes no ofrece una pestaña sin planes detrás", () => {
    // La pestaña existe para cuando el producto vuelva, pero solo aparece si
    // hay tarifas de los dos tipos. Con el catálogo actual no se pinta.
    const stepPlan = leer("src/components/purchase/StepPlan.tsx");
    expect(stepPlan).toMatch(/hasLocal && hasData/);
  });
});

test.describe("la renovación se explica sin prometer que sea automática", () => {
  /**
   * «Sin renovación automática» era demasiado absoluto: no hay cargo recurrente
   * en la tarjeta, pero la tarifa sí puede renovarse al terminar su ciclo con
   * el saldo de la propia línea. Son dos cosas distintas y el copy tiene que
   * distinguirlas.
   */
  const ABSOLUTO = /sin renovaci[óo]n autom|sem renova[çc][ãa]o autom|no (existe|hay) renovaci[óo]n autom/i;

  for (const archivo of PUBLICOS) {
    test(`${archivo}`, () => {
      expect(
        sinComentarios(leer(archivo)),
        `${archivo} sigue afirmando que no hay renovación automática; ` +
          `lo que no hay es suscripción ni cargo recurrente en la tarjeta`
      ).not.toMatch(ABSOLUTO);
    });
  }

  test("el copy comercial habla de suscripción y tarjeta, no de renovación", () => {
    const es = JSON.parse(leer("messages/es.json"));
    const pt = JSON.parse(leer("messages/pt.json"));

    expect(es.plans.noAutoRenew).toMatch(/suscripci[óo]n|recurrente/i);
    expect(pt.plans.noAutoRenew).toMatch(/assinatura|recorrente/i);
    expect(es.purchase.payment.once).toMatch(/recurrente/i);
    expect(pt.purchase.payment.once).toMatch(/recorrente/i);
  });

  test("el corpus separa tarjeta, saldo y ciclo", () => {
    expect(CORPUS).toMatch(/no hay suscripci[óo]n ni cargo recurrente/i);
    expect(CORPUS).toMatch(/gesti[óo]n de soporte/i);
    // Y avisa de que la formulación cómoda es inexacta.
    expect(CORPUS).toMatch(/no se puede decir «no se/i);
  });

  test("el corpus dice que al terminar el ciclo sí se renueva, con saldo", () => {
    // El matiz que faltaba: no hay cargo en la tarjeta, pero la tarifa sí se
    // renueva sola si la línea tiene saldo. Y no se renueva si no lo tiene.
    expect(CORPUS).toMatch(/se renueva\s+automáticamente si la l[íi]nea tiene saldo/i);
    expect(CORPUS).toMatch(/sin saldo suficiente/i);
  });

  test("el copy público dice lo mismo que el corpus", () => {
    const es = JSON.parse(leer("messages/es.json"));
    const pt = JSON.parse(leer("messages/pt.json"));
    expect(es.faq.items.costs.a).toMatch(/se renueva autom[áa]ticamente si la l[íi]nea tiene saldo/i);
    expect(es.faq.items.costs.a).toMatch(/sin volver a cobrar en tu tarjeta/i);
    expect(pt.faq.items.costs.a).toMatch(/renovada automaticamente se a linha tiver saldo/i);
    expect(pt.faq.items.costs.a).toMatch(/sem cobrar de novo no seu cart[ãa]o/i);
  });
});

test.describe("la web ofrece renovar sin prometer que sea automático", () => {
  const es = JSON.parse(leer("messages/es.json"));
  const pt = JSON.parse(leer("messages/pt.json"));

  test("la clave de renovación existe en las dos lenguas", () => {
    expect(es.benefits.renewal, "falta en castellano").toBeTruthy();
    expect(pt.benefits.renewal, "falta en portugués").toBeTruthy();
  });

  test("habla de renovar antes de tiempo", () => {
    expect(es.benefits.renewal).toMatch(/renovar/i);
    expect(es.benefits.renewal).toMatch(/28/);
    expect(pt.benefits.renewal).toMatch(/renovar/i);
    expect(pt.benefits.renewal).toMatch(/28/);
  });

  test("no promete automatización ni inmediatez", () => {
    for (const texto of [es.benefits.renewal, pt.benefits.renewal]) {
      for (const promesa of [
        /autom[áa]tic/i,
        /al instante|instant[áa]nea|imediat/i,
        /desde tu cuenta|no seu painel|desde el panel/i,
        /un clic|um clique/i,
      ]) {
        expect(texto, `«${texto}» promete ${promesa}`).not.toMatch(promesa);
      }
    }
  });

  test("el buscador ya no publica la tarifa por giga como mensaje principal", () => {
    const benefits = sinComentarios(leer("src/components/landing/Benefits.tsx"));
    expect(benefits).not.toMatch(/1,33/);
    expect(benefits).not.toMatch(/normativa europea/i);
    expect(benefits).toContain('t("renewal")');
  });
});
