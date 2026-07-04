"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { MagnifyingGlass, Check, WarningCircle } from "@phosphor-icons/react";
import devices from "@/data/esim-devices.json";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function DeviceCompatibilityFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Búsqueda con autocompletado
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: { manufacturer: string; model: string; icon: string }[] = [];

    devices.manufacturers.forEach((mfg) => {
      const mfgLower = mfg.name.toLowerCase();

      mfg.models.forEach((model) => {
        const modelLower = model.toLowerCase();

        // Búsqueda: por modelo, por fabricante, o por palabra clave
        const matchesModel = modelLower.startsWith(query) || modelLower.includes(query);
        const matchesMfg = mfgLower.startsWith(query);

        if (matchesModel || matchesMfg) {
          results.push({
            manufacturer: mfg.name,
            model,
            icon: mfg.icon,
          });
        }
      });
    });

    // Ordenar: coincidencias exactas primero
    return results.sort((a, b) => {
      const aExact = a.model.toLowerCase() === query;
      const bExact = b.model.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.model.localeCompare(b.model);
    }).slice(0, 8);
  }, [searchQuery]);

  // Verificar si el dispositivo está en la lista
  const isCompatible = useMemo(() => {
    if (!selectedDevice) return null;

    for (const mfg of devices.manufacturers) {
      if (mfg.models.includes(selectedDevice)) {
        return { compatible: true, manufacturer: mfg.name };
      }
    }
    return { compatible: false };
  }, [selectedDevice]);

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div className="relative w-full">
        <MagnifyingGlass
          size={20}
          weight="bold"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-2)] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar modelo… ej: iPhone 15 Pro, Galaxy S24, Pixel 9"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedDevice(null);
          }}
          className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 focus:border-[var(--color-gold)] transition-all"
        />

        {/* Resultados de búsqueda */}
        <AnimatePresence>
          {searchQuery && searchResults.length > 0 && !selectedDevice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[var(--color-border)] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
            >
              {searchResults.map((result, idx) => (
                <motion.button
                  key={`${result.manufacturer}-${result.model}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedDevice(result.model)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-warm-white)] border-b border-[var(--color-border)] last:border-b-0 transition-colors group"
                >
                  <p className="text-sm font-medium text-[var(--color-navy)] group-hover:text-[var(--color-gold)]">
                    {result.model}
                  </p>
                  <p className="text-xs text-[var(--color-ink-2)]">{result.manufacturer}</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sin resultados */}
        {searchQuery && searchResults.length === 0 && !selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-3 text-center text-xs text-[var(--color-ink-2)]"
          >
            No encontramos ese modelo. Intenta con otro.
          </motion.div>
        )}
      </div>

      {/* Tarjeta de resultado */}
      <AnimatePresence>
        {selectedDevice && isCompatible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-2xl border-2 ${
              isCompatible.compatible
                ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-transparent"
                : "border-amber-300 bg-gradient-to-br from-amber-50 to-transparent"
            }`}
          >
            {isCompatible.compatible ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check size={24} weight="bold" className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-[var(--color-navy)] mb-1">
                    ✅ Compatible con RUTA34
                  </h3>
                  <p className="text-base font-semibold text-[var(--color-navy)] mb-3">
                    {selectedDevice}
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--color-ink)] mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Compatible con eSIM
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Compatible con doble SIM
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Activación mediante código QR
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Funciona con RUTA34
                    </li>
                  </ul>
                  <button
                    onClick={() => window.location.href = "/es/compra"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-gold)] hover:bg-amber-600 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95"
                  >
                    Comprar eSIM →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <WarningCircle size={24} weight="bold" className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-[var(--color-navy)] mb-1">
                    ⚠️ Compatibilidad no garantizada
                  </h3>
                  <p className="text-base font-semibold text-[var(--color-navy)] mb-3">
                    {selectedDevice}
                  </p>
                  <p className="text-sm text-[var(--color-ink)] mb-4">
                    Este modelo puede no ser compatible con eSIM. Te recomendamos verificar la versión exacta del dispositivo o contactar con nuestro equipo.
                  </p>
                  <button
                    onClick={() => window.location.href = "https://wa.me/34600000000"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-navy)] hover:bg-[var(--color-navy)]/80 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95"
                  >
                    Consultar por WhatsApp →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón para limpiar */}
      {selectedDevice && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setSelectedDevice(null);
            setSearchQuery("");
          }}
          className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-gold)] transition-colors"
        >
          ← Buscar otro modelo
        </motion.button>
      )}

      {/* Info de verificación - siempre visible debajo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="p-4 rounded-xl bg-[var(--color-warm-white)] border border-[var(--color-border)]"
      >
        <p className="text-xs text-[var(--color-ink-2)] font-medium mb-2">
          💡 <span className="font-bold">Método de verificación:</span>
        </p>
        <p className="text-xs text-[var(--color-ink)]">
          Marca <span className="font-mono font-bold">*#06#</span> en tu móvil. Si aparece el código <span className="font-bold">EID</span> (Embedded Identity Document), es compatible con eSIM.
        </p>
      </motion.div>
    </div>
  );
}
