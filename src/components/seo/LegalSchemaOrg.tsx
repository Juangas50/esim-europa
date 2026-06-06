import JsonLd from "./JsonLd";

const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

interface Props {
  locale: "es" | "pt";
  page: "terminos" | "privacidad";
  lastUpdated: string;
}

export default function LegalSchemaOrg({ locale, page, lastUpdated }: Props) {
  const url = `${base}/${locale}/${page}`;

  const titles = {
    es: {
      terminos: "Términos y condiciones — RUTA34 Telecom",
      privacidad: "Política de privacidad — RUTA34 Telecom",
    },
    pt: {
      terminos: "Termos e condições — RUTA34 Telecom",
      privacidad: "Política de privacidade — RUTA34 Telecom",
    },
  };

  const descriptions = {
    es: {
      terminos:
        "Lee los términos y condiciones de RUTA34 Telecom. Política de ventas, garantías y responsabilidades sobre eSIM para Europa.",
      privacidad:
        "Política de privacidad de RUTA34 Telecom. Cumple con RGPD. Conoce cómo procesamos tus datos personales.",
    },
    pt: {
      terminos:
        "Leia os termos e condições da RUTA34 Telecom. Política de vendas, garantias e responsabilidades sobre eSIM para Europa.",
      privacidad:
        "Política de privacidade da RUTA34 Telecom. Cumpre com LGPD e GDPR. Saiba como processamos seus dados pessoais.",
    },
  };

  // Article schema for legal documents
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titles[locale][page],
    description: descriptions[locale][page],
    author: {
      "@type": "Organization",
      name: "RUTA34 Telecom",
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/logo.png`,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "RUTA34 Telecom",
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/logo.png`,
      },
    },
    datePublished: "2026-05-24",
    dateModified: lastUpdated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: locale === "pt" ? "pt-BR" : "es-AR",
  };

  return <JsonLd data={article} />;
}
