"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface DestinationHeroProps {
  country: string;
  flag: string;
  headline: string;
  subheadline: string;
  coverage: string;
  speed: string;
  priceUSD: string;
}

export default function DestinationHero({
  country,
  flag,
  headline,
  subheadline,
  coverage,
  speed,
  priceUSD,
}: DestinationHeroProps) {
  const locale = useLocale();
  const t = useTranslations("landing");

  return (
    <section className="min-h-[100dvh] flex items-center pt-24 pb-16 px-4 bg-[#FAF7F2]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Country Badge */}
          <div className="flex items-center gap-3">
            <span className="text-5xl">{flag}</span>
            <span className="text-lg font-bold text-[#1B2F4E] tracking-tight">
              {country}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black text-[#1B2F4E] tracking-tighter leading-tight max-w-3xl">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-[#64748B] leading-relaxed max-w-2xl">
            {subheadline}
          </p>

          {/* Coverage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl pt-8">
            {/* Coverage */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Cobertura
              </p>
              <p className="text-3xl font-black text-[#1B2F4E]">{coverage}</p>
            </div>

            {/* Speed */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Velocidad
              </p>
              <p className="text-3xl font-black text-[#1B2F4E]">{speed}</p>
            </div>

            {/* Price */}
            <div className="rounded-2xl bg-white border border-black/[0.07] p-6">
              <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Desde
              </p>
              <p className="text-3xl font-black text-[#C9973A]">USD {priceUSD}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-4">
            <Link href={`/${locale}/compra?destination=${country.toLowerCase()}`}>
              <Button variant="primary" size="lg">
                Comprar eSIM para {country}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
