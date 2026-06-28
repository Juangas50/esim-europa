"use client";

import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1B2F4E] text-white py-16 px-4">
      <div className="max-w-[1200px] mx-auto">

        {/* Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#C9973A] flex items-center justify-center">
                <span className="text-white text-xs font-black">34</span>
              </div>
              <span className="font-bold text-white text-base tracking-tight">RUTA34 Telecom</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
              {t("tagline")}
            </p>

            {/* WhatsApp */}
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-[#6EC1E4] hover:text-white transition-colors"
            >
              {t("support")} →
            </a>
          </div>

          {/* Links empresa */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
              {t("company")}
            </p>
            <ul className="space-y-2.5">
              {[
                { key: "howItWorks", href: "#como-funciona" },
                { key: "plans", href: "#planes" },
                { key: "compatibility", href: "#compatibilidad" },
                { key: "faq", href: "#faq" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {t(`links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links legales */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
              {t("legal")}
            </p>
            <ul className="space-y-2.5">
              {[
                { key: "terms", href: `/${locale}/terminos` },
                { key: "privacy", href: `/${locale}/privacidad` },
                { key: "cookies", href: `/${locale}/cookies` },
              ].map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {t(`links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {year} RUTA34 Telecom. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
          </div>
        </div>

      </div>
    </footer>
  );
}
