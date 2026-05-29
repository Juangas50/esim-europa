import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const nextIntlMiddleware = createMiddleware(routing);

// ── Rutas del portal (requieren autenticación) ────────────────────────────────
const PROTECTED_PORTAL = ["/admin", "/pedidos", "/facturas"];

function isPortalRoute(pathname: string) {
  return PROTECTED_PORTAL.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

// ── Middleware unificado ──────────────────────────────────────────────────────
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /login es público — no necesita auth ni locale
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Rutas del portal: verificar sesión Supabase
  if (isPortalRoute(pathname)) {
    let response = NextResponse.next({ request });

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
            response = NextResponse.next({ request });
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
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  // Rutas públicas de la tienda: next-intl gestiona el locale (ES/PT)
  return nextIntlMiddleware(request);
}

export const config = {
  matcher: [
    // Activa el middleware para todas las rutas excepto:
    // - API routes
    // - Static files (_next, assets)
    // - Archivos con extensión (favicon, robots, sitemap)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
