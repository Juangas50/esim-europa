"use client";

import { useLocale } from "next-intl";
import { ArrowLeft } from "@phosphor-icons/react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const COPY = {
  es: {
    back: "Volver al inicio",
    lastUpdated: "Última actualización:",
    rights: "Todos los derechos reservados.",
    terms: "Términos",
    privacy: "Privacidad",
    cookies: "Cookies",
  },
  pt: {
    back: "Voltar ao início",
    lastUpdated: "Última atualização:",
    rights: "Todos os direitos reservados.",
    terms: "Termos",
    privacy: "Privacidade",
    cookies: "Cookies",
  },
} as const;

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  const locale = useLocale() as "es" | "pt";
  const c = COPY[locale] ?? COPY.es;

  return (
    <div className="min-h-[100dvh] bg-[#F8F8F8]">
      {/* Mini navbar */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 py-3">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <a href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E60000] flex items-center justify-center">
              <span className="text-white text-[11px] font-black">34</span>
            </div>
            <span className="font-bold text-[#111111] text-sm tracking-tight">RUTA34</span>
          </a>
          <a
            href={`/${locale}`}
            className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            {c.back}
          </a>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-[#999]">
            {c.lastUpdated} {lastUpdated}
          </p>
        </div>

        <div className="prose-legal">{children}</div>
      </div>

      {/* Footer minimal */}
      <footer className="border-t border-black/[0.06] py-6 px-4 mt-12">
        <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#999]">
          <span>© {new Date().getFullYear()} RUTA34 Telecom. {c.rights}</span>
          <div className="flex gap-4">
            <a href={`/${locale}/terminos`} className="hover:text-[#111] transition-colors">
              {c.terms}
            </a>
            <a href={`/${locale}/privacidad`} className="hover:text-[#111] transition-colors">
              {c.privacy}
            </a>
            <a href={`/${locale}/cookies`} className="hover:text-[#111] transition-colors">
              {c.cookies}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
