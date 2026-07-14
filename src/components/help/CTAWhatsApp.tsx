"use client";

import { motion } from "framer-motion";
import { WHATSAPP_URL } from "@/config/constants";

export function CTAWhatsApp() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-lg transition-all"
    >
      <span>💬</span>
      Contactar por WhatsApp
    </motion.a>
  );
}
