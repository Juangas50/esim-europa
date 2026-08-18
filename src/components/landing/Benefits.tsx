"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { DeviceMobile, Lightning, CurrencyDollar, Globe, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { formatUSD } from "@/lib/utils";
import { toPlanKey } from "@/lib/plan-key";
import type { Plan } from "@/types";
import {
  COVERAGE_COUNTRIES,
  planCoversCountry,
  resolveCountryForSearch,
  searchCoverageCountries,
} from "@/lib/coverage";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const BENEFIT_ITEMS = [
  { key: "apps", Icon: DeviceMobile },
  { key: "instant", Icon: Lightning },
  { key: "nopermanence", Icon: CurrencyDollar },
  { key: "coverage", Icon: Globe },
] as const;

interface BenefitsProps {
  /**
   * El catálogo, ya resuelto en el servidor.
   *
   * Antes esta sección lo pedía por su cuenta desde el navegador. Eso daba dos
   * cargas del mismo catálogo con dos decisiones de degradación independientes
   * —la portada podía servir el catálogo vivo mientras el buscador servía otro,
   * o ninguno— y dependía de que la clave pública de la base de datos estuviera
   * en el bundle del navegador. Cuando no lo estaba, el cliente reventaba antes
   * de poder recurrir a nada y la rejilla se quedaba vacía sin decir por qué.
   *
   * Ahora lo recibe hecho, del mismo `getPlans()` que alimenta la sección de
   * precios: una consulta, una decisión, dos consumidores.
   */
  plans: Plan[];
}

export default function Benefits({ plans }: BenefitsProps) {
  const t = useTranslations("benefits");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * País al que resuelve la consulta, o ninguno.
   *
   * Acepta el nombre completo, el código y los alias, y también lo tecleado a
   * medias mientras no haya duda: si de los 39 destinos solo uno empieza así,
   * es ese. Escribir «estados» ya basta para ver la cobertura de Estados
   * Unidos sin terminar la palabra.
   *
   * La decisión de cuándo hay duda vive en `coverage.ts`, no aquí: esta
   * sección no sabe nada de países ni de excepciones, solo pregunta.
   */
  const resolvedCountry = useMemo(() => resolveCountryForSearch(searchQuery), [searchQuery]);

  /** Sugerencias del desplegable. Aquí sí vale la subcadena: solo pinta. */
  const suggestions = useMemo(() => searchCoverageCountries(searchQuery), [searchQuery]);

  const featured = useMemo(() => COVERAGE_COUNTRIES.filter((c) => c.featured), []);

  const displayPlans = useMemo(() => {
    const mapped = plans.map((plan) => ({
      name: plan.name,
      gb: (plan.eu_data_gb || plan.data_gb || 0).toString(),
      href: plan.slug,
      price: formatUSD(plan.price_usd),
      recommended: plan.is_popular || false,
      // Clave comercial derivada del nombre público. Es lo único con lo que la
      // cobertura sabe hablar: no entiende de UUID ni de identificadores del
      // catálogo. Ver `plan-key.ts`.
      key: toPlanKey(plan.name),
    }));

    // El orden lo fija el catálogo (`position`); no se reordena por identidad.
    if (!resolvedCountry) return mapped;
    return mapped.filter((plan) => planCoversCountry(plan.key, resolvedCountry));
  }, [plans, resolvedCountry]);

  return (
    <section className="py-12 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">
        {/* Header - Ultra compacto */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-8"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-2 leading-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Grid: 3 beneficios regulares + 1 cobertura amplia */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {BENEFIT_ITEMS.slice(0, 3).map(({ key, Icon }) => (
            <motion.div
              key={key}
              variants={fadeUp}
              className="rounded-2xl bg-white border-2 border-[var(--color-border)] p-6 hover:shadow-md hover:border-[var(--color-gold)]/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4">
                <Icon size={20} weight="duotone" className="text-[var(--color-gold)]" />
              </div>
              <h3 className="text-lg font-black text-[var(--color-navy)] mb-2">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                {t(`items.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Coverage Card - Full Width Premium Experience */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="rounded-2xl bg-white border-2 border-[var(--color-border)] p-5 space-y-6"
        >
          {/* Header Compacto */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                <Globe size={20} weight="duotone" className="text-[var(--color-gold)]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--color-navy)]">
                  {t("items.coverage.title")}
                </h3>
                <p className="text-xs text-[var(--color-ink-2)]">
                  {t("items.coverage.desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Search - El Protagonista */}
          <div className="relative">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-2)]"
            />
            <input
              type="text"
              placeholder="Buscar país (ej: Polonia, Suiza, Turquía)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)]/80 transition-all"
            />
          </div>

          {/* Países Populares - Chips elegantes */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wide mb-2">Populares</p>
            <div className="flex flex-wrap gap-2">
              {featured.map(({ flag, code }) => (
                <motion.button
                  key={code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-gold)]/8 border-2 border-[var(--color-gold)]/40 hover:border-[var(--color-gold)]/80 hover:bg-[var(--color-gold)]/12 transition-all text-xs font-medium text-[var(--color-navy)]"
                >
                  <span>{flag}</span>
                  <span>{code}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resultados de búsqueda */}
          <AnimatePresence>
            {searchQuery.trim() && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {suggestions.map((country, idx) => (
                    <motion.div
                      key={country.code}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-warm-white)] hover:border-[var(--color-gold)]/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{country.flag}</span>
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-navy)]">{country.name}</p>
                          <p className="text-[11px] text-[var(--color-ink-2)]">4G/5G</p>
                        </div>
                      </div>
                      <Check size={16} weight="bold" className="text-emerald-500" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sin resultados */}
          {searchQuery.trim() && suggestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <p className="text-xs text-[var(--color-ink-2)]">No encontramos ese país. Intenta otro.</p>
            </motion.div>
          )}

          {/* Planes - Productos Premium */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <p className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wide mb-3">Elige tu plan</p>
            <div className="grid grid-cols-5 gap-2">
              {displayPlans.map((plan) => (
                <motion.a
                  key={plan.href}
                  href={`/es/compra?plan=${plan.href}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all group cursor-pointer relative ${
                    plan.recommended
                      ? "border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent hover:border-[var(--color-gold)]/70 hover:shadow-md"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-gold)] hover:shadow-md"
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-[var(--color-gold)] text-white text-[9px] font-bold whitespace-nowrap shadow-md">
                      RECOMENDADO
                    </div>
                  )}
                  <p className={`text-xs font-bold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors text-center ${plan.recommended ? "mt-4" : ""}`}>{plan.name}</p>
                  <p className="text-base font-black text-[var(--color-gold)] mt-1.5">{plan.gb}</p>
                  <p className="text-[9px] text-[var(--color-ink-2)] mt-0.5">GB en UE</p>
                  <p className="text-[10px] font-semibold text-[var(--color-navy)] mt-1.5 text-center">{plan.price}</p>
                </motion.a>
              ))}
            </div>
            {/*
              Aquí ponía «Después: 1,33 €/GB según normativa europea». El
              importe es válido para su supuesto, pero debajo de las cinco
              tarjetas se leía como si fuera el comportamiento normal del
              producto: no mencionaba que se puede renovar antes de tiempo,
              invocaba una normativa que no aplica a todos los destinos que
              cubrimos, y estaba en castellano también en portugués. La salida
              que le sirve a quien se queda sin datos es renovar, no una tarifa
              por giga.
            */}
            <p className="text-xs text-[var(--color-ink-2)] text-center mt-3">
              {t("renewal")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
