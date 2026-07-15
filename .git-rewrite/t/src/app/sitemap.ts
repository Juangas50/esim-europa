import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://esimruta34.com";
const locales = ["es", "pt"] as const;

// Rutas públicas indexables (excluye compra, confirmacion, legales)
const publicRoutes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/planes", priority: 0.9, changeFrequency: "weekly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    // Entrada canónica con alternates para hreflang
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${base}/${locale}${route.path}`;
    }

    // Una entrada por locale
    for (const locale of locales) {
      entries.push({
        url: `${base}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
