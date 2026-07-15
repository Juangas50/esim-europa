import JsonLd from "./JsonLd";
import { PLANS } from "@/lib/plans";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://esimruta34.com";

interface Props {
  locale: "es" | "pt";
}

const PRODUCT_NAMES: Record<"es" | "pt", Record<string, string>> = {
  es: {
    "espana-prepago-10": "eSIM España Prepago 10 GB",
    "europa-prepago-20": "eSIM Europa Prepago 20 GB",
    "europa-dataonly-20": "eSIM Europa DataOnly 20 GB",
  },
  pt: {
    "espana-prepago-10": "eSIM Espanha Pré-pago 10 GB",
    "europa-prepago-20": "eSIM Europa Pré-pago 20 GB",
    "europa-dataonly-20": "eSIM Europa DataOnly 20 GB",
  },
};

const ZONE_LABELS: Record<"es" | "pt", Record<string, string>> = {
  es: { espana: "España", europa: "Europa (30+ países)" },
  pt: { espana: "Espanha", europa: "Europa (30+ países)" },
};

export default function HomeSchemaOrg({ locale }: Props) {
  const url = `${base}/${locale}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RUTA34 Telecom",
    url: base,
    logo: `${base}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: "soporte@esimruta34.com",
      contactType: "customer support",
      availableLanguage: ["Spanish", "Portuguese"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RUTA34 Telecom",
    url: base,
    inLanguage: locale === "es" ? "es-AR" : "pt-BR",
    description:
      locale === "es"
        ? "eSIM instantánea para viajeros latinoamericanos que van a Europa."
        : "eSIM instantâneo para viajantes latino-americanos que vão à Europa.",
  };

  const products = PLANS.map((plan) => {
    const zone = ZONE_LABELS[locale][plan.zone] ?? plan.zone;
    const description =
      locale === "es"
        ? `eSIM con ${plan.data_gb} GB para ${zone}. Válida por ${plan.duration_days} días desde la activación.`
        : `eSIM com ${plan.data_gb} GB para ${zone}. Válida por ${plan.duration_days} dias desde a ativação.`;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT_NAMES[locale][plan.id] ?? plan.name,
      description,
      brand: { "@type": "Brand", name: "RUTA34 Telecom" },
      category: "eSIM",
      offers: {
        "@type": "Offer",
        price: plan.price_usd.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${url}/compra?plan=${plan.id}`,
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        )
          .toISOString()
          .split("T")[0],
        seller: { "@type": "Organization", name: "RUTA34 Telecom" },
      },
    };
  });

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      {products.map((product, i) => (
        <JsonLd key={i} data={product} />
      ))}
    </>
  );
}
