"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumTooltipProps {
  title: string;
  content: React.ReactNode;
  footer?: string;
  cta?: {
    label: string;
    href: string;
  };
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function PremiumTooltip({
  title,
  content,
  footer,
  cta,
  icon = "ⓘ",
  children,
}: PremiumTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-sm font-bold text-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors cursor-help"
        aria-label="More information"
        aria-expanded={isOpen}
        type="button"
      >
        {icon}
      </button>

      {/* Tooltip - Opens upward */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-50 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[340px] md:w-[380px] p-6 rounded-[20px] bg-[var(--color-warm-white)] border border-[var(--color-border)] shadow-lg mb-2"
            style={{
              boxShadow: "0 8px 24px rgba(27, 47, 78, 0.08)",
              bottom: "100%",
            }}
          >
            {/* Title */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-[var(--color-navy)]">
                {title}
              </h3>
            </div>

            {/* Content */}
            <div className="mb-4 space-y-3">
              {typeof content === "string" ? (
                <p className="text-xs text-[var(--color-ink)] leading-relaxed">
                  {content}
                </p>
              ) : (
                content
              )}
            </div>

            {/* Footer */}
            {footer && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--color-warm-white)]/50 border border-[var(--color-border)]/50">
                <p className="text-xs text-[var(--color-ink-2)]">{footer}</p>
              </div>
            )}

            {/* CTA */}
            {cta && (
              <a
                href={cta.href}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors group"
              >
                {cta.label}
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
