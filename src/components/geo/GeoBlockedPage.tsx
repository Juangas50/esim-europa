"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GeoCheckResult {
  country: string;
  blocked: boolean;
  message: string;
}

export default function GeoBlockedPage() {
  const [geoData, setGeoData] = useState<GeoCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkGeo() {
      try {
        const res = await fetch("/api/geo-check");
        const data = await res.json();
        setGeoData(data);
      } catch (error) {
        console.error("Geo check failed:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    checkGeo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-gold)]/20 border-t-[var(--color-gold)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-ink-2)]">Verificando ubicación...</p>
        </div>
      </div>
    );
  }

  if (!geoData?.blocked) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)] px-4"
    >
      <div className="max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-3xl font-black text-[var(--color-navy)] mb-3">
            Servicio no disponible
          </h1>
          <p className="text-[var(--color-ink-2)] mb-6">
            Lo sentimos, no podemos procesar compras desde tu ubicación ({geoData.country}) en este momento.
          </p>

          <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-[var(--color-ink)]">
              Si crees que esto es un error o necesitas ayuda, contacta con nuestro equipo de soporte.
            </p>
          </div>

          <a
            href="mailto:support@ruta34.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white rounded-xl font-semibold hover:bg-[var(--color-navy)]/90 transition-colors"
          >
            Contactar soporte
          </a>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <a
              href="/"
              className="text-sm text-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors"
            >
              ← Volver al inicio
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
