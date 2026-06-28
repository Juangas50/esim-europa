"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, DeviceMobile, Lightning, Globe } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

// Fondo animado con líneas de rutas
function RouteBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Línea diagonal principal — ruta de viaje */}
        <line x1="0" y1="0" x2="1200" y2="800" stroke="#06B6D4" strokeWidth="2" opacity="0.12" />
        {/* Líneas secundarias */}
        <line x1="200" y1="100" x2="1000" y2="700" stroke="#F59E0B" strokeWidth="1.5" opacity="0.08" />
        <line x1="100" y1="600" x2="900" y2="200" stroke="#C9973A" strokeWidth="1.5" opacity="0.06" />
        {/* Puntos de ciudades */}
        <circle cx="200" cy="150" r="4" fill="#F59E0B" opacity="0.25" />
        <circle cx="800" cy="700" r="4" fill="#06B6D4" opacity="0.25" />
      </svg>
      {/* Gradiente overlay — más oscuro para mejor contraste */}
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.85]" />
      {/* Overlay adicional para textos claros */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}

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
          <rect key={i} x={col * 6 + 1} y={row * 6 + 1} width={5} height={5} rx={1} fill="#1B2F4E" />
        ) : null;
      })}
    </svg>
  );
}

// Hero visual: foto de viaje + card eSIM glassmorphism
function HeroVisual() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none" aria-hidden="true">
      {/* Glow de marca — acento sutil en una esquina, no blob genérico */}
      <div className="absolute -bottom-6 -right-6 w-52 h-52 rounded-full bg-[#C9973A]/20 blur-3xl pointer-events-none" />

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
              <div className="w-8 h-8 rounded-xl bg-[#C9973A] flex items-center justify-center shadow-[0_4px_16px_-2px_rgba(230,0,0,0.55)]">
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
        <p className="text-sm font-black text-[#1B2F4E]">30+ países 🇪🇸🇪🇺</p>
      </motion.div>
    </div>
  );
}

interface HeroProps {
  minPrice?: number;
}

export default function Hero({ minPrice }: HeroProps) {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
      {/* Fondo animado con gradiente + rutas */}
      <RouteBackground />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
        >
          {/* LEFT — Contenido AUDAZ */}
          <div className="flex-1 flex flex-col items-start justify-center">

            {/* Badge de energía */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-sm font-semibold text-white">{t("eyebrow")}</span>
              </div>
            </motion.div>

            {/* Headline en Prata — AUDAZ */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 max-w-xl"
            >
              {t("headline")}
            </motion.h1>

            {/* Subheadline — directa, sin rodeos */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-white/90 leading-relaxed mb-10 max-w-md"
            >
              {t("sub")}
            </motion.p>

            {/* CTA PRIMARIA — ENORME Y OBVIO */}
            <motion.div variants={fadeUp} className="mb-10 w-full sm:w-auto">
              <a
                href="#planes"
                onClick={() => analytics.viewPlansClicked()}
                className="block w-full sm:w-auto bg-[#C9973A] text-white font-bold text-lg px-12 py-5 rounded-xl hover:bg-[#E8C56A] active:scale-[0.98] shadow-premium-teal transition-all duration-200 text-center"
              >
                COMPRAR AHORA
              </a>
            </motion.div>

            {/* Subtext con precio */}
            {minPrice != null && (
              <motion.p variants={fadeUp} className="text-white/75 text-sm font-semibold">
                {t("priceAnchor", { price: formatUSD(minPrice) })} • Sin renovación automática
              </motion.p>
            )}
          </div>

          {/* RIGHT — Visual del teléfono */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </motion.div>

        {/* Trust Stats — 3 columnas abajo */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 pt-16 border-t border-white/10"
        >
          <div className="flex flex-col items-center sm:items-start text-white">
            <div className="flex items-baseline gap-4 mb-2">
              <DeviceMobile size={32} weight="bold" className="text-[#F59E0B]" />
              <p className="text-3xl font-black font-mono">100K+</p>
            </div>
            <p className="text-white text-sm">Viajeros confían</p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-white">
            <div className="flex items-baseline gap-4 mb-2">
              <Lightning size={32} weight="bold" className="text-[#06B6D4]" />
              <p className="text-3xl font-black font-mono">2 min</p>
            </div>
            <p className="text-white text-sm">Activación con QR</p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-white">
            <div className="flex items-baseline gap-4 mb-2">
              <Globe size={32} weight="bold" className="text-[#06B6D4]" />
              <p className="text-3xl font-black font-mono">30+</p>
            </div>
            <p className="text-white text-sm">Países cubiertos</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
