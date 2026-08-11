/**
 * corpus/index.ts — Ensamblado del conocimiento estático del asistente.
 *
 * Distingue dos cosas que es fácil confundir:
 *
 * · **Prefijo** (`buildCorpus`): política + FAQ. Va en TODAS las conversaciones,
 *   así que es lo que se cachea y lo que hay que vigilar en tamaño.
 * · **Bajo demanda** (`GUIDES`): las guías de instalación. Solo entran en el
 *   contexto si alguien pregunta, vía `get_guide`.
 *
 * Nada de lo que hay aquí menciona proveedores, infraestructura ni metadata
 * interna. No porque el prompt lo prohíba, sino porque no está escrito. La
 * protección buena es que el dato no exista en el contexto; la prohibición en
 * el prompt es solo la segunda línea.
 */

import { estimateTokens, PREFIX_TOKEN_BUDGET } from "../limits";
import { POLICY } from "./policy";
import { FAQ } from "./faq";

export { GUIDES, GUIDE_SLUGS, type GuideSlug } from "./guides";
export { POLICY } from "./policy";
export { FAQ } from "./faq";

/** Conocimiento estático que acompaña a todas las conversaciones. */
export function buildCorpus(): string {
  return [POLICY, "\n---\n", "# Preguntas frecuentes\n", FAQ].join("\n");
}

export interface PrefixBudgetReport {
  estimatedTokens: number;
  budget: number;
  withinBudget: boolean;
}

/**
 * Mide el prefijo contra su presupuesto.
 *
 * No lanza: devuelve el informe y deja que quien llama decida. En los tests es
 * una aserción; en producción, si algún día se pasa, preferimos servir la
 * conversación cara antes que caerla.
 */
export function measurePrefix(prefix: string): PrefixBudgetReport {
  const tokens = estimateTokens(prefix);
  return { estimatedTokens: tokens, budget: PREFIX_TOKEN_BUDGET, withinBudget: tokens <= PREFIX_TOKEN_BUDGET };
}
