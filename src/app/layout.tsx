import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { GTMNoScript } from "@/components/analytics/GTM";
import { MetaPixelNoScript } from "@/components/analytics/MetaPixel";
import MaintenanceBanner from "@/components/landing/MaintenanceBanner";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RUTA34 Telecom — eSIM para Europa",
  description:
    "Llegás a Europa y ya estás conectado. eSIM instantánea para argentinos, uruguayos, chilenos y brasileños que viajan a Europa.",
  authors: [{ name: "RUTA34 Telecom" }],
  creator: "RUTA34 Telecom",
  keywords: "eSIM Europa, chip digital, internet sin roaming, eSIM Argentina, eSIM Brasil",
  openGraph: {
    title: "RUTA34 Telecom — eSIM para Europa",
    description: "Activá tu eSIM en minutos y olvidate del roaming.",
    siteName: "RUTA34 Telecom",
    locale: "es_AR",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="es" es el fallback para rutas sin locale (admin, login).
    // Para rutas /es/ y /pt/, el lang se actualiza dinámicamente via JavaScript
    // en el navegador basado en el pathname. Las señales de contenido + hreflang
    // en el sitemap refuerzan la información de idioma para Google.
    <html lang="es" suppressHydrationWarning className={`${dmSerif.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full">
        {/* Maintenance mode banner */}
        <MaintenanceBanner />

        {/* GTM noscript — debe ir inmediatamente después de <body> */}
        <GTMNoScript />

        {/* Meta Pixel noscript — debe ir inmediatamente después de <body> */}
        <MetaPixelNoScript />

        {/* Script para actualizar dynamically lang attribute basado en locale */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const pathname = window.location.pathname;
                const localeMatch = pathname.match(/^\\/(es|pt)(?:\\/|$)/);
                if (localeMatch) {
                  const locale = localeMatch[1];
                  const langMap = { es: 'es-AR', pt: 'pt-BR' };
                  document.documentElement.lang = langMap[locale] || locale;
                }
              })();
            `,
          }}
        />

        {children}
      </body>
    </html>
  );
}
