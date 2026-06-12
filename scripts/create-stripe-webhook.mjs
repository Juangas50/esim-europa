import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createWebhook() {
  try {
    console.log("🔄 Creando webhook en Stripe...\n");

    const endpoint = await stripe.webhookEndpoints.create({
      url: "https://www.esimruta34.com/api/webhooks/stripe",
      enabled_events: ["checkout.session.completed"],
      api_version: "2026-04-22",
    });

    console.log("✅ Webhook creado exitosamente!\n");
    console.log("📋 Detalles:");
    console.log("   ID:", endpoint.id);
    console.log("   URL:", endpoint.url);
    console.log("   Status:", endpoint.status);
    console.log("   Events:", endpoint.enabled_events.join(", "));

    console.log("\n🔐 SIGNING SECRET (⚠️  GUARDA ESTO):");
    console.log("   " + endpoint.secret);

    console.log("\n📌 Próximo paso:");
    console.log("   1. Ve a Vercel Dashboard");
    console.log("   2. Settings → Environment Variables");
    console.log("   3. Agrega:");
    console.log("      Name: STRIPE_WEBHOOK_SECRET");
    console.log("      Value: " + endpoint.secret);
    console.log("      Environment: Production");
    console.log("   4. Vercel redeploy automáticamente\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createWebhook();
