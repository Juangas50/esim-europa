"use client";

import { motion } from "framer-motion";
import { ArrowRight, DeviceMobile, Lightning, Globe, CheckCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import CountriesModal from "@/components/shared/CountriesModal";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  }),
};

export default function Hero({ minPrice }: { minPrice?: number }) {
  const t = useTranslations("hero");
  const [showCountries, setShowCountries] = useState(false);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Desktop: Aman Style - Narrative Integrated */}
      <div className="hidden md:flex relative h-[680px] lg:h-[720px] w-full pt-0">
        {/* Hero Image Background - Full coverage */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/imagen8.png"
            alt={t("heroAlt")}
            fill
            className="object-cover object-center w-full h-full"
            sizes="100vw"
            priority
          />

          {/* Overlay - Almost imperceptible (0.08 opacity) */}
          <div className="absolute inset-0 bg-black/8" />

          {/* Lateral gradient overlay - Left navy to right transparent (editorial style) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(27,47,78,0.6)] via-[rgba(27,47,78,0.3)] to-transparent" />
        </div>

        {/* BADGE DECORATIVE - Top right */}
        <motion.div
          custom={0.15}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[120px] right-[60px] z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(201,151,58,0.3)] bg-[rgba(201,151,58,0.08)] backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
            <span className="text-[11px] font-medium text-[rgba(201,151,58,0.8)] tracking-wide">
              Travel Connected
            </span>
          </div>
        </motion.div>

        {/* HEADLINE - Left aligned, floating */}
        <motion.h1
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[280px] left-20 lg:left-32 z-20 max-w-[500px] font-display text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        >
          {t("headline")}
        </motion.h1>

        {/* SUBHEADLINE - Left aligned, integrated */}
        <motion.p
          custom={0.35}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[480px] left-20 lg:left-32 z-20 max-w-[450px] text-lg text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
        >
          {t("sub")}
        </motion.p>

        {/* CTA PRIMARY - Left positioned, gold */}
        <motion.a
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          href="#planes"
          onClick={() => analytics.viewPlansClicked()}
          className="absolute top-[580px] left-20 lg:left-32 z-20 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[14px] bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-lg hover:bg-[var(--color-gold-light)] active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(201,151,58,0.3)]"
        >
          {t("cta")} <ArrowRight size={20} weight="bold" />
        </motion.a>

        {/* METRIC SUPERIOR FLOTANTE - Top right, 100K+ */}
        <motion.div
          custom={0.65}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[320px] right-[100px] z-20"
        >
          <div className="flex flex-col gap-2 px-5 py-4 rounded-[12px] bg-[rgba(201,151,58,0.08)] border border-[rgba(201,151,58,0.2)] backdrop-blur-sm shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
            <DeviceMobile size={26} weight="bold" className="text-[var(--color-gold)]" />
            <p className="text-2xl font-black font-mono text-white">100K+</p>
            <p className="text-xs text-white/75">{t("travelers")}</p>
          </div>
        </motion.div>

        {/* METRIC INFERIOR FLOTANTE - Bottom right, 2 min */}
        <motion.div
          custom={0.8}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[520px] right-[100px] z-20"
        >
          <div className="flex flex-col gap-2 px-5 py-4 rounded-[12px] bg-[rgba(201,151,58,0.08)] border border-[rgba(201,151,58,0.2)] backdrop-blur-sm shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
            <Lightning size={26} weight="bold" className="text-[var(--color-gold)]" />
            <p className="text-2xl font-black font-mono text-white">2 min</p>
            <p className="text-xs text-white/75">{t("activation")}</p>
          </div>
        </motion.div>

        {/* FADE BOTTOM - Elegant transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--color-warm-white)] pointer-events-none z-10" />
      </div>

      {/* Tablet: Same as desktop but compact */}
      <div className="hidden md:flex lg:hidden relative h-[600px] w-full pt-0">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/imagen8.png"
            alt={t("heroAlt")}
            fill
            className="object-cover object-center w-full h-full"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/8" />

          {/* Lateral gradient overlay - Left navy to right transparent (editorial style) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(27,47,78,0.6)] via-[rgba(27,47,78,0.3)] to-transparent" />
        </div>

        {/* Badge hidden on tablet to save space */}

        {/* Headline - Adjusted size */}
        <motion.h1
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[240px] left-10 z-20 max-w-[400px] font-display text-4xl lg:text-5xl text-white leading-[1.1] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        >
          {t("headline")}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={0.35}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[420px] left-10 z-20 max-w-[380px] text-base text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
        >
          {t("sub")}
        </motion.p>

        {/* CTA Primary */}
        <motion.a
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          href="#planes"
          onClick={() => analytics.viewPlansClicked()}
          className="absolute top-[510px] left-10 z-20 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-base hover:bg-[var(--color-gold-light)] active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(201,151,58,0.3)]"
        >
          {t("cta")} <ArrowRight size={18} weight="bold" />
        </motion.a>

        {/* Metrics - Stacked on right */}
        <motion.div
          custom={0.65}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="absolute top-[280px] right-10 z-20"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 px-4 py-3 rounded-[12px] bg-[rgba(201,151,58,0.08)] border border-[rgba(201,151,58,0.2)] backdrop-blur-sm shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
              <DeviceMobile size={22} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-xl font-black font-mono text-white">100K+</p>
              <p className="text-xs text-white/75">{t("travelers")}</p>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 rounded-[12px] bg-[rgba(201,151,58,0.08)] border border-[rgba(201,151,58,0.2)] backdrop-blur-sm shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
              <Lightning size={22} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-xl font-black font-mono text-white">2 min</p>
              <p className="text-xs text-white/75">{t("activation")}</p>
            </div>
          </div>
        </motion.div>

        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--color-warm-white)] pointer-events-none z-10" />
      </div>

      {/* Mobile: Image dominant, content below */}
      <div className="sm:hidden relative w-full">
        {/* Hero Image - Prominent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="relative w-full h-[480px] overflow-hidden"
        >
          <Image
            src="/images/imagen8.png"
            alt={t("heroAlt")}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(27,47,78,0.25)] via-[rgba(27,47,78,0.35)] to-[rgba(27,47,78,0.5)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(255,252,247,0.3)]" />
        </motion.div>

        {/* Content below - Mobile optimized */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
          className="relative z-10 px-4 pt-8 pb-12 bg-[var(--color-warm-white)]"
        >
          {/* Headline */}
          <motion.h1
            custom={0.2}
            variants={fadeUp}
            className="font-display text-3xl text-center text-[var(--color-navy)] leading-[1.1] mb-4"
          >
            {t("headline")}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            custom={0.35}
            variants={fadeUp}
            className="text-sm text-center text-[var(--color-ink)] leading-relaxed mb-8"
          >
            {t("sub")}
          </motion.p>

          {/* CTA Button - Full width */}
          <motion.a
            custom={0.5}
            variants={fadeUp}
            href="#planes"
            onClick={() => analytics.viewPlansClicked()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-base hover:bg-[var(--color-gold-light)] active:scale-[0.97] transition-all shadow-[0_3px_10px_rgba(201,151,58,0.2)] mb-8"
          >
            {t("cta")} <ArrowRight size={16} weight="bold" />
          </motion.a>

          {/* Price anchor */}
          {minPrice != null && (
            <motion.p
              custom={0.65}
              variants={fadeUp}
              className="text-center text-[var(--color-ink-2)] text-xs font-medium mb-10"
            >
              {t("priceAnchor", { price: formatUSD(minPrice) })} • {t("noAutoRenew")}
            </motion.p>
          )}

          {/* Metrics - Grid 2x2 */}
          <motion.div
            custom={0.8}
            variants={fadeUp}
            className="grid grid-cols-2 gap-3 pt-8 border-t border-[var(--color-border)]"
          >
            <div className="flex flex-col gap-2">
              <DeviceMobile size={20} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-lg font-black font-mono text-[var(--color-navy)]">100K+</p>
              <p className="text-xs text-[var(--color-ink-2)]">{t("travelers")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Lightning size={20} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-lg font-black font-mono text-[var(--color-navy)]">2 min</p>
              <p className="text-xs text-[var(--color-ink-2)]">{t("activation")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Globe size={20} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-lg font-black font-mono text-[var(--color-navy)]">30+</p>
              <p className="text-xs text-[var(--color-ink-2)]">{t("countries")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <CheckCircle size={20} weight="bold" className="text-[var(--color-gold)]" />
              <p className="text-lg font-black font-mono text-[var(--color-navy)]">24/7</p>
              <p className="text-xs text-[var(--color-ink-2)]">{t("support")}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal */}
      <CountriesModal isOpen={showCountries} onClose={() => setShowCountries(false)} />
    </section>
  );
}
