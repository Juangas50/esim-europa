"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import DeviceCompatibilityFinder from "@/components/landing/DeviceCompatibilityFinder";

interface DeviceCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeviceCompatibilityModal({ isOpen, onClose }: DeviceCompatibilityModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[var(--color-navy)]">
                    ¿Tu teléfono es compatible?
                  </h2>
                  <p className="text-xs text-[var(--color-ink-2)] mt-1">
                    Busca tu modelo y comprueba en segundos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-warm-white)] hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
                >
                  <X size={20} weight="bold" className="text-[var(--color-navy)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <DeviceCompatibilityFinder />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
