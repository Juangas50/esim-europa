import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ATTRIBUTION_COOKIE, type Attribution } from "@/lib/attribution";

// ── /vicky — colaboración Ruta34 × Victoria Casteluchi ───────────────────────
// URL pública fija (https://www.esimruta34.com/vicky, sin parámetros) para que
// la influencer comparta un link corto. No es una landing propia: fija la
// atribución en una cookie httpOnly (invisible en la URL y para JS del
// cliente — ver src/lib/attribution.ts) y redirige a la home actual, para dar
// contexto de marca antes de pedir el pago.
// src/proxy.ts deja pasar esta ruta sin pasar por next-intl (ver el bypass ahí).
const ATTRIBUTION: Attribution = {
  utm_source: "instagram",
  utm_medium: "influencer",
  utm_campaign: "victoria_niza",
  utm_content: "vicky",
};

export async function GET(req: Request) {
  const target = new URL("/es", req.url);
  const response = NextResponse.redirect(target, 307);

  response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(ATTRIBUTION), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 días — ventana de atribución hasta la compra
  });

  // Conteo de visitas — best effort, nunca debe bloquear ni romper el redirect.
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("campaign_link_visits").insert({
      slug: "vicky",
      ...ATTRIBUTION,
    });
    if (error) console.error("[vicky] Error registrando visita:", error);
  } catch (err) {
    console.error("[vicky] Excepción registrando visita:", err);
  }

  return response;
}
