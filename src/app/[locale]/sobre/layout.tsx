import type { Metadata } from "next";

const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isES = locale === "es";
  const url = `${base}/${locale}/sobre`;

  return {
    title: isES
      ? "Sobre RUTA34 — Conectividad para viajeros de LATAM"
      : "Sobre RUTA34 — Conectividade para viajantes da LATAM",
    description: isES
      ? "Conocé la historia, misión y valores de RUTA34. Conectamos viajeros de Latinoamérica con Europa sin complicaciones."
      : "Conheça a história, missão e valores de RUTA34. Conectamos viajantes da América Latina com a Europa sem complicações.",
    keywords: isES
      ? "sobre RUTA34, empresa eSIM, conectividad viajeros, misión valores"
      : "sobre RUTA34, empresa eSIM, conectividade viajantes, missão valores",
    alternates: {
      canonical: url,
      languages: {
        es: `${base}/es/sobre`,
        pt: `${base}/pt/sobre`,
        "x-default": `${base}/es/sobre`,
      },
    },
    openGraph: {
      title: isES ? "Sobre RUTA34" : "Sobre RUTA34",
      description: isES
        ? "Descubre la historia y misión de RUTA34"
        : "Descubra a história e missão de RUTA34",
      url: url,
      type: "website",
      locale: isES ? "es_AR" : "pt_BR",
    },
  };
}

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
