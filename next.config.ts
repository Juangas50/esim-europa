import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

// ── Security headers ──────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevents clickjacking — never embed in iframes
  { key: "X-Frame-Options", value: "DENY" },
  // Stops MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Forces HTTPS for 2 years (includeSubDomains)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Minimal referrer — don't leak URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // CSP: allow GTM/GA4, Stripe, Resend; block everything else
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + GTM/GA4 + Stripe — unsafe-eval only in dev (React/Turbopack needs it)
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://checkout.stripe.com`,
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Unsplash + GA pixel
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
      // Connect: API calls — self + Supabase + GA + Stripe
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://api.stripe.com https://checkout.stripe.com",
      // Iframes: GTM noscript + Stripe checkout
      "frame-src https://www.googletagmanager.com https://js.stripe.com https://checkout.stripe.com",
      // Block all object/embed
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ── Turbopack root (silencia warning de lockfiles múltiples) ────────────────
  turbopack: {
    root: __dirname,
  },

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // ── Security headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      // Aplicar a todas las rutas
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Rutas del portal: no indexar en buscadores
      {
        source: "/(admin|pedidos|facturas|login)(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
