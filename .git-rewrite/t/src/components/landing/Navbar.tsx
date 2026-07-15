"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Cierra el menú al cambiar de ruta
  useEffect(() => setOpen(false), [pathname]);

  const navLinks = [
    { label: t("howItWorks"), href: "#como-funciona" },
    { label: t("plans"), href: "#planes" },
    { label: t("faq"), href: "#faq" },
  ];

  const otherLocale = locale === "es" ? "pt" : "es";
  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  return (
    <>
      {/* Floating navbar */}
      <nav className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className={cn(
            "flex items-center gap-6 px-4 py-2.5 rounded-full transition-all duration-300",
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14)] border border-black/[0.06]"
              : "bg-white/85 backdrop-blur-sm border border-black/[0.05]"
          )}
        >
          {/* Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E60000]">
              <span className="text-white text-[11px] font-black tracking-tight leading-none">34</span>
            </div>
            <span className="font-bold text-[#111111] text-sm tracking-tight">
              RUTA34
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#555555] hover:text-[#111111] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Lang switcher */}
            <button
              onClick={switchLocale}
              className="text-xs font-semibold text-[#555555] hover:text-[#111111] uppercase tracking-wide px-2 py-1 rounded-full hover:bg-black/5 transition-all duration-150"
            >
              {otherLocale === "pt" ? "PT" : "ES"}
            </button>

            {/* CTA */}
            <a
              href="#planes"
              className="flex items-center gap-2 bg-[#E60000] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#CC0000] active:scale-[0.97] transition-all"
              style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
            >
              {t("buyNow")}
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1 text-[#111111] ml-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: EASE_OUT }}
                >
                  <X size={20} weight="bold" />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: EASE_OUT }}
                >
                  <List size={20} weight="bold" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/97 backdrop-blur-xl flex flex-col items-center justify-center gap-8 px-6"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.06 * (i + 1),
                  duration: 0.4,
                  ease: EASE_OUT,
                }}
                className="text-3xl font-bold text-[#111111] tracking-tight"
              >
                {link.label}
              </motion.a>
            ))}

            <motion.a
              href="#planes"
              onClick={() => setOpen(false)}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: EASE_OUT }}
              className="bg-[#E60000] text-white text-xl font-bold px-10 py-4 rounded-full mt-4"
            >
              {t("buyNow")}
            </motion.a>

            <motion.button
              onClick={switchLocale}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-semibold text-[#999] uppercase tracking-wider mt-2"
            >
              Cambiar a {otherLocale === "pt" ? "Português" : "Español"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
