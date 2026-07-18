import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans-server";
import { sendEmail } from "@/lib/email/send";
import { emailConfirmacionB2C, emailNuevoPedidoAdmin } from "@/lib/email/templates";
import { generateOrderRef } from "@/lib/utils";
import { sendMetaCapiEvent } from "@/lib/meta/capi";
import { buildPurchasePayload } from "@/lib/meta/events";

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

    // Idempotency: el UPDATE solo afecta la fila si aún está en pending_payment.
    // Si ya fue procesado (paid / qr_sent), no rows → data es null → early return.
    // Una sola query elimina la race condition de SELECT+UPDATE separados.
    const { data: order } = await supabase
      .from("b2c_orders")
      .update({
        status: "paid",
        payment_id: session.payment_intent as string,
      })
      .eq("order_ref", orderRef)
      .eq("status", "pending_payment")
      .select()
      .single();

    if (!order) {
      console.log("[webhook] Already processed, skipping duplicate:", orderRef);
      return NextResponse.json({ received: true, skipped: "already_processed" });
    }

    // 1b. Crear órdenes adicionales si quantity > 1 (compra grupal)
    const quantity = Math.min(parseInt(session.metadata?.quantity ?? "1", 10) || 1, 10);
    if (quantity > 1) {
      const extras = Array.from({ length: quantity - 1 }, () => ({
        order_ref: generateOrderRef(),
        tariff_id: order.tariff_id,
        customer_name: order.customer_name,
        customer_lastname: order.customer_lastname,
        customer_email: order.customer_email,
        customer_country: order.customer_country,
        activation_date: order.activation_date,
        status: "paid",
        payment_method: order.payment_method,
        payment_id: session.payment_intent as string,
        amount_usd: order.amount_usd,
      }));
      const { error: extrasError } = await supabase.from("b2c_orders").insert(extras);
      if (extrasError) {
        // El pago ya se cobró y Stripe ya recibirá 200 de este webhook (no reintentará),
        // así que un fallo acá pierde silenciosamente pedidos ya pagados si no se alerta.
        console.error(
          `[webhook] FALLO creando ${quantity - 1} órdenes adicionales para compra grupal | ref: ${orderRef} | payment_intent: ${session.payment_intent}`,
          extrasError,
        );
        const alertEmails = (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean);
        if (alertEmails.length > 0) {
          await Promise.all(alertEmails.map(email => sendEmail(
            email.trim(),
            `⚠️ Fallo creando pedidos extra — ${orderRef}`,
            `<p>El cliente pagó <strong>${quantity} eSIMs</strong> pero solo se creó el pedido original.</p>
             <p>Faltan <strong>${quantity - 1}</strong> pedido(s) por crear manualmente en <code>b2c_orders</code>.</p>
             <p>order_ref: ${orderRef}<br/>payment_intent: ${session.payment_intent}</p>
             <p>Error: <code>${extrasError.message}</code></p>`,
          ))).catch(e => console.error("[webhook] Falló también el email de alerta:", e));
        }
      } else {
        console.log(`[webhook] Creadas ${quantity - 1} órdenes adicionales para compra grupal | ref: ${orderRef}`);
      }
    }

    // 2. Enviar emails
    const plan = await getPlanById(planId);
    const baseUrl = "https://www.esimruta34.com";

    // 2a. Alerta al admin — fuera del if(plan) para que siempre dispare
    try {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean);
      console.log("[email:admin] ADMIN_EMAILS configurados:", adminEmails.length, "| orderRef:", orderRef);
      if (adminEmails.length === 0) {
        console.warn("[email:admin] ADMIN_EMAILS vacío — revisar variable de entorno en Vercel");
      } else {
        const tmplAdmin = emailNuevoPedidoAdmin({
          customerName: order.customer_name,
          customerLastname: order.customer_lastname ?? "",
          customerEmail: order.customer_email,
          customerCountry: order.customer_country ?? "",
          orderRef,
          planName: plan?.name ?? planId,
          planGB: plan?.data_gb ?? 0,
          amountUSD: order.amount_usd ?? 0,
          portalUrl: `${baseUrl}/admin/pedidos`,
        });
        const results = await Promise.all(
          adminEmails.map(email => sendEmail(email.trim(), tmplAdmin.subject, tmplAdmin.html))
        );
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          console.error("[email:admin] Error al enviar:", errors.map(r => r.error));
        } else {
          console.log("[email:admin] alerta enviada a", adminEmails.length, "destinatario(s) | orderRef:", orderRef);
        }
      }
    } catch (e) {
      console.error("[email:admin] Excepción:", e);
    }

    // 2b. Email al cliente — confirmación de pedido recibido
    if (plan && order.customer_email) {
      try {
        const tmplCliente = emailConfirmacionB2C({
          customerName: order.customer_name,
          orderRef,
          planName: plan.name,
          planGB: plan.data_gb,
          planDays: plan.duration_days,
          planType: plan.type,
          amountUSD: plan.price_usd,
        });
        const res = await sendEmail(order.customer_email, tmplCliente.subject, tmplCliente.html);
        console.log("[email:cliente] confirmacion enviada | orderRef:", orderRef, "| error:", res.error ?? "none");
      } catch (e) {
        console.error("[email:cliente] Error:", e);
      }
    } else {
      console.warn("[email:cliente] plan no encontrado para planId:", planId, "| email:", order.customer_email);
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

    // 4. Meta Conversions API — purchase event (server-side, fuente autoritativa).
    // Usa el mismo event_id que el Pixel generó en AddPaymentInfo (checkout/route.ts
    // lo pasó por metadata) para que Meta deduplique con el Purchase del Pixel
    // que se dispara en /confirmacion.
    const metaEventId = session.metadata?.meta_event_id;

    if (metaEventId && plan) {
      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId: metaEventId,
        eventSourceUrl: `${baseUrl}/confirmacion`,
        customData: buildPurchasePayload(
          { id: planId, name: plan.name, price_usd: plan.price_usd },
          quantity,
          orderRef
        ),
        userData: {
          fbp: session.metadata?.fbp,
          fbc: session.metadata?.fbc,
          client_ip_address: session.metadata?.client_ip_address,
          client_user_agent: session.metadata?.client_user_agent,
          em: order.customer_email,
        },
      });
    } else {
      console.warn("[meta-capi] Skipping Purchase — no meta_event_id in Stripe metadata for order:", orderRef);
    }
  }

  return NextResponse.json({ received: true });
}
