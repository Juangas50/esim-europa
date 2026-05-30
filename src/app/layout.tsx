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
  openGraph: {
    title: "RUTA34 Telecom — eSIM para Europa",
    description: "Activá tu eSIM en minutos y olvidate del roaming.",
    siteName: "RUTA34 Telecom",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="es" es el fallback para rutas sin locale (admin, login).
    // Las rutas /es/ y /pt/ sobreescriben el lang vía hreflang en el sitemap
    // y las señales de contenido. Refactor completo requiere mover <html> a [locale]/layout.tsx.
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        {/* GTM noscript — debe ir inmediatamente después de <body> */}
        <GTMNoScript />
        {children}
      </body>
    </html>
  );
}
