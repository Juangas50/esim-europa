"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";

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

// Hero visual: foto de viaje + card eSIM flotante
function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" aria-hidden="true">
      {/* Blob de fondo */}
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#6EC1E4]/20 via-[#A8D8F0]/10 to-[#E60000]/8 blur-3xl" />

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
        className="relative rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.22)]"
      >
        {/* Foto de viaje */}
        <div className="relative w-full" style={{ paddingBottom: "125%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=560&h=700&fit=crop&q=80"
            alt="Viajando por Europa"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradiente para legibilidad de la card */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/10 to-transparent" />
        </div>

        {/* Card eSIM flotante en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            {/* Header de la card */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999]">RUTA34 Telecom</p>
                <p className="text-sm font-bold text-[#111]">Europa Prepago</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E60000] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(230,0,0,0.4)]">
                  <span className="text-white text-[10px] font-black">34</span>
                </div>
              </div>
            </div>

            {/* Stats compactos */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl bg-[#F8F8F8] p-2.5 text-center">
                <p className="text-base font-black text-[#111]">20 GB</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#999]">Datos</p>
              </div>
              <div className="rounded-xl bg-[#F8F8F8] p-2.5 text-center">
                <p className="text-base font-black text-[#111]">28d</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#999]">Duración</p>
              </div>
              <div className="rounded-xl bg-[#F8F8F8] p-2.5 text-center">
                <p className="text-base font-black text-[#111]">30+</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#999]">Países</p>
              </div>
            </div>

            {/* QR placeholder compacto */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-black/8 shrink-0">
                <QRPlaceholder />
              </div>
              {/* Status */}
              <div className="rounded-xl bg-[#ECFDF5] border border-emerald-100 p-2 flex items-center gap-2 flex-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-xs font-semibold text-emerald-700">Listo para activar</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge flotante — países */}
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7, ease: EASE_OUT }}
        className="absolute -right-3 top-8 bg-white rounded-2xl px-3.5 py-2 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)] border border-black/5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">Cobertura</p>
        <p className="text-sm font-bold text-[#111]">30+ países 🇪🇺</p>
      </motion.div>

      {/* Badge flotante — activación */}
      <motion.div
        initial={{ opacity: 0, x: -16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EASE_OUT }}
        className="absolute -left-3 top-[30%] bg-[#111111] rounded-2xl px-3.5 py-2 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Activación</p>
        <p className="text-sm font-bold text-white">En 60 seg ⚡</p>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const t = useTranslations("hero");

  const trustItems = [
    { label: t("trust1") },
    { label: t("trust2") },
    { label: t("trust3") },
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
            <motion.p variants={fadeUp} className="text-sm text-[#999] mb-8">
              {t("priceAnchor")}
            </motion.p>

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
