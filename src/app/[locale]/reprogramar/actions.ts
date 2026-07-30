"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { emailFechaReprogramada } from "@/lib/email/templates";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Rate limiting (in-memory, per serverless instance) — mismo patrón que
// src/app/api/checkout/route.ts para el endpoint público de checkout.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW_MS = 60_000;
  const MAX_REQ = 5;

  if (rateLimitStore.size > 5000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQ) return true;
  entry.count++;
  return false;
}

export async function reprogramarActivacion(
  orderRef: string,
  token: string,
  newDate: string
): Promise<{ ok: true; formattedDate: string } | { ok: false; error: string }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return { ok: false, error: "Demasiadas solicitudes. Intentá en unos minutos." };
  }

  if (typeof orderRef !== "string" || orderRef.length === 0 || orderRef.length > 60) {
    return { ok: false, error: "Pedido inválido." };
  }
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    return { ok: false, error: "Link inválido." };
  }
  if (typeof newDate !== "string" || !DATE_RE.test(newDate)) {
    return { ok: false, error: "Fecha inválida." };
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("b2c_orders")
    .select("id, status, created_at, customer_name, customer_email, tariffs(name)")
    .eq("order_ref", orderRef)
    .eq("reschedule_token", token)
    .maybeSingle();

  if (!order) {
    return { ok: false, error: "No encontramos tu pedido. El link puede haber expirado." };
  }
  if (order.status !== "paid") {
    return {
      ok: false,
      error: "Tu eSIM ya fue entregada — para cambios contactanos por WhatsApp.",
    };
  }

  // Comparación lexicográfica de strings YYYY-MM-DD — evita bugs de timezone
  // que aparecen al construir Date() para comparar.
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const maxDate = new Date(new Date(order.created_at).getTime() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  if (newDate < minDate || newDate > maxDate) {
    return { ok: false, error: "La fecha debe estar entre mañana y un año desde tu compra." };
  }

  const { error: updateError } = await supabase
    .from("b2c_orders")
    .update({ activation_date: newDate, reminder_sent_at: null })
    .eq("id", order.id);

  if (updateError) {
    console.error("[reprogramar] Error actualizando fecha:", updateError);
    return { ok: false, error: "Error guardando el cambio. Intentá nuevamente." };
  }

  const formattedDate = new Date(`${newDate}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    const tmpl = emailFechaReprogramada({
      customerName: order.customer_name,
      orderRef,
      planName: (order as { tariffs?: { name?: string } }).tariffs?.name ?? "tu eSIM",
      newActivationDate: formattedDate,
    });
    await sendEmail(order.customer_email, tmpl.subject, tmpl.html);
  } catch (e) {
    console.error("[reprogramar] Error enviando email de confirmación:", e);
  }

  return { ok: true, formattedDate };
}
