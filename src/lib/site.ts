// Dominio canónico único del sitio. Hardcodeado a propósito — nunca debe
// derivar de env vars ni del VERCEL_URL que Vercel inyecta automáticamente
// en cada deploy, porque eso es justamente lo que filtró el dominio
// *.vercel.app a Google en canonicals, sitemap, robots.txt y Open Graph.
export const SITE_URL = "https://www.esimruta34.com";
