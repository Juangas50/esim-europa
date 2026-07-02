"use client";

import { motion } from "framer-motion";
import { CTAWhatsApp } from "./CTAWhatsApp";

export function BottomHelpBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-16 sm:my-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy)]/80 text-white text-center"
    >
      <h3 className="text-2xl sm:text-3xl font-black mb-4">
        ¿Necesitás más ayuda?
      </h3>
      <p className="text-white/80 mb-8 max-w-2xl mx-auto">
        Nuestro equipo de soporte está disponible 24/7 para resolver cualquier duda sobre tu eSIM.
      </p>
      <CTAWhatsApp />
    </motion.div>
  );
}
