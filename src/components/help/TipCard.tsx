"use client";

import { motion } from "framer-motion";

interface TipCardProps {
  title: string;
  description: string;
  variant?: "tip" | "warning" | "success";
}

export function TipCard({
  title,
  description,
  variant = "tip",
}: TipCardProps) {
  const variants = {
    tip: {
      bg: "bg-[var(--color-gold)]/5",
      border: "border-l-4 border-[var(--color-gold)]",
      label: "Consejo",
    },
    warning: {
      bg: "bg-red-50/30",
      border: "border-l-4 border-red-500",
      label: "Atención",
    },
    success: {
      bg: "bg-green-50/30",
      border: "border-l-4 border-green-500",
      label: "Éxito",
    },
  };

  const config = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-5 rounded-2xl ${config.bg} ${config.border}`}
    >
      <p className="text-sm text-[var(--color-ink-2)]">
        <span className="font-bold text-[var(--color-navy)]">{config.label}:</span>{" "}
        {description}
      </p>
    </motion.div>
  );
}
