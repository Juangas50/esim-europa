"use client";

import { motion } from "framer-motion";

interface HelpHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
}

export function HelpHero({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
}: HelpHeroProps) {
  return (
    <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] overflow-hidden">
      {/* Background Image */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay - Dark left to transparent right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(27,47,78,0.5)] via-[rgba(27,47,78,0.3)] to-transparent z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 px-6 sm:px-12 py-12 sm:py-20 h-full flex flex-col justify-center max-w-3xl">
        {/* White Gradient Background Behind Text */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/70 to-transparent z-0" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black text-[var(--color-navy)] leading-tight mb-4">
              {title}
            </h1>

            {subtitle && (
              <p className="text-xl sm:text-2xl text-[var(--color-gold)] font-semibold mb-4">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
