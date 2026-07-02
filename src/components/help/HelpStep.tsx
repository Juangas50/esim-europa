"use client";

import { motion } from "framer-motion";

interface HelpStepProps {
  number: number;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  tip?: string;
  warning?: string;
}

export function HelpStep({
  number,
  title,
  description,
  imageSrc,
  imageAlt,
  tip,
  warning,
}: HelpStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12 sm:mb-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Left: Image */}
        {imageSrc && (
          <div className="order-2 md:order-1">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--color-warm-white)]">
              <img
                src={imageSrc}
                alt={imageAlt || `Paso ${number}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Right: Content */}
        <div className={`order-1 ${imageSrc ? "md:order-2" : ""}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gold)] text-white font-black text-lg flex items-center justify-center flex-shrink-0">
              {number}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-navy)] leading-tight">
              {title}
            </h2>
          </div>

          <p className="text-base text-[var(--color-ink-2)] leading-relaxed mb-6 max-w-lg">
            {description}
          </p>

          {tip && (
            <div className="mb-4 p-4 rounded-2xl bg-[var(--color-gold)]/5 border-l-4 border-[var(--color-gold)]">
              <p className="text-sm text-[var(--color-ink-2)]">
                <span className="font-bold text-[var(--color-navy)]">Consejo:</span> {tip}
              </p>
            </div>
          )}

          {warning && (
            <div className="p-4 rounded-2xl bg-red-50/30 border-l-4 border-red-500">
              <p className="text-sm text-red-900">
                <span className="font-bold">Atención:</span> {warning}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
