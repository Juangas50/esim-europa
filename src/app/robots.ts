import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Bots de IA a los que se permite explícitamente el crawl completo, en línea
// con la estrategia de visibilidad en respuestas de IA (ver public/llms.txt).
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
];

const DISALLOW = [
  "/es/compra",
  "/pt/compra",
  "/es/confirmacion",
  "/pt/confirmacion",
  "/es/reprogramar",
  "/pt/reprogramar",
  "/admin",
  "/login",
  "/pedidos",
  "/facturas",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: "Googlebot", allow: "/", disallow: DISALLOW },
      { userAgent: "Bingbot", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
