import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const locales = ["es", "pt"] as const;

// Rutas públicas indexables (excluye compra, confirmacion, reprogramar,
// cookies [noindex], admin, login)
const publicRoutes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/sobre", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinos", priority: 0.8, changeFrequency: "weekly" },
  { path: "/compatibility", priority: 0.6, changeFrequency: "monthly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/terminos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacidad", priority: 0.7, changeFrequency: "monthly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    // Entrada canónica con alternates para hreflang
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${SITE_URL}/${locale}${route.path}`;
    }

    // Una entrada por locale (ES es el canónico / x-default)
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            ...alternates,
            "x-default": `${SITE_URL}/es${route.path}`,
          },
        },
      });
    }
  }

  return entries;
}
