"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Image from "next/image";
import { MagnifyingGlass, Check, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const MANUFACTURERS = [
  {
    id: "iphone",
    name: "iPhone",
    icon: "🍎",
    minModel: "XS o superior",
    models: ["iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone XS/XR"],
  },
  {
    id: "samsung",
    name: "Samsung",
    icon: "📱",
    minModel: "Galaxy S20 o superior",
    models: ["Galaxy S24", "Galaxy S23", "Galaxy S22", "Galaxy S21", "Galaxy S20"],
  },
  {
    id: "pixel",
    name: "Google Pixel",
    icon: "🔵",
    minModel: "Pixel 4a o superior",
    models: ["Pixel 9", "Pixel 8", "Pixel 7", "Pixel 6", "Pixel 4a"],
  },
  {
    id: "motorola",
    name: "Motorola",
    icon: "📱",
    minModel: "Razr 2019 o superior",
    models: ["Razr 50 Ultra", "Edge 50", "Edge 40", "Razr 5G", "Razr 2019"],
  },
];

const SEARCH_MODELS = [
  "iPhone 15", "iPhone 15 Pro", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11",
  "Galaxy S24", "Galaxy S23", "Galaxy S22", "Galaxy S21", "Galaxy S20",
  "Pixel 9", "Pixel 8", "Pixel 7", "Pixel 6",
  "Motorola Edge 50", "Motorola Razr 50", "Motorola Edge 40",
];

export default function Compatibility() {
  const t = useTranslations("compatibility");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMfg, setSelectedMfg] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SEARCH_MODELS.filter((model) =>
      model.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const visibleMfgs = MANUFACTURERS.slice(carouselIndex, carouselIndex + 3);
  const hasNext = carouselIndex + 3 < MANUFACTURERS.length;
  const hasPrev = carouselIndex > 0;

  return (
    <section id="compatibilidad" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 mb-6">
              <span className="w-3 h-3 rounded-full bg-[var(--color-gold)]"></span>
              <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wide">
                Compatible con tu dispositivo
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-4 leading-tight">
              {t("title")}
            </h2>

            {/* Description */}
            <p className="text-base text-[var(--color-ink)] leading-relaxed mb-8 max-w-md">
              {t("subtitle")}
            </p>

            {/* Search */}
            <div className="mb-8">
              <div className="relative mb-4">
                <MagnifyingGlass
                  size={20}
                  weight="bold"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-2)]"
                />
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)] transition-all"
                />
              </div>

              {/* Examples */}
              {!searchQuery && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-[var(--color-ink-2)] font-medium">Ejemplos:</span>
                  {["iPhone 15 Pro", "Galaxy S24", "Pixel 8", "Motorola Edge 50"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setSearchQuery(ex)}
                      className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-warm-white)] border border-[var(--color-border)] text-[var(--color-navy)] hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/5 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSearchQuery(model)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[var(--color-warm-white)] border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/5 transition-all flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-[var(--color-navy)]">{model}</span>
                      <Check size={16} weight="bold" className="text-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manufacturers Carousel */}
            <div>
              <p className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wide mb-4">
                Fabricantes compatibles
              </p>
              <div className="flex items-center gap-3">
                {/* Prev Button */}
                {hasPrev && (
                  <motion.button
                    onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[var(--color-border)] hover:border-[var(--color-gold)] flex items-center justify-center transition-colors"
                  >
                    <CaretLeft size={16} className="text-[var(--color-navy)]" weight="fill" />
                  </motion.button>
                )}

                {/* Carousel */}
                <div className="flex-1 flex gap-3">
                  {visibleMfgs.map((mfg) => (
                    <motion.button
                      key={mfg.id}
                      onClick={() => setSelectedMfg(mfg.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all text-center group ${
                        selectedMfg === mfg.id
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5 shadow-md"
                          : "border-[var(--color-border)] bg-white hover:border-[var(--color-gold)]/60"
                      }`}
                    >
                      <div className="text-3xl mb-2">{mfg.icon}</div>
                      <h4 className="text-xs font-bold text-[var(--color-navy)] mb-1 group-hover:text-[var(--color-gold)] transition-colors">
                        {mfg.name}
                      </h4>
                      <p className="text-[10px] text-[var(--color-ink-2)]">{mfg.minModel}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Next Button */}
                {hasNext && (
                  <motion.button
                    onClick={() => setCarouselIndex((i) => i + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[var(--color-border)] hover:border-[var(--color-gold)] flex items-center justify-center transition-colors"
                  >
                    <CaretRight size={16} className="text-[var(--color-navy)]" weight="fill" />
                  </motion.button>
                )}
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: Math.ceil(MANUFACTURERS.length / 3) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i * 3)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === Math.floor(carouselIndex / 3)
                        ? "bg-[var(--color-gold)] w-6"
                        : "bg-[var(--color-border)] hover:bg-[var(--color-ink-2)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
              className="mt-12 p-6 rounded-2xl border-2 border-[var(--color-border)] bg-gradient-to-br from-emerald-50 to-transparent"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check size={20} weight="bold" className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-navy)] mb-1">
                    Compatible con más de 1.200 dispositivos
                  </h3>
                  <p className="text-xs text-[var(--color-ink-2)]">
                    Actualizamos constantemente nuestra base de datos.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
              className="mt-8"
            >
              <a
                href="/es/help/faq"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-gold)] hover:bg-amber-600 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Comprobar compatibilidad completa →
              </a>
              <p className="text-xs text-[var(--color-ink-2)] mt-3">
                🔒 100% seguro. Sin compromiso.
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT: Visual - Premium Image Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            className="hidden lg:flex items-center justify-center h-full min-h-[600px]"
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
