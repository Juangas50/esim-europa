import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "pt"],
  defaultLocale: "es",
  // Secure explícito: el sitio siempre corre bajo HTTPS (HSTS lo fuerza),
  // pero sin este flag la cookie viajaría técnicamente elegible para HTTP.
  localeCookie: {
    secure: true,
    sameSite: "lax",
  },
});
