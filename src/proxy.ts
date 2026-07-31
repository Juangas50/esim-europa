import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const nextIntlMiddleware = createMiddleware(routing);

// ── Rutas del portal (requieren autenticación) ────────────────────────────────
const PROTECTED_PORTAL = ["/admin", "/pedidos", "/facturas"];

function isPortalRoute(pathname: string) {
  return PROTECTED_PORTAL.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

// ── CSP con nonce por request ──────────────────────────────────────────────────
// Reemplaza 'unsafe-inline' en script-src: cada script inline debe llevar el
// nonce exacto de este request (ver GTM.tsx, MetaPixel.tsx, JsonLd.tsx,
// app/layout.tsx). 'unsafe-eval' solo en dev, lo necesita el HMR de Turbopack.
function buildCsp(nonce: string, isDev: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://js.stripe.com https://checkout.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // https://www.google.es/ads/ga-audiences is Google's own remarketing/audience
    // beacon (Google Ads Linking / Google Signals, configured in the GA4 property
    // admin panel — not in this repo's code, no gtag() call exists here; every
    // event goes through dataLayer.push(), see providers/ga4.ts). Confirmed via
    // real production Tag Assistant capture, img-src only (1x1 pixel GET).
    "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com https://www.facebook.com https://www.google.es",
    // https://stats.g.doubleclick.net/g/collect is the same Google Ads Linking /
    // Google Signals feature as the img-src entry above, just over its
    // connect-src (fetch/beacon) transport instead of an img pixel. Same
    // origin/verdict: Google's own product behavior from the GA4 property
    // config, not this repo's code.
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://api.stripe.com https://checkout.stripe.com https://stats.g.doubleclick.net",
    // https://www.facebook.com here (not connect.facebook.net) is fbevents.js's
    // own fallback transport for environments where its default img/fetch beacon
    // to facebook.com/tr is unavailable (e.g. third-party cookies blocked) — an
    // invisible iframe for cross-domain matching, and occasionally a hidden-form
    // POST. Our own code never creates a facebook.com iframe or <form> (the
    // noscript pixel is an <img>, covered by img-src); this is Meta's official
    // Pixel script itself needing it, not a bug in our implementation.
    "frame-src https://www.googletagmanager.com https://js.stripe.com https://checkout.stripe.com https://www.facebook.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com https://www.facebook.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

// ── Middleware unificado ──────────────────────────────────────────────────────
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  function withCsp(response: NextResponse) {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // /login es público — no necesita auth ni locale
  if (pathname.startsWith("/login")) {
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Rutas del portal: verificar sesión Supabase
  if (isPortalRoute(pathname)) {
    let response = NextResponse.next({ request: { headers: requestHeaders } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request: { headers: requestHeaders } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return withCsp(NextResponse.redirect(new URL("/login", request.url)));
    }

    return withCsp(response);
  }

  // Rutas públicas de la tienda: next-intl gestiona el locale (ES/PT).
  // Le pasamos un request clonado con x-nonce ya seteado — next-intl arma su
  // propia NextResponse.next() a partir de este request, así que el header
  // viaja igual hasta los Server Components (headers() en app/layout.tsx).
  const nonceRequest = new NextRequest(request, { headers: requestHeaders });
  const intlResponse = nextIntlMiddleware(nonceRequest);
  return withCsp(intlResponse);
}

export const config = {
  matcher: [
    // Activa el middleware para todas las rutas excepto:
    // - API routes
    // - Static files (_next, assets)
    // - Archivos con extensión (favicon, robots, sitemap)
    // - Rutas de metadata de Next.js (icon, apple-icon, favicon, manifest)
    "/((?!api|_next|_vercel|icon|apple-icon|favicon.*|manifest.*|.*\\..*).*)",
  ],
};
