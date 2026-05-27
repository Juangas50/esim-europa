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

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://esimruta34.com";

// ── Per-locale copy ──────────────────────────────────────────────────────────
const META = {
  es: {
    title: "RUTA34 Telecom — eSIM para Europa | Conectate al instante",
    description:
      "eSIM instantánea para argentinos, uruguayos, chilenos y brasileños que viajan a Europa. Activá en minutos, olvidate del roaming. 20 GB desde USD 39.90.",
    keywords:
      "eSIM Europa Argentina, chip virtual Europa viaje, internet Europa sin roaming, eSIM viaje Europa, esim españa latinoamerica, esim argentina europa",
    ogTitle: "RUTA34 Telecom — Llegás a Europa y ya estás conectado",
    ogDescription:
      "eSIM instantánea para viajeros latinoamericanos. Activá en minutos y navegá en 30+ países europeos.",
    ogLocale: "es_AR",
    altLocale: "pt_BR",
  },
  pt: {
    title: "RUTA34 Telecom — eSIM para Europa | Conecte-se ao instante",
    description:
      "eSIM instantâneo para argentinos, uruguaios, chilenos e brasileiros que viajam à Europa. Ative em minutos, esqueça o roaming. 20 GB a partir de USD 39,90.",
    keywords:
      "eSIM Europa Brasil, chip virtual Europa viagem, internet Europa sem roaming, eSIM viagem Europa, esim espanha america latina, esim brasil europa",
    ogTitle: "RUTA34 Telecom — Chega na Europa e já está conectado",
    ogDescription:
      "eSIM instantâneo para viajantes latino-americanos. Ative em minutos e navegue em 30+ países europeus.",
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

  return (
    <>
      <HomeSchemaOrg locale={locale as "es" | "pt"} />
      <Navbar />
      <main>
        <Hero />
        <Plans />
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
