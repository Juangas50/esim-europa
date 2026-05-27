import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans-server";
import { generateOrderRef } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan_id, payment_method, customer, activation_date, locale, ga_client_id } = body;

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
