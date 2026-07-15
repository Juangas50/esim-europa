import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans-server";
import { generateOrderRef } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// ── Rate limiting (in-memory, per serverless instance) ───────────────────────
// For multi-instance protection upgrade to Upstash Redis rate limiter.

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW_MS = 60_000; // 1 minute window
  const MAX_REQ   = 10;     // max 10 checkout requests per IP per minute

  // Clean up expired entries to avoid memory leak
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

// ── Server-side input validation ─────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_COUNTRIES = ["AR","UY","CL","BR","MX","CO","PE","VE","EC","PY","BO","OTHER"];

function validateCheckoutBody(body: unknown): { valid: true; data: CheckoutBody } | { valid: false; error: string } {
  if (!body || typeof body !== "object") return { valid: false, error: "Cuerpo inválido" };
  const b = body as Record<string, unknown>;

  if (typeof b.plan_id !== "string" || b.plan_id.length > 100) return { valid: false, error: "plan_id inválido" };
  if (!["stripe", "mercadopago"].includes(b.payment_method as string)) return { valid: false, error: "Método de pago inválido" };
  if (!["es", "pt"].includes(b.locale as string)) return { valid: false, error: "Locale inválido" };

  const c = b.customer as Record<string, unknown>;
  if (!c || typeof c !== "object") return { valid: false, error: "Datos de cliente inválidos" };
  if (typeof c.name !== "string" || c.name.trim().length < 2 || c.name.length > 80) return { valid: false, error: "Nombre inválido" };
  if (typeof c.lastname !== "string" || c.lastname.trim().length < 2 || c.lastname.length > 80) return { valid: false, error: "Apellido inválido" };
  if (typeof c.email !== "string" || !EMAIL_RE.test(c.email) || c.email.length > 254) return { valid: false, error: "Email inválido" };
  if (typeof c.country !== "string" || !ALLOWED_COUNTRIES.includes(c.country)) return { valid: false, error: "País inválido" };

  // Meta Pixel/CAPI — opcionales, solo viajan si el usuario aceptó cookies
  for (const field of ["meta_event_id", "fbp", "fbc"] as const) {
    if (b[field] !== undefined && (typeof b[field] !== "string" || (b[field] as string).length > 300)) {
      return { valid: false, error: `${field} inválido` };
    }
  }

  return { valid: true, data: b as unknown as CheckoutBody };
}

interface CheckoutBody {
  plan_id: string;
  payment_method: string;
  customer: { name: string; lastname: string; email: string; country: string };
  activation_date?: string;
  locale: string;
  ga_client_id?: string;
  meta_event_id?: string;
  fbp?: string;
  fbc?: string;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intentá en unos minutos." },
      { status: 429 }
    );
  }

  try {
    // Limit body size to 8KB
    const rawBody = await req.text();
    if (rawBody.length > 8192) {
      return NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 });
    }

    let parsedBody: unknown;
    try { parsedBody = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

    const validation = validateCheckoutBody(parsedBody);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
    const { plan_id, payment_method, customer, activation_date, locale, ga_client_id, meta_event_id, fbp, fbc } = validation.data;

    // 1. Validar plan — webOnly:true bloquea planes con web_visible=false aunque alguien manipule la URL
    const plan = await getPlanById(plan_id, { webOnly: true });
    if (!plan) {
      return NextResponse.json({ error: "Plan no disponible" }, { status: 400 });
    }

    // 2. MercadoPago no implementado — retornar antes de crear registros en DB
    if (payment_method === "mercadopago") {
      return NextResponse.json({
        error: "MercadoPago disponible próximamente. Usá tarjeta de crédito.",
      }, { status: 501 });
    }

    // 3. Cantidad de eSIMs (1–10)
    const quantity = Math.min(Math.max(parseInt(String((parsedBody as Record<string, unknown>).quantity ?? "1"), 10) || 1, 1), 10);

    // 4. Generar referencia de pedido
    const orderRef = generateOrderRef();

    // 5. Crear pedido en Supabase (pending_payment) — solo para Stripe
    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from("b2c_orders")
      .insert({
        order_ref: orderRef,
        tariff_id: UUID_RE.test(plan_id) ? plan_id : null,
        customer_name: customer.name,
        customer_lastname: customer.lastname,
        customer_email: customer.email,
        customer_country: customer.country,
        activation_date: activation_date || null,
        status: "pending_payment",
        payment_method,
        amount_usd: plan.price_usd,
      });

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json(
        { error: "Error interno. Intentá nuevamente." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // 6. Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: locale === "pt" ? "pt-BR" : "es",
      line_items: [
        {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(plan.price_usd * 100),
            product_data: {
              name: quantity > 1
                ? `eSIM Plan ${plan.size ?? plan.name} × ${quantity} — RUTA34 Telecom`
                : `eSIM Plan ${plan.size ?? plan.name} — RUTA34 Telecom`,
              description: `${plan.data_gb} GB · ${plan.duration_days} días · Número español incluido · 30+ países`,
            },
          },
        },
      ],
      allow_promotion_codes: true,
      customer_email: customer.email,
      metadata: {
        order_ref: orderRef,
        plan_id,
        quantity: String(quantity),
        customer_country: customer.country,
        ...(ga_client_id ? { ga_client_id } : {}),
        // Meta CAPI — el webhook usa esto para mandar el Purchase server-side
        // con el mismo event_id que ya usó el Pixel al disparar AddPaymentInfo.
        ...(meta_event_id ? { meta_event_id } : {}),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        client_user_agent: (req.headers.get("user-agent") ?? "").slice(0, 400),
        client_ip_address: ip,
      },
      success_url: `${baseUrl}/${locale}/confirmacion?ref=${orderRef}&qty=${quantity}&plan=${plan_id}${meta_event_id ? `&mid=${meta_event_id}` : ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/compra?plan=${plan_id}`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Error interno. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
