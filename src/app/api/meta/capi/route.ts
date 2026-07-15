import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta/capi";
import type { MetaCustomData, MetaEventName } from "@/lib/meta/events";

const VALID_EVENTS: MetaEventName[] = [
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
];

interface CapiRequestBody {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  custom_data?: MetaCustomData;
  user_data?: { fbp?: string; fbc?: string };
}

/**
 * Espejo server-side de los eventos que el Pixel dispara en el browser.
 * El cliente (hooks/useMetaEvents.ts) llama a este endpoint con el mismo
 * event_id que usó para fbq(), así Meta deduplica ambas señales.
 *
 * Purchase NO llega por acá — ese evento server-side lo manda directamente
 * el webhook de Stripe (fuente autoritativa del pago), no un fetch del cliente.
 */
export async function POST(req: NextRequest) {
  // Defensa en profundidad: aunque el cliente ya chequea consentimiento antes
  // de llamar, no confiamos ciegamente — si no hay cookie de consentimiento
  // aceptado, no se procesa nada.
  const consent = req.cookies.get("ruta34_cookie_consent")?.value;
  if (consent !== "accepted") {
    return NextResponse.json({ skipped: "no_consent" });
  }

  let body: CapiRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.event_name || !VALID_EVENTS.includes(body.event_name as MetaEventName)) {
    return NextResponse.json({ error: "event_name inválido" }, { status: 400 });
  }
  if (!body.event_id || typeof body.event_id !== "string") {
    return NextResponse.json({ error: "event_id requerido" }, { status: 400 });
  }
  if (body.event_name === "Purchase") {
    // Purchase solo se acepta desde el webhook de Stripe, nunca desde el cliente.
    return NextResponse.json({ error: "Purchase no se acepta por este endpoint" }, { status: 400 });
  }

  const clientIpAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  const clientUserAgent = req.headers.get("user-agent") ?? undefined;

  await sendMetaCapiEvent({
    eventName: body.event_name as MetaEventName,
    eventId: body.event_id,
    eventSourceUrl: body.event_source_url,
    customData: body.custom_data,
    userData: {
      fbp: body.user_data?.fbp,
      fbc: body.user_data?.fbc,
      client_ip_address: clientIpAddress,
      client_user_agent: clientUserAgent,
    },
  });

  return NextResponse.json({ received: true });
}
