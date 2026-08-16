/**
 * coverage.ts — Fuente única de cobertura por destino.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ ES Y QUÉ NO ES
 *
 * Esto responde a **dónde funciona cada producto**, y a nada más.
 *
 * No responde a cuántos gigas puede gastar el cliente fuera de España: eso es
 * un dato del catálogo vivo (`outsideSpainMaxGb`) que cambia cuando cambia una
 * tarifa. Si la cifra viviera aquí, cada cambio de tarifa exigiría acordarse de
 * tocar dos archivos, y el día que alguien se olvidara tendríamos dos verdades.
 * Una pregunta como «¿cuántos GB tengo en Francia con el Plus?» se responde
 * combinando las dos fuentes, no guardando la respuesta en una tercera.
 *
 * Tampoco responde a qué planes puede comprar alguien según desde dónde compra
 * — eso es `plan-compatibility.ts`, que mide el país del **comprador** y no
 * tiene nada que ver con esto.
 *
 * Los planes se referencian por **clave comercial** (`europa-basico`), nunca
 * por UUID, talla ni identificador de proveedor. Ver `plan-key.ts`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONSUMIDORES
 *
 * Este módulo no tiene dependencias de React ni de servidor, a propósito: lo
 * importan el buscador de la web, el modal de países y la herramienta
 * `check_coverage` del asistente. Antes había tres listas escritas a mano que
 * no coincidían entre sí; ahora hay una.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import coverageData from "@/data/coverage.json";
import { isKnownPlanKey, PLAN_KEYS, type PlanKey } from "@/lib/plan-key";

export interface CoverageCountry {
  /** ISO 3166-1 alfa-2. `XK` para Kosovo, que es el código de uso común. */
  code: string;
  /** Nombre en español, tal y como se muestra. */
  name: string;
  /** Metadata visual, para que la UI no tenga que mantener su propia tabla. */
  flag: string;
  /** Se muestra en la fila destacada de la portada. */
  featured: boolean;
  /** Otras formas de escribirlo: inglés, siglas, variantes ortográficas. */
  aliases: string[];
  /** Claves comerciales que NO incluyen este destino. Vacío = lo incluyen todas. */
  excludedPlans: string[];
}

interface CoverageFile {
  updatedAt: string;
  countries: CoverageCountry[];
}

const file = coverageData as unknown as CoverageFile;

// ── Validación al cargar ──────────────────────────────────────────────────────

/**
 * El archivo es un dato editado a mano por una decisión comercial, así que se
 * valida al importar: un error tipográfico en una clave de plan o un código
 * duplicado se convierte en un fallo ruidoso al arrancar, no en una cobertura
 * mal calculada que nadie nota.
 */
function assertValid(countries: CoverageCountry[]): void {
  const codes = new Set<string>();

  for (const c of countries) {
    if (!/^[A-Z]{2}$/.test(c.code)) {
      throw new Error(`coverage.json: código ISO inválido "${c.code}"`);
    }
    if (codes.has(c.code)) {
      throw new Error(`coverage.json: código duplicado "${c.code}"`);
    }
    codes.add(c.code);

    for (const key of c.excludedPlans) {
      if (!isKnownPlanKey(key)) {
        throw new Error(`coverage.json: ${c.code} excluye "${key}", que no es una clave comercial vigente`);
      }
    }
  }
}

assertValid(file.countries);

// ── Datos ─────────────────────────────────────────────────────────────────────

export const COVERAGE_COUNTRIES: readonly CoverageCountry[] = Object.freeze(file.countries);

/** Destinos distintos que aparecen en al menos un plan. */
export const TOTAL_DESTINATIONS = COVERAGE_COUNTRIES.length;

export const COVERAGE_UPDATED_AT = file.updatedAt;

// ── Normalización y búsqueda ──────────────────────────────────────────────────

/** Quita acentos, signos y espacios de más para comparar sin sorpresas. */
export function normalizeCountryQuery(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Todas las formas aceptadas de nombrar un país, ya normalizadas. */
function formsOf(country: CoverageCountry): string[] {
  return [country.code, country.name, ...country.aliases].map(normalizeCountryQuery);
}

const BY_FORM = new Map<string, CoverageCountry>();
for (const country of COVERAGE_COUNTRIES) {
  for (const form of formsOf(country)) {
    if (form) BY_FORM.set(form, country);
  }
}

/**
 * Resuelve una consulta a **un** país, o a nada.
 *
 * Coincidencia **exacta** sobre nombre, código o alias normalizados. No hay
 * coincidencia parcial, y es deliberado: de la resolución cuelga la exclusión
 * de Europa Básico en Estados Unidos, y ocultarle a alguien un plan porque ha
 * tecleado cuatro letras que casualmente son el principio de otro país sería
 * peor que no filtrar nada.
 *
 * Para el desplegable de sugerencias está `searchCoverageCountries`, que sí
 * busca por subcadena — pero eso solo pinta una lista, no decide nada.
 */
export function findCoverageCountry(query: string): CoverageCountry | null {
  return BY_FORM.get(normalizeCountryQuery(query)) ?? null;
}

/**
 * Longitud mínima para que una consulta a medio escribir pueda decidir algo.
 *
 * Dos caracteres no son una intención. «eu» solo coincide con un país de la
 * lista —por el alias «eeuu»— pero quien lo teclea casi siempre está
 * empezando a escribir «Europa», y no tendría ninguna gracia que se le
 * escondiera el plan Europa Básico justo entonces.
 */
const MIN_PREFIJO = 3;

/**
 * Resuelve la consulta del buscador de la web, incluida a medio escribir.
 *
 * Se acepta una coincidencia parcial solo cuando no deja lugar a dudas, y eso
 * son tres condiciones a la vez:
 *
 *  1. es la **única** coincidencia de la lista;
 *  2. lo tecleado es el **principio** de alguna de sus formas, no un trozo
 *     suelto de en medio;
 *  3. tiene al menos tres caracteres.
 *
 * Las tres hacen falta. Con solo la primera, 52 consultas distintas resuelven
 * a Estados Unidos y esconden Europa Básico; entre ellas «eu», «me» y «of».
 * Con las tres, quedan cinco, y todas son intentos legítimos de escribirlo:
 * «esta», «eeu», «ee u», «ee  u» y «ame».
 *
 * Esto NO es la vuelta a la heurística de subcadenas que había antes. Aquella
 * preguntaba si la consulta contenía ciertas letras escritas a mano; esta
 * pregunta si la lista entera responde con un país y solo uno.
 *
 * Para el asistente sigue valiendo `findCoverageCountry`, que exige forma
 * exacta: una máquina que afirma cobertura no debe adivinar a qué país se
 * refería nadie.
 */
export function resolveCountryForSearch(query: string): CoverageCountry | null {
  const exacto = findCoverageCountry(query);
  if (exacto) return exacto;

  const q = normalizeCountryQuery(query);
  if (q.length < MIN_PREFIJO) return null;

  const coincidencias = searchCoverageCountries(query);
  if (coincidencias.length !== 1) return null;

  const [unico] = coincidencias;
  return formsOf(unico).some((f) => f.startsWith(q)) ? unico : null;
}

/** Coincidencias por subcadena, para autocompletar. Ordenadas por relevancia. */
export function searchCoverageCountries(query: string): CoverageCountry[] {
  const q = normalizeCountryQuery(query);
  if (!q) return [];

  return COVERAGE_COUNTRIES.filter((c) => formsOf(c).some((f) => f.includes(q))).sort((a, b) => {
    const aStarts = formsOf(a).some((f) => f.startsWith(q));
    const bStarts = formsOf(b).some((f) => f.startsWith(q));
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.name.localeCompare(b.name, "es");
  });
}

// ── Consultas de cobertura ────────────────────────────────────────────────────

/** ¿Este plan cubre este destino? */
export function planCoversCountry(planKey: string, country: CoverageCountry): boolean {
  return !country.excludedPlans.includes(planKey);
}

/** Claves comerciales que incluyen el destino. */
export function plansCovering(country: CoverageCountry): PlanKey[] {
  return PLAN_KEYS.filter((key) => planCoversCountry(key, country));
}

/** Claves comerciales que NO incluyen el destino. */
export function plansExcluding(country: CoverageCountry): PlanKey[] {
  return PLAN_KEYS.filter((key) => !planCoversCountry(key, country));
}

/**
 * Cuántos destinos cubre una gama **ya validada**.
 *
 * El parámetro es `PlanKey`, no `string`, y es a propósito. La cuenta se hace
 * restando exclusiones, así que una clave que no está en la lista sale con
 * cero exclusiones y devuelve el total —39— como si lo cubriera todo. Eso es
 * correcto como aritmética y peligroso como afirmación: quien pregunta por una
 * tarifa que no reconocemos no debe llevarse un número, debe llevarse un «no
 * lo sé».
 *
 * El tipo cierra esa puerta en compilación. Quien tenga un `string` sin
 * validar tiene que pasar por `getPlanCoverageCount`, que valida y puede
 * responder `null`.
 */
export function destinationsForPlan(planKey: PlanKey): number {
  return COVERAGE_COUNTRIES.filter((c) => planCoversCountry(planKey, c)).length;
}

/**
 * Cuántos destinos cubre una gama, para decírselo al cliente.
 *
 * Esta es la frontera: entra un `string` de procedencia desconocida —derivado
 * de un nombre comercial, de una fila del catálogo, de lo que sea— y sale un
 * número solo si la clave es una de las gamas vivas.
 *
 * El `null` hay que respetarlo: significa «no lo sé», no «pon el número de
 * siempre». Los consumidores omiten la cifra en vez de inventarla, porque una
 * tarifa que no reconocemos —una de España, una retirada, una que alguien
 * acaba de dar de alta— no tiene por qué cubrir lo mismo que las demás.
 *
 * Antes esta cifra era una columna del catálogo con 30 escrito a mano en cinco
 * sitios. Al derivarla, Europa Básico dice 38 y las otras cuatro 39 sin que
 * nadie tenga que acordarse de nada.
 */
export function getPlanCoverageCount(planKey: string): number | null {
  return isKnownPlanKey(planKey) ? destinationsForPlan(planKey) : null;
}
