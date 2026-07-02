"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

interface HelpCardProps {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

export function HelpCard({
  title,
  description,
  href,
  icon,
}: HelpCardProps) {
  const locale = useLocale();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/${locale}${href}`}>
        <div className="h-full p-8 sm:p-10 bg-white border border-[#E9E2D8] rounded-3xl hover:shadow-lg transition-all cursor-pointer">
          {icon && (
            <div className="mb-6 text-4xl">
              {icon}
            </div>
          )}
          <h3 className="text-2xl font-black text-[var(--color-navy)] mb-2">
            {title}
          </h3>
          <p className="text-[var(--color-ink-2)] leading-relaxed">
            {description}
          </p>
          <div className="mt-6 flex items-center gap-2 text-[var(--color-gold)] font-semibold">
            Ir →
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
