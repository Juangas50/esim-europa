"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { DeviceMobile, Lightning, CurrencyDollar, Globe, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

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

// Países con cobertura en planes UE
// Estados Unidos está disponible en Plus, Total, Max, Premium (NO en Básico)
const COUNTRY_DATA = {
  featured: [
    { name: "España", flag: "🇪🇸", code: "ES" },
    { name: "Francia", flag: "🇫🇷", code: "FR" },
    { name: "Italia", flag: "🇮🇹", code: "IT" },
    { name: "Alemania", flag: "🇩🇪", code: "DE" },
    { name: "Portugal", flag: "🇵🇹", code: "PT" },
  ],
  all: [
    { name: "Austria", flag: "🇦🇹", code: "AT", allPlans: true },
    { name: "Bélgica", flag: "🇧🇪", code: "BE", allPlans: true },
    { name: "Bulgaria", flag: "🇧🇬", code: "BG", allPlans: true },
    { name: "Chipre", flag: "🇨🇾", code: "CY", allPlans: true },
    { name: "Croacia", flag: "🇭🇷", code: "HR", allPlans: true },
    { name: "Rep. Checa", flag: "🇨🇿", code: "CZ", allPlans: true },
    { name: "Dinamarca", flag: "🇩🇰", code: "DK", allPlans: true },
    { name: "Eslovaquia", flag: "🇸🇰", code: "SK", allPlans: true },
    { name: "Eslovenia", flag: "🇸🇮", code: "SI", allPlans: true },
    { name: "Estonia", flag: "🇪🇪", code: "EE", allPlans: true },
    { name: "Estados Unidos", flag: "🇺🇸", code: "US", allPlans: false, excludes: "local-s" },
    { name: "Finlandia", flag: "🇫🇮", code: "FI", allPlans: true },
    { name: "Grecia", flag: "🇬🇷", code: "GR", allPlans: true },
    { name: "Hungría", flag: "🇭🇺", code: "HU", allPlans: true },
    { name: "Irlanda", flag: "🇮🇪", code: "IE", allPlans: true },
    { name: "Islandia", flag: "🇮🇸", code: "IS", allPlans: true },
    { name: "Kosovo", flag: "🇽🇰", code: "XK", allPlans: true },
    { name: "Letonia", flag: "🇱🇻", code: "LV", allPlans: true },
    { name: "Liechtenstein", flag: "🇱🇮", code: "LI", allPlans: true },
    { name: "Lituania", flag: "🇱🇹", code: "LT", allPlans: true },
    { name: "Luxemburgo", flag: "🇱🇺", code: "LU", allPlans: true },
    { name: "Malta", flag: "🇲🇹", code: "MT", allPlans: true },
    { name: "Moldavia", flag: "🇲🇩", code: "MD", allPlans: true },
    { name: "Mónaco", flag: "🇲🇨", code: "MC", allPlans: true },
    { name: "Holanda", flag: "🇳🇱", code: "NL", allPlans: true },
    { name: "Noruega", flag: "🇳🇴", code: "NO", allPlans: true },
    { name: "Polonia", flag: "🇵🇱", code: "PL", allPlans: true },
    { name: "Reino Unido", flag: "🇬🇧", code: "GB", allPlans: true },
    { name: "Rumania", flag: "🇷🇴", code: "RO", allPlans: true },
    { name: "Suecia", flag: "🇸🇪", code: "SE", allPlans: true },
    { name: "Suiza", flag: "🇨🇭", code: "CH", allPlans: true },
    { name: "Turquía", flag: "🇹🇷", code: "TR", allPlans: true },
    { name: "Ucrania", flag: "🇺🇦", code: "UA", allPlans: true },
    { name: "Vaticano", flag: "🇻🇦", code: "VA", allPlans: true },
  ],
};

export default function Benefits() {
  const t = useTranslations("benefits");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearchingUS = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    // Solo oculta Básico con mínimo 3 caracteres que coincidan con "ESTADOS" o "USA"
    if (query.length < 3) return false;
    return (
      "estados".startsWith(query) ||
      "usa".startsWith(query) ||
      query.includes("estados") ||
      query.includes("usa")
    );
  }, [searchQuery]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return COUNTRY_DATA.all.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const displayPlans = useMemo(() => {
    const plans = [
      { name: "Básico", gb: "15", href: "local-s", price: "$19.9", recommended: false, excludes: ["US"] },
      { name: "Plus", gb: "23", href: "local-m", price: "$29.9", recommended: true, excludes: [] },
      { name: "Total", gb: "31", href: "local-l", price: "$39.9", recommended: false, excludes: [] },
      { name: "Max", gb: "37", href: "local-xl", price: "$49.9", recommended: false, excludes: [] },
      { name: "Premium", gb: "52", href: "local-xxl", price: "$69.9", recommended: false, excludes: [] },
    ];

    if (isSearchingUS) {
      return plans.filter((plan) => !plan.excludes.includes("US"));
    }
    return plans;
  }, [isSearchingUS]);

  return (
    <section className="py-24 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">
        {/* Header - Ultra compacto */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-16"
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
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
          className="rounded-2xl bg-white border-2 border-[var(--color-border)] p-8 space-y-6"
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
              {COUNTRY_DATA.featured.map(({ name, flag, code }) => (
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
            {searchQuery.trim() && filteredCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {filteredCountries.map((country, idx) => (
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
          {searchQuery.trim() && filteredCountries.length === 0 && (
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
            <p className="text-xs text-[var(--color-ink-2)] text-center mt-3">
              Después: 1,33 €/GB según normativa europea
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
