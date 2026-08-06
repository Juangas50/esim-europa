"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, WarningCircle, ArrowRight } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";

interface ActivationConfirmationModalProps {
  isOpen: boolean;
  activationDate: string;
  recommendedType: "now" | "schedule";
  chosenType: "now" | "schedule";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActivationConfirmationModal({
  isOpen,
  activationDate,
  recommendedType,
  chosenType,
  onConfirm,
  onCancel,
}: ActivationConfirmationModalProps) {
  const formatDateDisplay = (date: string): string => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" });
  };

  const getMessage = () => {
    if (chosenType === "now" && recommendedType === "schedule") {
      return `Elegiste activación inmediata, pero tu viaje es después. Tu plan empezará hoy y terminará antes de que lo necesites. ¿Seguro?`;
    }
    if (chosenType === "schedule" && recommendedType === "now") {
      return `Quedan menos de 5 días para tu viaje. Programar la activación para ${formatDateDisplay(activationDate)} es riesgoso. ¿Seguro?`;
    }
    return "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
                  <WarningCircle size={20} weight="fill" className="text-[#dc2626]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-navy)]">¿Estás seguro?</h3>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-[var(--color-ink-2)] hover:text-[var(--color-navy)] transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Message */}
            <p className="text-sm text-[var(--color-ink)] mb-6 leading-relaxed">
              {getMessage()}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-warm-white)] transition-colors"
              >
                Cambiar
              </button>
              <Button
                onClick={onConfirm}
                variant="primary"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size={16} weight="bold" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
