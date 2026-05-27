import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans";
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
    const plan = getPlanById(planId);
    if (plan && order.customer_email) {
      try {
        console.log("[email] Sending to:", order.customer_email, "| RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
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
  }

  return NextResponse.json({ received: true });
}
