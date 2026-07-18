import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import CookieBanner from "@/components/legal/CookieBanner";
import { GTMScript } from "@/components/analytics/GTM";
import { MetaPixelScript, MetaPixelRouteTracker } from "@/components/analytics/MetaPixel";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "pt")) {
    notFound();
  }

  const messages = await getMessages();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <NextIntlClientProvider messages={messages}>
      {/* GTM script — carga asíncrona después de hidratación */}
      <GTMScript nonce={nonce} />
      {/* Meta Pixel — misma carga consent-gated que GTM */}
      <MetaPixelScript nonce={nonce} />
      <MetaPixelRouteTracker />
      {children}
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
