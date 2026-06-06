import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GTMNoScript } from "@/components/analytics/GTM";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RUTA34 Telecom — eSIM para Europa",
  description:
    "Llegás a Europa y ya estás conectado. eSIM instantánea para argentinos, uruguayos, chilenos y brasileños que viajan a Europa.",
  author: "RUTA34 Telecom",
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
    <html lang="es" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        {/* GTM noscript — debe ir inmediatamente después de <body> */}
        <GTMNoScript />

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
