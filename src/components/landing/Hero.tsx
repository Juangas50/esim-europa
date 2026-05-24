"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Stagger config — Emil Kowalski: 40-60ms entre items
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

// Visual del Hero: card eSIM animada
function EsimVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" aria-hidden="true">
      {/* Blob de fondo */}
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#6EC1E4]/20 via-[#A8D8F0]/10 to-[#E60000]/8 blur-3xl" />

      {/* Card principal — Double Bezel (soft-skill) */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
        className="relative rounded-[2rem] p-2 bg-white/60 border border-white/80 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.12)]"
      >
        <div className="rounded-[1.6rem] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
          {/* Header de la card */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#999]">RUTA34 Telecom</p>
              <p className="text-base font-bold text-[#111]">Europa Prepago</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E60000] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(230,0,0,0.4)]">
              <span className="text-white text-xs font-black">34</span>
            </div>
          </div>

          {/* QR placeholder */}
          <div className="w-full aspect-square max-w-[140px] mx-auto mb-5 rounded-xl bg-[#F8F8F8] border border-black/6 flex items-center justify-center">
            <QRPlaceholder />
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F8F8F8] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-0.5">Datos</p>
              <p className="text-lg font-black text-[#111]">20 GB</p>
            </div>
            <div className="rounded-xl bg-[#F8F8F8] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-0.5">Duración</p>
              <p className="text-lg font-black text-[#111]">28 días</p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-3 rounded-xl bg-[#ECFDF5] border border-emerald-100 p-3 flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-xs font-semibold text-emerald-700">Listo para activar</span>
          </div>
        </div>
      </motion.div>

      {/* Badge flotante — países */}
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT }}
        className="absolute -right-4 top-8 bg-white rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] border border-black/5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">Cobertura</p>
        <p className="text-sm font-bold text-[#111]">30+ países</p>
      </motion.div>

      {/* Badge flotante — activación */}
      <motion.div
        initial={{ opacity: 0, x: -16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.75, ease: EASE_OUT }}
        className="absolute -left-4 bottom-8 bg-[#111111] rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Activación</p>
        <p className="text-sm font-bold text-white">En 60 segundos</p>
      </motion.div>
    </div>
  );
}

// QR placeholder con patrón SVG
function QRPlaceholder() {
  const cells: number[] = [];
  const size = 11;
  // Seed determinista para el patrón visual
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
          <rect
            key={i}
            x={col * 6 + 1}
            y={row * 6 + 1}
            width={5}
            height={5}
            rx={1}
            fill="#111111"
          />
        ) : null;
      })}
    </svg>
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

            {/* Headline — taste-skill: no centered, massive bold grotesk */}
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

            {/* CTAs — taste-skill: button-in-button trailing icon */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <a
                href="#planes"
                className="inline-flex items-center gap-2.5 bg-[#E60000] text-white font-bold text-base px-7 py-3.5 rounded-full hover:bg-[#CC0000] active:scale-[0.97] shadow-[0_4px_20px_-4px_rgba(230,0,0,0.4)]"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
              >
                {t("cta")}
                {/* Button-in-button trailing icon */}
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center -mr-1">
                  <ArrowRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
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

            {/* Trust indicators — stagger interno */}
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
            <EsimVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
