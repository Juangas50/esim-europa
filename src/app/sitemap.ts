import { MetadataRoute } from "next";

const rawBase = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
const base = rawBase.includes("vercel.app") ? "https://www.esimruta34.com" : rawBase;
const locales = ["es", "pt"] as const;

// Rutas públicas indexables (excluye compra, confirmacion, admin, login)
const publicRoutes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/planes", priority: 0.9, changeFrequency: "weekly" },
  { path: "/terminos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacidad", priority: 0.7, changeFrequency: "monthly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    // Entrada canónica con alternates para hreflang
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${base}/${locale}${route.path}`;
    }

    // Una entrada por locale (ES es el canónico / x-default)
    for (const locale of locales) {
      entries.push({
        url: `${base}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            ...alternates,
            "x-default": `${base}/es${route.path}`,
          },
        },
      });
    }
  }

  return entries;
}
