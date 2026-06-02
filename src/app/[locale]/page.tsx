import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Plans from "@/components/landing/Plans";
import Testimonials from "@/components/landing/Testimonials";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Compatibility from "@/components/landing/Compatibility";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import HomeSchemaOrg from "@/components/seo/HomeSchemaOrg";
import { getPlans } from "@/lib/plans-server";

// Siempre usar el dominio real en producción — ignorar si apunta a vercel.app
const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

// ── Per-locale copy ──────────────────────────────────────────────────────────
const META = {
  es: {
    title: "Chip para Europa sin roaming | eSIM prepago para Argentinos y Latinoamericanos — RUTA34",
    description:
      "Chip digital para viajar a Europa. eSIM prepago para argentinos, chilenos, uruguayos y brasileños. Instalás con QR, llegás conectado desde el primer minuto. Desde US$19.90.",
    keywords:
      "chip para españa, chip prepago europa, chip digital europa, esim europa argentina, chip para viajar a europa, esim sin roaming, chip internet europa, esim chile europa, esim uruguay europa, chip para argentina españa, plan prepago europa latinoamerica, chip virtual europa, internet europa sin contrato",
    ogTitle: "El chip digital para viajar a Europa — RUTA34 Telecom",
    ogDescription:
      "Chip de datos para argentinos, chilenos y uruguayos que viajan a Europa. eSIM prepago: instalás con QR y llegás conectado. Desde US$19.90.",
    ogLocale: "es_AR",
    altLocale: "pt_BR",
  },
  pt: {
    title: "Chip para Europa sem roaming | eSIM pré-pago para Brasileiros e Latino-americanos — RUTA34",
    description:
      "Chip digital para viajar à Europa. eSIM pré-pago para brasileiros e latino-americanos. Instale com QR, chegue conectado desde o primeiro minuto. A partir de US$19,90.",
    keywords:
      "chip para europa brasil, chip digital europa, esim europa brasil, chip prepago europa, internet europa sem roaming, esim brasil europa, chip viagem europa, esim sem contrato europa, chip virtual europa, internet europa latinoamerica",
    ogTitle: "O chip digital para viajar à Europa — RUTA34 Telecom",
    ogDescription:
      "Chip de dados para brasileiros e latino-americanos que viajam à Europa. eSIM pré-pago: instale com QR e chegue conectado. A partir de US$19,90.",
    ogLocale: "pt_BR",
    altLocale: "es_AR",
  },
} as const;

// ── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = META[locale as "es" | "pt"] ?? META.es;
  const url = `${base}/${locale}`;

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${base}/es`,
        pt: `${base}/pt`,
      },
    },
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      type: "website",
      url,
      locale: m.ogLocale,
      alternateLocale: m.altLocale,
      siteName: "RUTA34 Telecom",
      // og:image is provided by /[locale]/opengraph-image.tsx (file-based wins)
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.ogDescription,
      // twitter:image is inferred from opengraph-image.tsx
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const plans = await getPlans({ webOnly: true });
  const minPrice = plans.length > 0
    ? Math.min(...plans.map((p) => p.price_usd))
    : undefined;

  return (
    <>
      <HomeSchemaOrg locale={locale as "es" | "pt"} />
      <Navbar />
      <main>
        <Hero minPrice={minPrice} />
        <Plans plans={plans} />
        <Testimonials />
        <Benefits />
        <HowItWorks />
        <Compatibility />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
