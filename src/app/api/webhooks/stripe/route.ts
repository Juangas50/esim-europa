import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans-server";
import { sendPurchaseConfirmation } from "@/lib/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderRef = session.metadata?.order_ref;
    const planId = session.metadata?.plan_id;

    if (!orderRef || !planId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Actualizar estado del pedido a "paid"
    const { data: order } = await supabase
      .from("b2c_orders")
      .update({
        status: "paid",
        payment_id: session.payment_intent as string,
      })
      .eq("order_ref", orderRef)
      .select()
      .single();

    if (!order) {
      console.error("Order not found:", orderRef);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Enviar email de confirmación con QR (placeholder hasta API Vodafone)
    const plan = await getPlanById(planId);
    if (plan && order.customer_email) {
      try {
        console.log("[email] Sending confirmation | RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
        const emailResult = await sendPurchaseConfirmation({
          to: order.customer_email,
          customerName: order.customer_name,
          orderRef,
          plan,
          qrPlaceholder: true,
        });
        console.log("[email] Resend result:", JSON.stringify(emailResult));

        // Marcar email como enviado
        await supabase
          .from("b2c_orders")
          .update({ qr_sent_at: new Date().toISOString(), status: "qr_sent" })
          .eq("order_ref", orderRef);
      } catch (emailError) {
        console.error("[email] Error sending confirmation email:", emailError);
      }
    }

    // 3. GA4 Measurement Protocol — purchase event (server-side, survives Stripe redirect)
    const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID;
    const ga4ApiSecret = process.env.GA4_API_SECRET;
    const ga4ClientId = session.metadata?.ga_client_id;

    if (ga4MeasurementId && ga4ApiSecret && ga4ClientId && plan) {
      try {
        const ga4Res = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: ga4ClientId,
              events: [
                {
                  name: "purchase",
                  params: {
                    transaction_id: orderRef,
                    value: plan.price_usd,
                    currency: "USD",
                    items: [
                      {
                        item_id: planId,
                        item_name: `eSIM ${plan.name}`,
                        item_category: plan.type,
                        price: plan.price_usd,
                        quantity: 1,
                      },
                    ],
                  },
                },
              ],
            }),
          }
        );
        console.log("[ga4] Measurement Protocol sent, status:", ga4Res.status, "| order:", orderRef);
      } catch (ga4Error) {
        console.error("[ga4] Error sending purchase event:", ga4Error);
      }
    } else if (!ga4ClientId) {
      console.warn("[ga4] Skipping MP — no ga_client_id in Stripe metadata for order:", orderRef);
    }
  }

  return NextResponse.json({ received: true });
}
