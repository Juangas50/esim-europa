"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const FAQ_KEYS = [
  "chip_vs_esim", "what", "compatible", "whatsapp", "qr_receive", "when_starts",
  "number", "when", "costs", "diff", "no_email", "not_working", "needs",
] as const;

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE_OUT }}
      className="group rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-md transition-shadow duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-[var(--color-navy)] text-base leading-snug group-hover:text-[var(--color-gold)] transition-colors duration-200">
          {question}
        </span>
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 ${
            isOpen
              ? "bg-[var(--color-gold)] text-[var(--color-navy)]"
              : "border-2 border-[var(--color-border)] text-[var(--color-ink-2)]"
          }`}
        >
          {isOpen ? <Minus size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
        </div>
      </button>

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
            <div className="px-6 pb-6 border-t border-[var(--color-border)]">
              <p className="text-[var(--color-ink)] leading-relaxed max-w-[640px] whitespace-pre-line">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const KEY_INDEX: Record<string, number> = Object.fromEntries(
  FAQ_KEYS.map((k, i) => [k, i])
);

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#faq-")) return;
    const key = hash.replace("#faq-", "");
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
    <section id="faq" className="py-24 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-6 leading-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--color-ink-2)] max-w-2xl">
            ¿Otra duda?{" "}
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-gold)] font-semibold hover:text-[var(--color-gold)] transition-colors"
            >
              Escribinos por WhatsApp →
            </a>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQ_KEYS.map((key, i) => (
            <div key={key} id={`faq-${key}`}>
              <FAQItem
                question={t(`items.${key}.q`)}
                answer={t(`items.${key}.a`)}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
                index={i}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
