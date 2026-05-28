import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans-server";
import { generateOrderRef } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// ── Server-side input validation ─────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  return { valid: true, data: b as unknown as CheckoutBody };
}

interface CheckoutBody {
  plan_id: string;
  payment_method: string;
  customer: { name: string; lastname: string; email: string; country: string };
  activation_date?: string;
  locale: string;
  ga_client_id?: string;
}

export async function POST(req: NextRequest) {
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
    const { plan_id, payment_method, customer, activation_date, locale, ga_client_id } = validation.data;

    // 1. Validar plan (Supabase first, fallback to hardcoded)
    const plan = await getPlanById(plan_id);
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 400 });
    }

    // 2. Generar referencia de pedido
    const orderRef = generateOrderRef();

    // 3. Crear pedido en Supabase (pending_payment)
    const supabase = createAdminClient();
    const { data: order, error: dbError } = await supabase
      .from("b2c_orders")
      .insert({
        order_ref: orderRef,
        tariff_id: null, // Los planes son hardcoded — sin UUID de tariffs por ahora
        customer_name: customer.name,
        customer_lastname: customer.lastname,
        customer_email: customer.email,
        customer_country: customer.country,
        activation_date: activation_date || null,
        status: "pending_payment",
        payment_method,
        amount_usd: plan.price_usd,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase error:", dbError);
      // En desarrollo sin DB configurada, continuamos igual
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // 4a. Stripe Checkout
    if (payment_method === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        locale: locale === "pt" ? "pt-BR" : "es",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(plan.price_usd * 100), // en centavos
              product_data: {
                name: `eSIM ${plan.name} — RUTA34 Telecom`,
                description: `${plan.data_gb} GB · ${plan.duration_days} días · ${plan.countries_count}+ países`,
              },
            },
          },
        ],
        allow_promotion_codes: true,
        customer_email: customer.email,
        metadata: {
          order_ref: orderRef,
          plan_id,
          customer_country: customer.country,
          // GA4 client_id for Measurement Protocol attribution (may be undefined if GA not loaded)
          ...(ga_client_id ? { ga_client_id } : {}),
        },
        success_url: `${baseUrl}/${locale}/confirmacion?ref=${orderRef}&plan=${plan_id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/${locale}/compra?plan=${plan_id}`,
      });

      return NextResponse.json({ url: session.url });
    }

    // 4b. MercadoPago (próximamente)
    if (payment_method === "mercadopago") {
      // TODO: integrar SDK de MercadoPago
      // Por ahora devolvemos un placeholder
      return NextResponse.json({
        error: "MercadoPago disponible próximamente. Usá tarjeta de crédito.",
      }, { status: 501 });
    }

    return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });

  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Error interno. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
