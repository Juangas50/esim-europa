import { Resend } from "resend";
import { Plan } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendConfirmationParams {
  to: string;
  customerName: string;
  orderRef: string;
  plan: Plan;
  qrPlaceholder?: boolean;
  qrUrl?: string;
}

export async function sendPurchaseConfirmation({
  to,
  customerName,
  orderRef,
  plan,
  qrPlaceholder = true,
  qrUrl,
}: SendConfirmationParams) {
  const firstName = customerName.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu eSIM de RUTA34 Telecom</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#111111;border-radius:16px 16px 0 0;padding:24px 32px;text-align:left;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:#E60000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:white;">34</div>
        <span style="color:white;font-weight:700;font-size:15px;">RUTA34 Telecom</span>
      </div>
    </div>

    <!-- Body -->
    <div style="background:white;border-radius:0 0 16px 16px;padding:32px;border:1px solid rgba(0,0,0,0.06);border-top:none;">

      <h1 style="font-size:22px;font-weight:900;color:#111111;margin:0 0 8px;line-height:1.2;">
        ¡Listo, ${firstName}! Tu eSIM está en camino.
      </h1>
      <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Confirmamos tu compra de <strong>${plan.name}</strong> (${plan.data_gb} GB · ${plan.duration_days} días).
        Tu código QR de activación está abajo.
      </p>

      <!-- Referencia -->
      <div style="background:#F8F8F8;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;">
          Referencia del pedido
        </p>
        <p style="margin:0;font-size:18px;font-weight:900;color:#111111;font-family:monospace;">
          ${orderRef}
        </p>
      </div>

      <!-- QR -->
      <div style="text-align:center;border:2px dashed rgba(0,0,0,0.1);border-radius:16px;padding:32px;margin-bottom:24px;">
        ${
          qrPlaceholder
            ? `<p style="color:#999;font-size:14px;margin:0 0 8px;">El QR de activación se enviará en breve</p>
               <p style="color:#999;font-size:12px;margin:0;">Nuestro equipo lo procesa en las próximas horas.</p>`
            : `<img src="${qrUrl}" alt="QR de activación eSIM" style="width:160px;height:160px;" />`
        }
      </div>

      <!-- Instrucciones -->
      <h2 style="font-size:15px;font-weight:700;color:#111111;margin:0 0 12px;">Cómo activar tu eSIM:</h2>
      <ol style="margin:0 0 24px;padding-left:20px;color:#555555;font-size:14px;line-height:1.8;">
        <li><strong>iPhone:</strong> Ajustes → Datos móviles → Añadir plan de datos</li>
        <li><strong>Android:</strong> Ajustes → Conexiones → Administrador de SIM → Añadir eSIM</li>
        <li>Escaneá el código QR que recibís en este email</li>
        <li>Al aterrizar en Europa, activá la eSIM y a navegar</li>
      </ol>

      <!-- WhatsApp support -->
      <div style="background:#E60000;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:white;font-size:13px;margin:0 0 8px;">¿Necesitás ayuda con la activación?</p>
        <a href="https://wa.me/34600000000" style="color:white;font-weight:700;font-size:14px;text-decoration:none;">
          Escribinos por WhatsApp →
        </a>
      </div>

    </div>

    <p style="text-align:center;color:#bbb;font-size:12px;margin:16px 0 0;">
      RUTA34 Telecom · eSIM para latinoamericanos en Europa<br />
      <a href="https://esimruta34.com" style="color:#bbb;">ruta34.com</a>
    </p>
  </div>
</body>
</html>
`;

  return resend.emails.send({
    from: "RUTA34 Telecom <onboarding@resend.dev>",
    to,
    subject: `¡Tu eSIM está lista! Ref. ${orderRef}`,
    html,
  });
}

export async function sendActivationReminder({
  to,
  customerName,
  orderRef,
  activationDate,
}: {
  to: string;
  customerName: string;
  orderRef: string;
  activationDate: string;
}) {
  const firstName = customerName.split(" ")[0];

  return resend.emails.send({
    from: "RUTA34 Telecom <onboarding@resend.dev>",
    to,
    subject: `Recordatorio: tu eSIM se activa mañana — Ref. ${orderRef}`,
    html: `
      <p>Hola ${firstName},</p>
      <p>Te recordamos que tu eSIM de RUTA34 Telecom está programada para activarse mañana <strong>${activationDate}</strong>.</p>
      <p>Referencia: <strong>${orderRef}</strong></p>
      <p>¿Necesitás ayuda? <a href="https://wa.me/34600000000">Escribinos por WhatsApp</a></p>
      <p>RUTA34 Telecom</p>
    `,
  });
}
