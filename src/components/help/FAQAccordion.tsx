"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <button
            onClick={() =>
              setOpenId(openId === item.id ? null : item.id)
            }
            className="w-full text-left p-6 bg-white border border-[#E9E2D8] rounded-3xl hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-[var(--color-navy)] flex-1">
                {item.question}
              </h3>
              <motion.div
                animate={{
                  rotate: openId === item.id ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 mt-1"
              >
                <CaretDown
                  size={20}
                  weight="bold"
                  className="text-[var(--color-gold)]"
                />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {openId === item.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-6 py-4 text-[var(--color-ink-2)] leading-relaxed border-x border-b border-[#E9E2D8]">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
