"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

// QR placeholder con patrón SVG
function QRPlaceholder() {
  const size = 11;
  const pattern = [
    1,1,1,1,1,1,1,0,1,0,1,
    1,0,0,0,0,0,1,0,0,1,0,
    1,0,1,1,1,0,1,0,1,0,1,
    1,0,1,1,1,0,1,0,0,1,0,
    1,0,1,1,1,0,1,0,1,1,1,
    1,0,0,0,0,0,1,0,0,0,1,
    1,1,1,1,1,1,1,0,1,0,1,
    0,0,0,0,0,0,0,0,1,1,0,
    1,0,1,1,0,1,1,0,1,0,1,
    0,1,0,0,1,0,0,0,0,1,0,
    1,1,1,1,0,1,1,0,1,0,1,
  ];
  return (
    <svg viewBox={`0 0 ${size * 6} ${size * 6}`} className="w-full h-full p-2">
      {pattern.map((cell, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        return cell ? (
          <rect key={i} x={col * 6 + 1} y={row * 6 + 1} width={5} height={5} rx={1} fill="#111111" />
        ) : null;
      })}
    </svg>
  );
}

// Hero visual: foto de viaje + card eSIM glassmorphism
function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" aria-hidden="true">
      {/* Glow de marca — acento sutil en una esquina, no blob genérico */}
      <div className="absolute -bottom-6 -right-6 w-52 h-52 rounded-full bg-[#E60000]/20 blur-3xl pointer-events-none" />

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
        className="relative rounded-[2rem] overflow-hidden shadow-[0_48px_100px_-20px_rgba(0,0,0,0.38)]"
      >
        {/* Foto de viaje */}
        <div className="relative w-full" style={{ paddingBottom: "132%" }}>
          <Image
            src="/images/imagen8.png"
            alt="Viajando por Europa con internet desde que aterrizás"
            fill
            className="object-cover [object-position:50%_8%]"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
          />
          {/* Gradiente continuo — sin corte brusco hacia la card */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-[48%] to-transparent" />
        </div>

        {/* Card glassmorphism — estado post-activación: ya estás conectado */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.13] p-3.5">

            {/* Header: operador + señal + ubicación */}
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">RUTA34 Telecom</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Barras de señal */}
                  <div className="flex items-end gap-[2px]">
                    {[4, 6, 8, 10, 12].map((h, i) => (
                      <div
                        key={i}
                        className="w-[3px] rounded-sm"
                        style={{ height: `${h}px`, backgroundColor: "#4ade80" }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">5G</span>
                  <span className="text-[10px] font-semibold text-white/55">Madrid, España 🇪🇸</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#E60000] flex items-center justify-center shadow-[0_4px_16px_-2px_rgba(230,0,0,0.55)]">
                <span className="text-white text-[10px] font-black tracking-tighter">34</span>
              </div>
            </div>

            {/* Status: conectado */}
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/25 px-3 py-2 mb-2.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-[11px] font-bold text-emerald-300">Conectado desde que aterrizaste</p>
            </div>

            {/* QR + instrucción */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1.5 shrink-0">
                <QRPlaceholder />
              </div>
              <div>
                <p className="text-[11px] font-black text-white leading-tight">Escaneá el QR</p>
                <p className="text-[10px] text-white/50 mt-0.5">Activá en menos de 2 min</p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Un único badge flotante — sin competencia visual */}
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7, ease: EASE_OUT }}
        className="absolute -right-4 top-7 bg-white rounded-2xl px-3.5 py-2.5 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18)] border border-black/[0.06]"
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#aaa] mb-0.5">Cobertura</p>
        <p className="text-sm font-black text-[#111]">30+ países 🇪🇸🇪🇺</p>
      </motion.div>
    </div>
  );
}

interface HeroProps {
  minPrice?: number;
}

export default function Hero({ minPrice }: HeroProps) {
  const t = useTranslations("hero");

  const trustItems = [
    { label: t("trust1") },
    { label: t("trust2") },
    { label: t("trust3") },
    { label: t("trust4") },
    { label: t("trust5") },
  ];

  return (
    <section className="min-h-[100dvh] flex items-center pt-24 pb-16 px-4">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — Contenido */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-5">
              <Badge variant="blue">{t("eyebrow")}</Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-[#111111] tracking-tight leading-[1.05] mb-5 max-w-[520px]"
            >
              {t("headline")}
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-[#555555] leading-relaxed mb-8 max-w-[460px]"
            >
              {t("sub")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3 mb-3"
            >
              <a
                href="#planes"
                className="inline-flex items-center gap-2.5 bg-[#E60000] text-white font-bold text-base px-7 py-3.5 rounded-full hover:bg-[#CC0000] active:scale-[0.97] shadow-[0_4px_20px_-4px_rgba(230,0,0,0.4)]"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
              >
                {t("cta")}
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center -mr-1">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </a>

              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 text-[#111111] font-semibold text-base px-5 py-3.5 rounded-full border border-[#111111]/12 hover:bg-[#111111]/5 active:scale-[0.97]"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
              >
                {t("ctaSecondary")}
              </a>
            </motion.div>

            {/* Precio ancla — reduce friction */}
            {minPrice != null && (
              <motion.p variants={fadeUp} className="text-sm text-[#555555] font-semibold mb-8">
                {t("priceAnchor", { price: formatUSD(minPrice) })}
              </motion.p>
            )}

            {/* Trust indicators */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              {trustItems.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" className="text-[#E60000]" />
                  <span className="text-sm font-semibold text-[#555555]">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Visual */}
          <div className="flex justify-center lg:justify-end">
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
