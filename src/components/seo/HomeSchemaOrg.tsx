import JsonLd from "./JsonLd";
import { getPlans } from "@/lib/plans-server";

const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

interface Props {
  locale: "es" | "pt";
}

// ── FAQ bilingüe ──────────────────────────────────────────────────────────────

const FAQ_ES = [
  {
    q: "¿Es lo mismo una eSIM que un chip para Europa?",
    a: "Sí, es exactamente lo mismo. Una eSIM es la versión digital del chip físico tradicional. Se instala escaneando un QR en tu celular (menos de 5 minutos, sin tarjeta física). Comprás desde Argentina, Chile, Uruguay o Brasil y al llegar a Europa ya tenés internet. La ventaja: sin tiendas, sin envíos, sin esperas.",
  },
  {
    q: "¿Qué es una eSIM?",
    a: "Una eSIM es un chip digital que se instala escaneando un código QR en tu teléfono. No necesitás tarjeta física. Funciona igual que una SIM tradicional pero se activa instantáneamente desde tu celular — ideal para viajar sin complicaciones.",
  },
  {
    q: "¿Cómo sé si mi celular es compatible con eSIM?",
    a: "Modelos compatibles: iPhone XS/XR (2018+), Samsung Galaxy S20+, Google Pixel 4a+. Verificación rápida: en iPhone → Ajustes → General → Información → eSIM. En Android → Ajustes → Acerca del teléfono → si ves dos IMEI, tienes eSIM.",
  },
  {
    q: "¿Puedo mantener mi número de teléfono latinoamericano?",
    a: "¡Sí! Tu número original sigue activo en la SIM física. La eSIM solo agrega datos móviles en Europa. Recibís llamadas, WhatsApp y SMS como siempre con tu número actual.",
  },
  {
    q: "¿Cuándo activo la eSIM de RUTA34?",
    a: "Instala el QR antes de viajar (con WiFi en tu país). Actívalo cuando aterrizás en Europa. Para DataOnly: tenés 60 días desde la compra para activar. Para Prepago: 12 meses para activar.",
  },
  {
    q: "¿Hay costos adicionales o sorpresas en la factura?",
    a: "No. El precio mostrado es el final — en dólares USD, sin renovación automática. Cuando se agotan los GB o días, el servicio se detiene sin cobros adicionales.",
  },
  {
    q: "¿Qué diferencia hay entre el plan Prepago y DataOnly?",
    a: "Prepago: 28 días desde la fecha de activación (podés esperar hasta 12 meses). DataOnly: comprás ahora, 60 días para activar — perfecto si tu viaje aún no está confirmado al 100%.",
  },
];

const FAQ_PT = [
  {
    q: "O que é um eSIM?",
    a: "Um eSIM é um chip digital que se instala escaneando um código QR no seu telefone. Não precisa de cartão físico. Funciona igual a um SIM tradicional mas ativa instantaneamente — perfeito para viajar sem complicações.",
  },
  {
    q: "Como sei se meu celular é compatível com eSIM?",
    a: "Modelos compatíveis: iPhone XS/XR (2018+), Samsung Galaxy S20+, Google Pixel 4a+. Verificação rápida: no iPhone → Ajustes → Geral → Informações → eSIM. No Android → Ajustes → Sobre o telefone → se vê dois IMEI, tem eSIM.",
  },
  {
    q: "Posso manter meu número de telefone brasileiro?",
    a: "Sim! Seu número original fica ativo no SIM físico. O eSIM só adiciona dados móveis na Europa. Você recebe ligações, WhatsApp e SMS normalmente com seu número atual.",
  },
  {
    q: "Quando ativo o eSIM da RUTA34?",
    a: "Instale o QR antes de viajar (com WiFi no seu país). Ative quando chegar na Europa. Para DataOnly: 60 dias desde a compra. Para Pré-pago: 12 meses para ativar.",
  },
  {
    q: "Há custos adicionais ou surpresas na fatura?",
    a: "Não. O preço mostrado é o final — em dólares USD, sem renovação automática. Quando os GB ou dias acabarem, o serviço para sem cobranças adicionais.",
  },
  {
    q: "Qual a diferença entre o plano Pré-pago e DataOnly?",
    a: "Pré-pago: 28 dias a partir da data de ativação (pode esperar até 12 meses). DataOnly: compra agora, 60 dias para ativar — perfeito se sua viagem ainda não está 100% confirmada.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  data_gb: number;
  price_usd: number;
  zone: "espana" | "europa";
  duration_days: number;
  type: "local" | "dataonly";
}

function buildProductName(plan: Plan, locale: "es" | "pt"): string {
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

function buildProductDescription(plan: Plan, locale: "es" | "pt"): string {
  const zone =
    plan.zone === "espana"
      ? locale === "es" ? "España" : "Espanha"
      : locale === "es" ? "más de 30 países europeos" : "mais de 30 países europeus";
  return locale === "es"
    ? `eSIM con ${plan.data_gb} GB de datos para ${zone}. Válida por ${plan.duration_days} días desde la activación. Sin tarjeta física, instalación por QR.`
    : `eSIM com ${plan.data_gb} GB de dados para ${zone}. Válida por ${plan.duration_days} dias desde a ativação. Sem cartão físico, instalação por QR.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function HomeSchemaOrg({ locale }: Props) {
  const url = `${base}/${locale}`;
  const faqItems = locale === "pt" ? FAQ_PT : FAQ_ES;
  const plans = await getPlans();

  // Organization
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RUTA34 Telecom",
    url: base,
    logo: `${base}/logo.png`,
    sameAs: [
      "https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491136583054"}",
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

  // Products — uno por cada plan activo desde Supabase
  const products = plans.map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: buildProductName(plan, locale),
    description: buildProductDescription(plan, locale),
    image: `${base}/logo.png`,
    brand: { "@type": "Brand", name: "RUTA34 Telecom" },
    category: "eSIM",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
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
      shippingDetails: {
        "@type": "ShippingDeliveryTime",
        "shippingRate": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "price": "0"
        },
        "shippingDestination": {
          "@type": "DeliveryAddress",
          "addressCountry": ["ES", "PT", "IT", "FR", "DE", "GB", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "PL", "CZ", "HU", "RO", "HR", "SI", "GR"]
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "MIN"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 0,
            "unitCode": "MIN"
          }
        }
      }
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
