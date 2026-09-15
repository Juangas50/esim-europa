import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getPlans } from "@/lib/plans-server";
import { formatUSD } from "@/lib/utils";
import { WHATSAPP_URL } from "@/config/constants";

// Siempre usar el dominio real en producción — ignorar si apunta a vercel.app
const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;

// Página específica para el mercado argentino — solo existe en español.
// No hay contraparte en pt: el contenido (voseo rioplatense, roaming AR,
// pesos vs. dólares) no tiene sentido traducido, así que /pt/... da 404.
const PAGE_PATH = "/esim-europa-desde-argentina";
const PAGE_URL = `${base}/es${PAGE_PATH}`;

// ── FAQ específica para Argentina — el texto acá debe coincidir 1:1 con el
// FAQPage JSON-LD más abajo (Google penaliza el desajuste contenido/schema).
const FAQS = [
  {
    q: "¿Mantengo mi número argentino y mi WhatsApp?",
    a: "Sí. Tu línea argentina sigue activa en la SIM física de siempre — nadie te la toca. La eSIM de RUTA34 se instala además, como una segunda línea, y te suma número español, llamadas y datos para Europa. WhatsApp sigue funcionando con tu número argentino de costumbre; no hace falta reinstalarlo ni cambiar nada.",
  },
  {
    q: "¿Cómo pago desde Argentina?",
    a: "Con tarjeta de crédito o débito internacional (Visa o Mastercard), Apple Pay, Google Pay o PayPal. El precio está en dólares y es el precio final, sin pagos en pesos ni intermediarios. Al ser un consumo en el exterior con tarjeta, tu resumen puede incluir el impuesto PAIS y las percepciones que correspondan según la normativa impositiva vigente en Argentina — eso depende de tu banco y del Estado argentino, no de RUTA34.",
  },
  {
    q: "¿Cuándo empieza a contar mi plan?",
    a: "Tus 28 días arrancan el día que te enviamos el código QR por email — no el día que lo instalás. Podés elegir que te lo enviemos ya mismo o programarlo para una fecha futura, hasta 12 meses después de la compra. La recomendación: comprá desde Argentina con anticipación, instalá el QR con el wifi de tu casa antes de salir para Ezeiza, y programá el inicio para el día que aterrizás — así no perdés ni un día del plan mientras hacés las valijas.",
  },
  {
    q: "¿Mi celular es compatible con eSIM?",
    a: "La mayoría de los celulares vendidos en Argentina desde 2019/2020 en adelante son compatibles: iPhone XS/XR en adelante, Samsung Galaxy S20 en adelante y Google Pixel 3 en adelante, entre otros. Para confirmarlo en el momento, marcá *#06# en tu teléfono: si aparece un código que empieza con \"EID\", tu equipo es compatible. Ojo con los celulares comprados \"liberados\" de otro operador o traídos de otro país: además de soportar eSIM, tienen que estar desbloqueados para poder usar una línea distinta a la que traían.",
  },
  {
    q: "¿Cuántos GB necesito según cuántos días viajo?",
    a: "Depende más de cómo usás el celular que de los días exactos. Como referencia: uso liviano (WhatsApp, Maps, redes sociales de vez en cuando) gasta entre 3 y 5 GB por semana — para una escapada de 10 a 15 días, el plan Europa Básico (90 GB) sobra de lejos. Uso normal (navegación seguida, Instagram, alguna videollamada) son entre 5 y 15 GB por semana — para un viaje de 3 a 4 semanas, Europa Plus o Europa Total rinden bien. Si vas a mirar streaming, compartir el hotspot con alguien más o trabajar en remoto conectado todo el día, sumá Europa Max o Europa Premium. Todos los planes duran los mismos 28 días; lo que cambia entre uno y otro es la bolsa de datos, no la validez.",
  },
] as const;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "es") return {};

  const plans = await getPlans({ webOnly: true });
  const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.price_usd)) : undefined;
  const priceLabel = minPrice != null ? formatUSD(minPrice) : "";
  const withPrice = (text: string) =>
    priceLabel ? text.replace("{price}", priceLabel) : text.replace(/\s*desde\s*\{price\}\.?/i, "").trim();

  const title = "eSIM Europa desde Argentina | Con número español incluido — RUTA34";
  const description = withPrice(
    "eSIM para viajar a Europa desde Argentina, con número español y llamadas España-Argentina incluidas. Comprás antes de viajar, instalás con QR y llegás conectado. Desde {price}, sin roaming."
  );

  return {
    title,
    description,
    keywords:
      "esim europa desde argentina, chip para europa desde argentina, internet en europa para argentinos, esim españa argentina, cuánto sale el roaming a europa, chip prepago europa argentina",
    alternates: {
      canonical: PAGE_URL,
      languages: {
        es: PAGE_URL,
        "x-default": PAGE_URL,
      },
    },
    openGraph: {
      title: "eSIM para Europa desde Argentina — número español incluido",
      description: withPrice(
        "Nada de roaming caro por día. Comprás tu eSIM desde Argentina, viajás con número español y llamás gratis a tu familia. Desde {price}."
      ),
      type: "website",
      url: PAGE_URL,
      locale: "es_AR",
      siteName: "RUTA34 Telecom",
    },
    twitter: {
      card: "summary_large_image",
      title: "eSIM para Europa desde Argentina — número español incluido",
      description: "Sin roaming caro por día. Número español y llamadas a Argentina incluidas.",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function EsimEuropaArgentinaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "es") notFound();

  const plans = await getPlans({ webOnly: true });
  const sortedPlans = [...plans].sort((a, b) => a.price_usd - b.price_usd);
  const minPrice = sortedPlans.length > 0 ? sortedPlans[0].price_usd : undefined;
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // ── JSON-LD ──────────────────────────────────────────────────────────────

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${base}/es` },
      { "@type": "ListItem", position: 2, name: "eSIM Europa desde Argentina", item: PAGE_URL },
    ],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const products = sortedPlans.map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `eSIM Europa desde Argentina ${plan.data_gb} GB con número español — RUTA34 Telecom`,
    description: `eSIM para viajar de Argentina a Europa con ${plan.data_gb} GB de datos, número español incluido y llamadas España-Argentina. Válida ${plan.duration_days} días desde el envío del código QR. Sin tarjeta física, se instala por QR antes de viajar.`,
    image: `${base}/logo.png`,
    brand: { "@type": "Brand", name: "RUTA34 Telecom" },
    category: "eSIM",
    offers: {
      "@type": "Offer",
      price: plan.price_usd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${base}/es/compra?plan=${plan.id}`,
      seller: { "@type": "Organization", name: "RUTA34 Telecom" },
    },
  }));

  return (
    <>
      <JsonLd data={breadcrumb} nonce={nonce} />
      <JsonLd data={faqPage} nonce={nonce} />
      {products.map((product, i) => (
        <JsonLd key={i} data={product} nonce={nonce} />
      ))}

      <Navbar />

      <main className="bg-[var(--color-warm-white)]">
        {/* ── Breadcrumb visual ────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="pt-24 px-4">
          <div className="max-w-5xl mx-auto text-xs text-[var(--color-ink-2)]">
            <Link href="/es" className="hover:text-[var(--color-gold)] transition-colors">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-ink)] font-medium">eSIM Europa desde Argentina</span>
          </div>
        </nav>

        {/* ── 1. Hero ──────────────────────────────────────────────────── */}
        <section className="px-4 pt-6 pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 mb-6">
              <span className="text-base">🇦🇷</span>
              <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wide">
                Hecho para viajeros argentinos
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[var(--color-navy)] leading-[1.08] max-w-3xl mb-6">
              eSIM para Europa desde Argentina
            </h1>

            <p className="text-lg sm:text-xl text-[var(--color-ink)] leading-relaxed max-w-2xl mb-8">
              Comprás desde Argentina antes de viajar y llegás a Europa con internet activo,{" "}
              <strong className="text-[var(--color-navy)]">número de teléfono español propio</strong> y{" "}
              <strong className="text-[var(--color-navy)]">llamadas España ↔ Argentina incluidas</strong> —
              nada de pagar roaming por día ni depender solo de WhatsApp para que tu familia te ubique.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="#planes"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] font-bold hover:bg-[var(--color-gold-light)] active:scale-[0.97] transition-all shadow-lg"
              >
                Ver planes para Europa
              </a>
              <a
                href="#como-funciona-argentina"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[var(--color-navy)]/15 text-[var(--color-navy)] font-bold hover:bg-[var(--color-navy)]/5 transition-all"
              >
                Cómo funciona
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {[
                { label: "Número español", value: "Incluido" },
                { label: "Validez", value: "28 días" },
                { label: "Países", value: "30" },
                { label: "Activación", value: "2 min" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white border border-[var(--color-border)] p-4">
                  <p className="text-lg font-black text-[var(--color-navy)]">{item.value}</p>
                  <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. El problema del roaming argentino ────────────────────── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-[var(--color-navy)] mb-6 leading-tight">
              Cuánto sale el roaming a Europa desde Argentina (y por qué conviene evitarlo)
            </h2>
            <p className="text-lg text-[var(--color-ink)] leading-relaxed max-w-3xl mb-4">
              Activar el roaming internacional de Claro, Movistar o Personal para viajar a Europa
              funciona siempre bajo la misma lógica, más allá del operador que uses: te venden un
              paquete de datos limitado que se cobra <strong>en dólares</strong> y{" "}
              <strong>por día</strong>. Si te pasás del paquete diario, el operador te sigue cobrando
              megabyte por megabyte a un precio mucho más alto, o directamente te corta el dato hasta
              el día siguiente.
            </p>
            <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-3xl mb-10">
              Los valores exactos cambian según operador, plan contratado y promoción vigente — para
              una cifra actualizada, confirmá siempre con tu compañía antes de viajar. Lo que sí se
              mantiene igual en las tres es la estructura del cobro: pagás por día, en dólares, con un
              tope de datos chico y sin devolución si no lo usás.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/[0.08] p-6 bg-[var(--color-warm-white)]">
                <h3 className="font-bold text-[var(--color-navy)] mb-4">
                  Roaming de tu operadora argentina
                </h3>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-2)]">
                  <li>✕ Se cobra por día, aunque no abras el celular</li>
                  <li>✕ Paquete de datos chico, con corte o recargo si te pasás</li>
                  <li>✕ El costo cambia según en qué país de Europa estés</li>
                  <li>✕ Hay que activarlo a mano antes de cada viaje</li>
                  <li>✕ No sabés el gasto final hasta que llega la factura</li>
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-[var(--color-gold)] p-6 bg-white shadow-sm">
                <h3 className="font-bold text-[var(--color-navy)] mb-4">eSIM RUTA34</h3>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink)]">
                  <li className="font-medium">✓ Pago único, antes de viajar, en dólares</li>
                  <li className="font-medium">✓ Bolsa de GB fija para los 28 días completos</li>
                  <li className="font-medium">✓ Misma eSIM en los 30 países del plan, sin reactivar nada</li>
                  <li className="font-medium">✓ Se instala desde Argentina, con el wifi de tu casa</li>
                  <li className="font-medium">✓ Sabés el precio final antes de comprar</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Diferenciador: número español ─────────────────────────── */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-navy)]/5 border border-[var(--color-navy)]/10 mb-5">
                <span className="text-xs font-bold text-[var(--color-navy)] uppercase tracking-wide">
                  Lo que casi nadie ofrece
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-[var(--color-navy)] mb-5 leading-tight">
                Un número de teléfono español real, no solo datos
              </h2>
              <p className="text-base text-[var(--color-ink)] leading-relaxed mb-4">
                La mayoría de los chips digitales para Europa venden solo datos: te conectan a
                internet y listo, sin línea propia. Los planes de RUTA34 incluyen una línea española
                completa —número, llamadas y SMS— además de los datos.
              </p>
              <p className="text-base text-[var(--color-ink-2)] leading-relaxed">
                Y las llamadas no son solo dentro de España: cada plan incluye minutos para llamar
                entre España y Argentina, así que podés avisarle a tu familia que llegaste bien sin
                depender de que tengan WhatsApp abierto o buena señal de wifi.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Recibís llamadas sin depender de WhatsApp",
                  desc: "Bancos, hoteles, migraciones o un contacto en España te pueden llamar a tu número, aunque no tengas datos en ese momento.",
                },
                {
                  title: "Verificaciones y apps que piden número local",
                  desc: "Delivery, transporte o confirmaciones por SMS suelen pedir un número del país donde estás — con tu eSIM RUTA34 lo tenés.",
                },
                {
                  title: "Llamadas España ↔ Argentina incluidas",
                  desc: "Cada plan trae minutos para llamar de vuelta a Argentina (y a otros destinos de Latinoamérica) sin cargo extra por llamada internacional.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-white border border-[var(--color-border)] p-5"
                >
                  <p className="font-bold text-[var(--color-navy)] mb-1">{item.title}</p>
                  <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Calidad de red ────────────────────────────────────────── */}
        <section className="py-14 px-4 bg-[var(--color-navy)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-white mb-5 leading-tight">
              Cobertura premium, no reventa de señal
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-3xl mb-8">
              Trabajamos con redes de primer nivel en España y Europa: cobertura premium, no redes
              secundarias de reventa. En cada país del plan, tu eSIM se conecta a las mejores redes
              locales disponibles, con velocidad 4G y 5G en ciudades principales, aeropuertos y zonas
              turísticas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-2xl font-black text-[var(--color-gold)] mb-1">4G/5G</p>
                <p className="text-sm text-white/70">Velocidad en ciudades y zonas turísticas</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-2xl font-black text-[var(--color-gold)] mb-1">30 países</p>
                <p className="text-sm text-white/70">Misma eSIM, sin reactivar nada al cruzar frontera</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-2xl font-black text-[var(--color-gold)] mb-1">Sin reventa</p>
                <p className="text-sm text-white/70">Redes de primer nivel, no segundas marcas</p>
              </div>
            </div>
            <p className="text-xs text-white/50 mt-6 max-w-2xl">
              En zonas muy rurales o de montaña la cobertura puede ser limitada, como con cualquier
              red móvil.
            </p>
          </div>
        </section>

        {/* ── 5. Planes ─────────────────────────────────────────────────── */}
        <section id="planes" className="py-14 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-[var(--color-navy)] mb-3 leading-tight">
              Elegí tu plan antes de viajar
            </h2>
            <p className="text-base text-[var(--color-ink-2)] mb-10 max-w-2xl">
              Los cinco planes incluyen número español, llamadas y SMS ilimitados en España, llamadas
              a Argentina y 28 días de validez desde que te enviamos el QR. Cambia únicamente la
              cantidad de datos.
            </p>

            {sortedPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col rounded-2xl border border-[var(--color-border)] p-6 bg-[var(--color-warm-white)] hover:border-[var(--color-gold)] transition-colors"
                  >
                    <h3 className="text-lg font-black text-[var(--color-ink)] uppercase tracking-wide mb-3">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-black text-[var(--color-gold)]">
                        {plan.data_gb}
                      </span>
                      <span className="text-sm font-bold text-[var(--color-ink-2)]">GB</span>
                    </div>
                    {plan.eu_data_gb ? (
                      <p className="text-xs text-[var(--color-ink-2)] mb-4">
                        hasta {plan.eu_data_gb} GB fuera de España
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-ink-2)] mb-4">datos 4G/5G en total</p>
                    )}
                    <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
                      <p className="text-3xl font-black text-[var(--color-navy)] mb-1">
                        {formatUSD(plan.price_usd)}
                      </p>
                      <p className="text-xs text-[var(--color-ink-2)] mb-4">
                        por {plan.duration_days} días
                      </p>
                      <Link
                        href={`/es/compra?plan=${plan.id}`}
                        className="block w-full text-center py-2.5 rounded-lg font-bold text-sm border-2 border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white transition-all"
                      >
                        Comprar {plan.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-ink-2)]">
                Estamos actualizando el catálogo. Escribinos por{" "}
                <a href={WHATSAPP_URL} className="text-[var(--color-gold)] font-semibold">
                  WhatsApp
                </a>{" "}
                y te contamos los planes disponibles.
              </p>
            )}
          </div>
        </section>

        {/* ── 6. Cómo funciona desde Argentina ─────────────────────────── */}
        <section id="como-funciona-argentina" className="py-14 px-4 bg-[var(--color-warm-white)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-[var(--color-navy)] mb-10 leading-tight">
              Cómo comprar tu eSIM desde Argentina
            </h2>
            <div className="space-y-0">
              {[
                {
                  num: "01",
                  title: "Comprás antes de viajar, desde Argentina",
                  desc: "Elegís el plan en la web, pagás en dólares con tarjeta internacional, Apple Pay, Google Pay o PayPal. No hace falta salir de tu casa ni pasar por ninguna tienda.",
                },
                {
                  num: "02",
                  title: "Recibís el QR por email",
                  desc: "Te llega el código QR y las instrucciones a tu correo. Instalalo con el wifi de tu casa antes de salir para el aeropuerto — así no dependés de ningún dato móvil para hacerlo.",
                },
                {
                  num: "03",
                  title: "Escaneás y llegás conectado",
                  desc: "Al aterrizar en España o cualquiera de los 30 países del plan, activás los datos y ya tenés internet, número español y llamadas a Argentina funcionando.",
                },
              ].map((step) => (
                <div key={step.num}>
                  <div className="h-px bg-[var(--color-navy)]/8" />
                  <div className="grid grid-cols-12 gap-4 py-8">
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-4xl sm:text-5xl font-black text-[var(--color-navy)]/10 tabular-nums">
                        {step.num}
                      </span>
                    </div>
                    <div className="col-span-10 sm:col-span-11">
                      <h3 className="text-xl font-black text-[var(--color-navy)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[var(--color-ink-2)] leading-relaxed max-w-xl">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-px bg-[var(--color-navy)]/8" />
            </div>
          </div>
        </section>

        {/* ── 7. FAQ ────────────────────────────────────────────────────── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-[var(--color-navy)] mb-8 leading-tight">
              Preguntas de argentinos que viajan a Europa
            </h2>
            <div className="space-y-3">
              {FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-warm-white)] open:bg-white open:shadow-sm p-6"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-[var(--color-navy)]">
                    {item.q}
                    <span className="shrink-0 text-[var(--color-gold)] text-xl group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[var(--color-ink)] leading-relaxed whitespace-pre-line">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-[var(--color-ink-2)]">
              ¿Otra duda?{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-gold)] font-semibold hover:underline"
              >
                Escribinos por WhatsApp →
              </a>
            </p>
          </div>
        </section>

        {/* ── 8. Testimonio ────────────────────────────────────────────── */}
        <section className="py-14 px-4 bg-[var(--color-warm-white)]">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-[var(--color-border)]">
              <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-auto shrink-0">
                <Image
                  src="/images/imagen3.png"
                  alt="Lucía, viajera argentina, conectada en Madrid"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇦🇷</span>
                  <p className="font-bold text-[var(--color-navy)]">Lucía F. — Argentina</p>
                </div>
                <blockquote className="text-[var(--color-ink)] italic leading-relaxed mb-3">
                  &ldquo;Me salvó el viaje. Llegué a Madrid y ya tenía internet, sin hacer nada en el
                  aeropuerto. El QR con todas las instrucciones me llegó directo al email.
                  Increíble.&rdquo;
                </blockquote>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
                  Europa Plus · 270 GB
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. CTA final ──────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-[var(--color-navy)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl text-white mb-4 leading-tight">
              Preparate para viajar antes de subir al avión
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Comprá tu eSIM desde Argentina{minPrice != null ? ` desde ${formatUSD(minPrice)}` : ""},
              instalala con el wifi de tu casa y llegá a Europa ya conectado.
            </p>
            <a
              href="#planes"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-lg hover:bg-[var(--color-gold-light)] active:scale-[0.97] transition-all shadow-lg"
            >
              Ver planes para Europa
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
