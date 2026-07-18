"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";

const CONSENT_KEY = "ruta34_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 año en segundos

function readConsentCookie(): ConsentValue {
  if (typeof document === "undefined") return null;
  // 1. Cookie (fuente de verdad actual)
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_KEY}=([^;]*)`));
  if (match?.[1]) return match[1] as ConsentValue;
  // 2. Migración silenciosa desde localStorage para usuarios existentes
  const legacy = localStorage.getItem(CONSENT_KEY) as ConsentValue;
  if (legacy) {
    writeConsentCookie(legacy);
    localStorage.removeItem(CONSENT_KEY);
    return legacy;
  }
  return null;
}

function writeConsentCookie(value: "accepted" | "rejected") {
  // Secure solo si estamos en HTTPS — en HTTP (localhost) el navegador
  // rechaza en silencio cualquier cookie con Secure, rompería el banner en dev.
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_KEY}=${value}; max-age=${CONSENT_MAX_AGE}; path=/; SameSite=Lax${secure}`;
}
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type ConsentValue = "accepted" | "rejected" | null;

// Textos inline — no necesitan i18n completo para el banner
const COPY = {
  es: {
    text: "Usamos cookies propias y analíticas para mejorar tu experiencia. Podés aceptarlas o rechazar las opcionales.",
    accept: "Aceptar todas",
    reject: "Solo necesarias",
    more: "Más información",
  },
  pt: {
    text: "Usamos cookies próprios e analíticos para melhorar sua experiência. Você pode aceitá-los ou rejeitar os opcionais.",
    accept: "Aceitar todas",
    reject: "Só necessários",
    more: "Mais informações",
  },
} as const;

export default function CookieBanner() {
  const locale = useLocale() as "es" | "pt";
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [mounted, setMounted] = useState(false);

  // Leer preferencia guardada — cookie real (persistente, LGPD-compatible)
  useEffect(() => {
    setMounted(true);
    const saved = readConsentCookie();
    if (saved) setConsent(saved);
  }, []);

  const handleConsent = (value: "accepted" | "rejected") => {
    writeConsentCookie(value);
    setConsent(value);

    // Activar/desactivar Google Analytics según elección
    if (typeof window !== "undefined") {
      if (value === "accepted") {
        // GA se activa — aquí iría el script de GA si lo añadís
        window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
      }
    }
  };

  const copy = COPY[locale] ?? COPY.es;
  const show = mounted && consent === null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Preferencias de cookies"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-[560px] mx-auto"
        >
          {/* Double-bezel card — soft-skill */}
          <div className="rounded-[1.5rem] p-1.5 bg-white/60 border border-white/70 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]">
            <div className="rounded-[1.2rem] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <div className="flex items-start gap-3 mb-4">
                {/* Logo mini */}
                <div className="w-8 h-8 rounded-lg bg-[#C9973A] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[11px] font-black">34</span>
                </div>
                <p className="text-sm text-[#444] leading-relaxed">
                  {copy.text}{" "}
                  <a
                    href={`/${locale}/cookies`}
                    className="text-[#C9973A] font-semibold hover:underline"
                  >
                    {copy.more}
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleConsent("accepted")}
                  className="flex-1 py-2.5 px-5 rounded-xl bg-[#C9973A] text-white text-sm font-bold hover:bg-[#E8C56A] active:scale-[0.97] transition-all"
                  style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
                >
                  {copy.accept}
                </button>
                <button
                  onClick={() => handleConsent("rejected")}
                  className="flex-1 py-2.5 px-5 rounded-xl border border-[#1B2F4E]/12 text-[#555] text-sm font-semibold hover:bg-[#1B2F4E]/5 active:scale-[0.97] transition-all"
                  style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
                >
                  {copy.reject}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
