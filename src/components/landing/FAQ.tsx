"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const FAQ_KEYS = ["what", "compatible", "number", "when", "costs", "diff"] as const;

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#111111]/8">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#111111] text-base leading-snug pr-2 group-hover:text-[#E60000] transition-colors duration-200">
          {question}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 border transition-colors duration-200 ${
            isOpen
              ? "bg-[#E60000] border-[#E60000] text-white"
              : "border-[#111111]/15 text-[#555]"
          }`}
        >
          {isOpen ? <Minus size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
        </div>
      </button>

      {/* AnimatePresence para transición suave — Emil Kowalski */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#555555] leading-relaxed max-w-[640px]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// índice de cada key en FAQ_KEYS
const KEY_INDEX: Record<string, number> = Object.fromEntries(
  FAQ_KEYS.map((k, i) => [k, i])
);

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Auto-abrir ítem cuando se navega directo por hash (ej: #faq-compatible)
  useEffect(() => {
    const hash = window.location.hash; // e.g. "#faq-compatible"
    if (!hash.startsWith("#faq-")) return;
    const key = hash.replace("#faq-", ""); // e.g. "compatible"
    const idx = KEY_INDEX[key];
    if (idx != null) {
      setOpenIndex(idx);
      setTimeout(() => {
        document.getElementById(`faq-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, []);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left — título (sticky en desktop) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="lg:sticky lg:top-32"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-4">
                {t("title")}
              </h2>
              <p className="text-[#555555]">
                ¿Otra duda?{" "}
                <a
                  href="https://wa.me/34600000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E60000] font-semibold hover:underline"
                >
                  Escribinos por WhatsApp
                </a>
              </p>
            </motion.div>
          </div>

          {/* Right — accordion */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="lg:col-span-8"
          >
            <div className="border-t border-[#111111]/8">
              {FAQ_KEYS.map((key, i) => (
                <div key={key} id={`faq-${key}`}>
                  <FAQItem
                    question={t(`items.${key}.q`)}
                    answer={t(`items.${key}.a`)}
                    isOpen={openIndex === i}
                    onToggle={() => toggle(i)}
                  />
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
