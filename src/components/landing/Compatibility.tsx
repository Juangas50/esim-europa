"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import DeviceCompatibilityFinder from "./DeviceCompatibilityFinder";
import Image from "next/image";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Compatibility() {
  const t = useTranslations("compatibility");

  return (
    <section id="compatibilidad" className="py-14 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Header + Finder */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
              <span className="w-3 h-3 rounded-full bg-[var(--color-gold)]"></span>
              <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wide">
                Compatible con tu dispositivo
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] leading-tight">
              {t("title")}
            </h2>

            {/* Description */}
            <p className="text-base text-[var(--color-ink)] leading-relaxed max-w-md">
              {t("subtitle")}
            </p>

            {/* Finder */}
            <DeviceCompatibilityFinder />
          </motion.div>

          {/* RIGHT: Visual - Premium Image Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            className="hidden lg:flex items-start justify-center pt-0"
          >
            <div className="relative w-full h-full max-w-lg">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"></div>

              {/* Device Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/images/ChatGPT Image 4 jul 2026, 16_46_13.png"
                  alt="Dispositivos compatibles con eSIM"
                  width={500}
                  height={600}
                  className="object-contain drop-shadow-2xl"
                  priority={false}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
