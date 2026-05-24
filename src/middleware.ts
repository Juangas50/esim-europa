import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Activa el middleware para todas las rutas excepto:
    // - API routes
    // - Static files (_next, assets)
    // - Archivos con extensión (favicon, robots, sitemap)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
