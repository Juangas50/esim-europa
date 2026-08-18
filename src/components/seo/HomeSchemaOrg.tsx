import JsonLd from "./JsonLd";
import { getPlans } from "@/lib/plans-server";
import { TOTAL_DESTINATIONS, getPlanCoverageCount } from "@/lib/coverage";
import { toPlanKey } from "@/lib/plan-key";
import { WHATSAPP_NUMBER } from "@/config/constants";

const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

interface Props {
  locale: "es" | "pt";
  nonce?: string;
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
    a: "Modelos compatibles: iPhone XS/XR (2018+), Samsung Galaxy S20+, Google Pixel 3+. Verificación rápida: en iPhone → Ajustes → General → Información → eSIM. En Android → Ajustes → Acerca del teléfono → si ves dos IMEI, tienes eSIM.",
  },
  {
    q: "¿Puedo mantener mi número de teléfono latinoamericano?",
    a: "¡Sí! Tu número original sigue activo en la SIM física. La eSIM solo agrega datos móviles en Europa. Recibís llamadas, WhatsApp y SMS como siempre con tu número actual.",
  },
  {
    q: "¿Cuándo activo la eSIM de RUTA34?",
    a: "Tus 28 días empiezan a correr desde que te enviamos el código QR (no desde que lo instalás) — el mismo día si elegís activación inmediata, o en la fecha que elijas si la programás, hasta 12 meses después de la compra. Instalá el QR con WiFi antes de viajar para tener conexión apenas aterrices.",
  },
  {
    q: "¿Hay costos adicionales o sorpresas en la factura?",
    a: "No. El precio de la compra es el final —en dólares USD— y no hay suscripción ni cargos recurrentes a tu tarjeta. La tarifa tiene un ciclo de 28 días y, al terminar, se renueva automáticamente si la línea tiene saldo suficiente: se usa ese saldo, no se vuelve a cobrar en la tarjeta. Si durante el viaje necesitás más datos antes de que termine el ciclo, podés pedir una renovación anticipada; escribinos y te ayudamos a gestionarlo.",
  },
  {
    q: "¿Cuándo empiezan a contar mis 28 días?",
    a: "Desde que te enviamos el código QR — inmediato o en la fecha programada que elijas, hasta 12 meses a futuro. No dependen de cuándo lo instalás en el teléfono.",
  },
  {
    q: "¿En cuántos países funciona el eSIM de RUTA34?",
    // La cifra sale de `coverage.json`, no de una lista escrita aquí: si mañana
    // se añade un destino, esta respuesta cambia sola. La excepción se dice,
    // porque Europa Básico no llega a todos.
    a: `En ${TOTAL_DESTINATIONS} destinos de Europa y Estados Unidos. Todos los planes cubren los destinos europeos; Estados Unidos entra en Europa Plus, Total, Max y Premium, pero no en Europa Básico.`,
  },
  {
    q: "¿Qué velocidad de internet tengo en Europa?",
    a: "La velocidad depende de la cobertura local del operador móvil, pero generalmente es 4G/LTE o 5G en ciudades principales. En zonas rurales puede ser 3G. Mientras te queden GB incluidos no hay límite de velocidad; una vez agotados y sin saldo disponible, la conexión puede quedar a velocidad mínima.",
  },
  {
    q: "¿Cuánto tiempo tarda la instalación de la eSIM?",
    a: "La instalación es rápida: escaneás el QR con tu celular y tarda menos de 5 minutos. No necesitás reiniciar el teléfono. Si instalás antes de viajar, cuando llegas a Europa solo prendés datos móviles y listo.",
  },
  {
    q: "¿Puedo usar eSIM y SIM física al mismo tiempo?",
    a: "Sí, la mayoría de teléfonos modernos soportan Dual SIM (una eSIM + una SIM física). Esto te permite mantener tu número de casa en la SIM física y usar datos de RUTA34 en la eSIM simultáneamente.",
  },
  {
    q: "¿Qué pasa si me quedo sin datos antes de terminar mis 28 días?",
    a: "No hace falta esperar al día 28: podés pedir una renovación anticipada de la tarifa y te ayudamos a gestionarla. Si no renovás, dentro de España la conexión puede quedar a velocidad mínima. En roaming por la Unión Europea, agotado el máximo que tu plan permite gastar fuera de España y si hay saldo en la línea, el consumo adicional puede cobrarse a 1,33 €/GB; en destinos fuera de la UE, escribinos y lo confirmamos.",
  },
  {
    q: "¿La eSIM funciona en todas las ciudades de Europa?",
    a: "Funciona en ciudades principales, zonas turísticas y áreas urbanas. En zonas muy rurales o montañosas puede haber cobertura limitada.",
  },
  {
    q: "¿Cómo verifico que mi iPhone sea compatible con eSIM?",
    a: "Modelos compatibles: iPhone XS, XS Max, XR (2018) y posteriores. Verificación: Ajustes → General → Información → busca 'eSIM' en la sección de configuración de red.",
  },
  {
    q: "¿Cómo verifico que mi Samsung sea compatible con eSIM?",
    a: "Compatibles: Galaxy S20 y posteriores, Galaxy Z Fold/Flip series. Verificación: Ajustes → Acerca del teléfono → Información de la SIM → Si ves dos IMEI, tienes eSIM.",
  },
  {
    q: "¿Puedo cancelar mi plan y obtener un reembolso?",
    a: "Podés pedir la cancelación y el reembolso completo dentro de las 24 horas siguientes a la compra, siempre que no hayas instalado el código QR en ningún dispositivo. Una vez instalada la eSIM no procede reembolso, porque el perfil ya quedó activado en tu teléfono.",
  },
];


const FAQ_PT = [
  {
    q: "O que é um eSIM?",
    a: "Um eSIM é um chip digital que se instala escaneando um código QR no seu telefone. Não precisa de cartão físico. Funciona igual a um SIM tradicional mas ativa instantaneamente — perfeito para viajar sem complicações.",
  },
  {
    q: "Como sei se meu celular é compatível com eSIM?",
    a: "Modelos compatíveis: iPhone XS/XR (2018+), Samsung Galaxy S20+, Google Pixel 3+. Verificação rápida: no iPhone → Ajustes → Geral → Informações → eSIM. No Android → Ajustes → Sobre o telefone → se vê dois IMEI, tem eSIM.",
  },
  {
    q: "Posso manter meu número de telefone brasileiro?",
    a: "Sim! Seu número original fica ativo no SIM físico. O eSIM só adiciona dados móveis na Europa. Você recebe ligações, WhatsApp e SMS normalmente com seu número atual.",
  },
  {
    q: "Quando ativo o eSIM da RUTA34?",
    a: "Seus 28 dias começam a contar desde que enviamos o código QR (não desde que você instala) — no mesmo dia se escolher ativação imediata, ou na data que agendar, até 12 meses após a compra. Instale o QR com WiFi antes de viajar para ter conexão assim que aterrissar.",
  },
  {
    q: "Há custos adicionais ou surpresas na fatura?",
    a: "Não. O preço da compra é o final —em dólares USD— e não há assinatura nem cobranças recorrentes no seu cartão. A tarifa tem um ciclo de 28 dias e, ao terminar, é renovada automaticamente se a linha tiver saldo suficiente: usa-se esse saldo, não se cobra de novo no cartão. Se durante a viagem precisar de mais dados antes do fim do ciclo, pode pedir uma renovação antecipada; fale com a gente e ajudamos a tratar disso.",
  },
  {
    q: "Quando começam a contar meus 28 dias?",
    a: "Desde que enviamos o código QR — imediato ou na data agendada que você escolher, até 12 meses no futuro. Não dependem de quando você instala no telefone.",
  },
  {
    q: "Em quantos países o eSIM da RUTA34 funciona?",
    a: `Em ${TOTAL_DESTINATIONS} destinos da Europa e nos Estados Unidos. Todos os planos cobrem os destinos europeus; os Estados Unidos entram no Europa Plus, Total, Max e Premium, mas não no Europa Básico.`,
  },
  {
    q: "Qual é a velocidade da internet na Europa?",
    a: "A velocidade depende da cobertura local da operadora móvel, mas geralmente é 4G/LTE ou 5G nas cidades principais. Em zonas rurais pode ser 3G. Enquanto houver GB incluídos não há limite de velocidade; depois de esgotados e sem saldo disponível, a conexão pode ficar em velocidade mínima.",
  },
  {
    q: "Quanto tempo leva para instalar o eSIM?",
    a: "A instalação é rápida: você escaneia o QR com seu telefone e leva menos de 5 minutos. Não precisa reiniciar. Se instalar antes de viajar, ao chegar na Europa só liga os dados móveis e pronto.",
  },
  {
    q: "Posso usar eSIM e SIM física ao mesmo tempo?",
    a: "Sim, a maioria dos telefones modernos suporta Dual SIM (um eSIM + um SIM físico). Isso permite manter seu número de casa no SIM físico e usar dados da RUTA34 no eSIM simultaneamente.",
  },
  {
    q: "O que acontece se ficar sem dados antes de 28 dias?",
    a: "Não precisa esperar o dia 28: pode pedir uma renovação antecipada da tarifa e ajudamos a tratar disso. Sem renovar, na Espanha a conexão pode ficar em velocidade mínima. Em roaming pela União Europeia, esgotado o máximo que o seu plano permite gastar fora da Espanha e havendo saldo na linha, o consumo adicional pode ser cobrado a 1,33 €/GB; em destinos fora da UE, fale com a gente e confirmamos.",
  },
  {
    q: "O eSIM funciona em todas as cidades da Europa?",
    a: "Funciona em cidades principais, zonas turísticas e áreas urbanas. Em áreas muito rurais ou montanhosas pode haver cobertura limitada.",
  },
  {
    q: "Como verifico se meu iPhone é compatível com eSIM?",
    a: "Compatíveis: iPhone XS, XS Max, XR (2018) e posteriores. Verificação: Ajustes → Geral → Informações → procure por 'eSIM' na seção de configurações de rede.",
  },
  {
    q: "Como verifico se meu Samsung é compatível com eSIM?",
    a: "Compatíveis: Galaxy S20 e posteriores, série Galaxy Z Fold/Flip. Verificação: Ajustes → Sobre o telefone → Informações do SIM → Se vê dois IMEI, tem eSIM.",
  },
  {
    q: "Posso cancelar e obter reembolso?",
    a: "Você pode pedir o cancelamento e o reembolso integral dentro das 24 horas seguintes à compra, desde que não tenha instalado o código QR em nenhum dispositivo. Uma vez instalado o eSIM não há reembolso, pois o perfil já foi ativado no seu telefone.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  /** Bolsa TOTAL de datos del plan. */
  data_gb: number;
  /** Máximo de esa MISMA bolsa que puede gastarse fuera de España. No se suma a `data_gb`. */
  eu_data_gb?: number;
  price_usd: number;
  zone: "espana" | "europa";
  duration_days: number;
  type: "local" | "dataonly";
}

function buildProductName(plan: Plan, locale: "es" | "pt"): string {
  const gb = `${plan.data_gb} GB`;
  // La cobertura de la gama sale de `coverage.json`. Si la tarifa no es una de
  // las gamas vivas no se pone cifra: mejor «Europa» a secas que un número
  // inventado.
  const destinos = getPlanCoverageCount(toPlanKey(plan.name));
  const zone =
    plan.zone === "espana"
      ? locale === "es" ? "España" : "Espanha"
      : destinos !== null
        ? `Europa (${destinos} ${locale === "es" ? "destinos" : "destinos"})`
        : "Europa";
  const type =
    plan.type === "local"
      ? locale === "es" ? "con número español" : "com número espanhol"
      : locale === "es" ? "solo datos" : "só dados";
  return `eSIM ${zone} ${gb} ${type} — RUTA34 Telecom`;
}

/**
 * `data_gb` es la bolsa TOTAL del plan y `eu_data_gb` el máximo de esa MISMA
 * bolsa que puede gastarse fuera de España. No se suman: describir el plan
 * como "N GB para 30 países" sobredeclara la cobertura real fuera de España.
 */
function buildProductDescription(plan: Plan, locale: "es" | "pt"): string {
  const destinos = getPlanCoverageCount(toPlanKey(plan.name));
  const incluidos = destinos !== null ? `los ${destinos} destinos incluidos` : "los destinos incluidos";
  const incluidosPt = destinos !== null ? `os ${destinos} destinos incluídos` : "os destinos incluídos";

  if (locale === "es") {
    const euLimit = plan.eu_data_gb
      ? ` Fuera de España, en ${incluidos}, podés usar hasta ${plan.eu_data_gb} GB de esa misma bolsa.`
      : "";
    return `eSIM con ${plan.data_gb} GB de datos en total.${euLimit} Válida ${plan.duration_days} días desde que se envía el código QR. Sin tarjeta física, instalación por QR.`;
  }
  const euLimit = plan.eu_data_gb
    ? ` Fora da Espanha, em ${incluidosPt}, você pode usar até ${plan.eu_data_gb} GB da mesma franquia.`
    : "";
  return `eSIM com ${plan.data_gb} GB de dados no total.${euLimit} Válido ${plan.duration_days} dias desde o envio do código QR. Sem cartão físico, instalação por QR.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function HomeSchemaOrg({ locale, nonce }: Props) {
  const url = `${base}/${locale}`;
  const faqItems = locale === "pt" ? FAQ_PT : FAQ_ES;
  // webOnly: solo publicar como Product los planes realmente comprables en la
  // tienda. Sin este filtro se emiten datos estructurados de tarifas ocultas.
  const plans = await getPlans({ webOnly: true });

  // Precio de entrada desde el catálogo vivo, nunca escrito a mano.
  const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.price_usd)) : undefined;
  const minPriceLabel =
    minPrice != null
      ? locale === "es"
        ? `desde USD ${minPrice.toFixed(2)}`
        : `a partir de USD ${minPrice.toFixed(2).replace(".", ",")}`
      : locale === "es"
        ? "sin roaming"
        : "sem roaming";

  // Organization
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RUTA34 Telecom",
    url: base,
    logo: `${base}/logo.png`,
    sameAs: [
      `https://wa.me/${WHATSAPP_NUMBER}`,
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
        ? `eSIM para viajeros latinoamericanos que van a Europa. Número español incluido, ${minPriceLabel}.`
        : `eSIM para viajantes latino-americanos que vão à Europa. Número espanhol incluído, ${minPriceLabel}.`,
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
    offers: {
      "@type": "Offer",
      price: plan.price_usd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${url}/compra?plan=${plan.id}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      dateModified: new Date().toISOString().split("T")[0],
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
      <JsonLd data={organization} nonce={nonce} />
      <JsonLd data={website} nonce={nonce} />
      <JsonLd data={faqPage} nonce={nonce} />
      {products.map((product, i) => (
        <JsonLd key={i} data={product} nonce={nonce} />
      ))}
    </>
  );
}
