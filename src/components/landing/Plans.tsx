"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Globe, Phone, Clock, Info } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import PremiumTooltip from "@/components/ui/PremiumTooltip";
import FlagIcon from "@/components/ui/FlagIcon";
import PlansCarousel from "@/components/landing/PlansCarousel";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { trackSelectPlan, trackViewPlans } from "@/lib/analytics-ga4";
import { useMetaEvents } from "@/hooks/useMetaEvents";
import { sortByPosition } from "@/lib/plans";
import type { Plan } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface PlansProps {
  plans: Plan[];
}

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const sorted = sortByPosition(plans);
  const { trackViewContentList } = useMetaEvents();

  useEffect(() => {
    if (plans.length > 0) {
      trackViewPlans(
        plans.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price_usd,
        }))
      );
      // Meta Pixel + CAPI — ViewContent (product_group)
      trackViewContentList(plans.map((p) => ({ id: p.id, name: p.name, price_usd: p.price_usd })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  if (sorted.length === 0) return null;

  const popularPlan = sorted.find((p) => p.is_popular);

  return (
    <section id="planes" className="py-8 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto lg:max-w-[1440px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="max-w-3xl mx-auto mb-6 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-navy)] mb-2">
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-ink-2)]">
            Internet para viajar por España y Europa, desde que llegás.
          </p>
        </motion.div>

        {/* Common Benefits — Shared across all plans */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 text-center"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-gold)]">✓</span>
            <span className="text-xs md:text-sm text-[var(--color-ink-2)] font-medium">
              Conexión 5G
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-gold)]">✓</span>
            <span className="text-xs md:text-sm text-[var(--color-ink-2)] font-medium">
              Número español incluido
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-gold)]">✓</span>
            <span className="text-xs md:text-sm text-[var(--color-ink-2)] font-medium">
              Sin renovación automática
            </span>
          </div>
        </motion.div>

        {/* Plans Carousel — Elegant carousel with controls */}
        <PlansCarousel
          plans={sorted}
          popularId={popularPlan?.id}
        />

      </div>
    </section>
  );
}
