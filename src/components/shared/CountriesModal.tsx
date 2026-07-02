"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

const COUNTRIES_LIST = [
  "España", "Francia", "Italia", "Alemania", "Portugal",
  "Austria", "Bélgica", "Bulgaria", "Croacia", "Chipre",
  "Rep. Checa", "Dinamarca", "Eslovaquia", "Eslovenia", "Estonia",
  "Finlandia", "Grecia", "Hungría", "Irlanda", "Letonia",
  "Lituania", "Luxemburgo", "Malta", "Holanda", "Polonia",
  "Rumania", "Suecia", "Reino Unido", "Islandia", "Liechtenstein",
  "Noruega", "Suiza", "Turquía", "Kosovo", "Vaticano",
  "Mónaco", "Ucrania", "Moldavia", "Estados Unidos",
];

interface CountriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CountriesModal({ isOpen, onClose }: CountriesModalProps) {
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
            transition={{ duration: 0.2 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,0.3)] z-50 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-black/[0.06] px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#1B2F4E]">
                Cobertura en {COUNTRIES_LIST.length}+ países
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} weight="bold" className="text-[#555]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {COUNTRIES_LIST.map((country) => (
                  <div
                    key={country}
                    className="px-4 py-3 bg-[#F5F5F5] rounded-lg border border-black/[0.06] text-sm font-medium text-[#1B2F4E] text-center hover:bg-[#C9973A]/5 hover:border-[#C9973A]/20 transition-colors"
                  >
                    {country}
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <p className="text-sm text-[#555] text-center">
                  Si tu país no está en la lista, selecciona &quot;Otro&quot; en el formulario de compra.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
