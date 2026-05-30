import JsonLd from "./JsonLd";
import { PLANS } from "@/lib/plans";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://esimruta34.com";

interface Props {
  locale: "es" | "pt";
}

// ── FAQ bilingüe ──────────────────────────────────────────────────────────────

const FAQ_ES = [
  {
    q: "¿Qué es una eSIM?",
    a: "Una eSIM es una SIM virtual que se instala directamente en tu teléfono escaneando un código QR. No necesitás una tarjeta física. Funciona igual que una SIM tradicional pero se activa al instante desde tu celular.",
  },
  {
    q: "¿Cómo sé si mi celular es compatible con eSIM?",
    a: "Los iPhone XS / XR (2018) o más nuevos, Samsung Galaxy S20 o más nuevos y Google Pixel 4a o más nuevos son compatibles. También podés verificarlo en Ajustes → General → Información → eSIM.",
  },
  {
    q: "¿Puedo mantener mi número de teléfono latinoamericano?",
    a: "Sí. Tu número sigue funcionando en la SIM física de tu celular. La eSIM se usa solo para datos en Europa. Podés recibir llamadas y WhatsApp como siempre.",
  },
  {
    q: "¿Cuándo activo la eSIM de RUTA34?",
    a: "Recomendamos instalar el QR antes de salir de tu país (con WiFi) y activar la eSIM cuando aterrizás en Europa. Para el plan DataOnly tenés 60 días desde la compra para activarla.",
  },
  {
    q: "¿Hay costos adicionales o sorpresas en la factura?",
    a: "No. El precio que ves es el precio final en dólares. Sin renovación automática, sin costos ocultos. Cuando se terminan los GB o los días, simplemente dejás de tener datos.",
  },
  {
    q: "¿Qué diferencia hay entre el plan Prepago y DataOnly?",
    a: "Con el plan Prepago los 28 días empiezan a contar desde que activás la eSIM (podés esperar hasta 12 meses). Con DataOnly comprás ahora y tenés 60 días para activarla — ideal si tu viaje no está confirmado.",
  },
];

const FAQ_PT = [
  {
    q: "O que é um eSIM?",
    a: "Um eSIM é um SIM virtual que se instala diretamente no seu celular escaneando um código QR. Não precisa de cartão físico. Funciona igual a um SIM tradicional mas ativa instantaneamente.",
  },
  {
    q: "Como sei se meu celular é compatível com eSIM?",
    a: "iPhone XS / XR (2018) ou mais novos, Samsung Galaxy S20 ou mais novos e Google Pixel 4a ou mais novos são compatíveis. Verifique em Ajustes → Geral → Informações → eSIM.",
  },
  {
    q: "Posso manter meu número de telefone brasileiro?",
    a: "Sim. Seu número continua funcionando no SIM físico do seu celular. O eSIM é usado apenas para dados na Europa. Você pode receber chamadas e WhatsApp normalmente.",
  },
  {
    q: "Quando ativo o eSIM da RUTA34?",
    a: "Recomendamos instalar o QR antes de sair do seu país (com WiFi) e ativar o eSIM ao pousar na Europa. Para o plano DataOnly você tem 60 dias desde a compra para ativá-lo.",
  },
  {
    q: "Há custos adicionais ou surpresas na fatura?",
    a: "Não. O preço que você vê é o preço final em dólares. Sem renovação automática, sem custos ocultos. Quando os GB ou os dias acabarem, simplesmente para de ter dados.",
  },
  {
    q: "Qual a diferença entre o plano Pré-pago e DataOnly?",
    a: "No plano Pré-pago os 28 dias começam a contar desde que você ativa o eSIM (pode esperar até 12 meses). Com DataOnly você compra agora e tem 60 dias para ativá-lo.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildProductName(plan: (typeof PLANS)[0], locale: "es" | "pt"): string {
  const gb = `${plan.data_gb} GB`;
  const zone =
    plan.zone === "espana"
      ? locale === "es" ? "España" : "Espanha"
      : locale === "es" ? "Europa (30+ países)" : "Europa (30+ países)";
  const type =
    plan.type === "local"
      ? locale === "es" ? "con número español" : "com número espanhol"
      : locale === "es" ? "solo datos" : "só dados";
  return `eSIM ${zone} ${gb} ${type} — RUTA34 Telecom`;
}

function buildProductDescription(plan: (typeof PLANS)[0], locale: "es" | "pt"): string {
  const zone =
    plan.zone === "espana"
      ? locale === "es" ? "España" : "Espanha"
      : locale === "es" ? "más de 30 países europeos" : "mais de 30 países europeus";
  return locale === "es"
    ? `eSIM con ${plan.data_gb} GB de datos para ${zone}. Válida por ${plan.duration_days} días desde la activación. Sin tarjeta física, instalación por QR.`
    : `eSIM com ${plan.data_gb} GB de dados para ${zone}. Válida por ${plan.duration_days} dias desde a ativação. Sem cartão físico, instalação por QR.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeSchemaOrg({ locale }: Props) {
  const url = `${base}/${locale}`;
  const faqItems = locale === "pt" ? FAQ_PT : FAQ_ES;

  // Organization
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RUTA34 Telecom",
    url: base,
    logo: `${base}/logo.png`,
    sameAs: [
      "https://wa.me/34600000000",
      "https://esimruta34.com",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "soporte@esimruta34.com",
      contactType: "customer support",
      availableLanguage: ["Spanish", "Portuguese"],
    },
  };

  // WebSite
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RUTA34 Telecom",
    url: base,
    inLanguage: locale === "es" ? "es-AR" : "pt-BR",
    description:
      locale === "es"
        ? "eSIM instantánea para viajeros latinoamericanos que van a Europa. Conectate desde USD 19.90."
        : "eSIM instantâneo para viajantes latino-americanos que vão à Europa. Conecte-se a partir de USD 19,90.",
  };

  // FAQPage — genera rich results en SERPs
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  // Products — uno por cada plan activo
  const products = PLANS.map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildProductName(plan, locale),
    description: buildProductDescription(plan, locale),
    brand: { "@type": "Brand", name: "RUTA34 Telecom" },
    category: "eSIM",
    offers: {
      "@type": "Offer",
      price: plan.price_usd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${url}/compra?plan=${plan.id}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      seller: { "@type": "Organization", name: "RUTA34 Telecom" },
    },
  }));

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={faqPage} />
      {products.map((product, i) => (
        <JsonLd key={i} data={product} />
      ))}
    </>
  );
}
