"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface DestinationHeroProps {
  country: string;
  flag: string;
  headline: string;
  subheadline: string;
  coverage: string;
  speed: string;
  priceUSD: string;
}

const EASE_OUT = [0.23, 1, 0.32, 1];

export default function DestinationHero({
  country,
  flag,
  headline,
  subheadline,
  coverage,
  speed,
  priceUSD,
}: DestinationHeroProps) {
  const locale = useLocale();
  const t = useTranslations("landing");

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
  };

  return (
    <section className="min-h-[100dvh] flex items-center pt-24 pb-16 px-4 bg-[#FAF7F2]">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-8"
        >
          {/* Country Badge */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="text-5xl">{flag}</span>
            <span className="text-lg font-bold text-[#1B2F4E] tracking-tight">
              {country}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black text-[#1B2F4E] tracking-tighter leading-tight max-w-3xl"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-xl text-[#64748B] leading-relaxed max-w-2xl"
          >
            {subheadline}
          </motion.p>

          {/* Coverage Stats */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl pt-8"
          >
            {/* Coverage */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Cobertura
              </p>
              <p className="text-3xl font-black text-[#1B2F4E]">{coverage}</p>
            </div>

            {/* Speed */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Velocidad
              </p>
              <p className="text-3xl font-black text-[#1B2F4E]">{speed}</p>
            </div>

            {/* Price */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Desde
              </p>
              <p className="text-3xl font-black text-[#C9973A]">USD {priceUSD}</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex gap-3 pt-4">
            <Link href={`/${locale}/compra?destination=${country.toLowerCase()}`}>
              <Button variant="primary" size="lg">
                Comprar eSIM para {country}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
