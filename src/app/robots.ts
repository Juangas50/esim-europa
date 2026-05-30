import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://esimruta34.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/es/", "/pt/"],
        disallow: [
          "/es/compra",
          "/pt/compra",
          "/es/confirmacion",
          "/pt/confirmacion",
          "/admin",
          "/login",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
