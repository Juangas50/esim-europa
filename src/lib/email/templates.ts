export function emailConfirmacionPartner(data: {
  orderRef: string
  sellerName: string
  customerName: string
  customerLastname: string
  tariffName: string
  type: string
  activationDate: string | null
}) {
  const isScheduled = !!data.activationDate
  const isDataOnly = data.type === 'dataonly'

  return {
    subject: `Pedido ${data.orderRef} recibido — RUTA34 Telecom`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#C9973A;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:22px;font-weight:800;margin-bottom:8px;">✅ Pedido recibido</div>
      <div style="color:#7A7A7A;font-size:14px;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.sellerName}</strong>, tu pedido fue registrado correctamente.
      </div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Detalle del pedido</div>

      ${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
      ${row('Cliente', `${data.customerName} ${data.customerLastname}`)}
      ${row('Tarifa', data.tariffName)}
      ${row('Tipo', data.type === 'prepago' ? 'eSIM Prepago' : 'eSIM DataOnly')}
      ${row('Activación', isDataOnly ? 'El cliente activa cuando quiera (60 días)' : isScheduled ? `Programada para el ${data.activationDate}` : 'Inmediata — el equipo RUTA34 la procesa hoy')}
    </div>

    ${isScheduled ? `
    <div style="background:rgba(201,151,58,0.08);border:1px solid rgba(201,151,58,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      📆 <strong style="color:#fff;">Activación programada.</strong> El cliente recibirá un email de aviso ahora. El QR se envía el ${data.activationDate}.
    </div>` : ''}

    ${isDataOnly ? `
    <div style="background:rgba(201,151,58,0.08);border:1px solid rgba(201,151,58,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      📡 <strong style="color:#fff;">eSIM DataOnly.</strong> El cliente tiene 60 días para activar el QR. El plan no empieza hasta que lo escanee.
    </div>` : ''}

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · Portal de Partners<br>
      <span style="color:#C9973A;">ruta34telecom.com</span>
    </div>
  </div>
</body>
</html>`
  }
}

export function emailAvisoClienteProgramado(data: {
  customerName: string
  tariffName: string
  activationDate: string
  type: string
}) {
  return {
    subject: `Tu eSIM está confirmada — la recibirás el ${data.activationDate}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1B2F4E;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="margin-bottom:40px;text-align:center;">
      <div style="font-size:32px;font-weight:900;letter-spacing:-1px;">
        <span style="color:#1B2F4E;">RUTA</span><span style="color:#C9973A;">34</span>
      </div>
      <div style="font-size:11px;letter-spacing:2px;color:#999;margin-top:4px;text-transform:uppercase;font-weight:600;">Telecom</div>
    </div>

    <!-- HERO -->
    <div style="background:#1B2F4E;border-radius:20px;padding:40px 32px;margin-bottom:24px;text-align:center;color:#fff;">
      <div style="font-size:48px;margin-bottom:12px;">📅</div>
      <div style="font-size:28px;font-weight:900;margin-bottom:8px;letter-spacing:-0.5px;">Activación programada</div>
      <div style="font-size:16px;color:#AAAAAA;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, tu eSIM está confirmada y lista.
      </div>
    </div>

    <!-- PLAN DETAILS -->
    <div style="background:#fff;border:1px solid #E5E5E5;border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;letter-spacing:1px;color:#999;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Tu plan</div>
        <div style="font-size:24px;font-weight:900;color:#1B2F4E;">${data.tariffName}</div>
      </div>
      <div style="border-top:1px solid #E5E5E5;padding-top:24px;space:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
          <span style="color:#666;">Tipo</span>
          <strong style="color:#1B2F4E;">${data.type === 'prepago' ? '28 días desde activación' : 'DataOnly • 60 días'}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;">
          <span style="color:#666;">Recibirás tu QR</span>
          <strong style="color:#C9973A;font-size:16px;">${data.activationDate}</strong>
        </div>
      </div>
    </div>

    <!-- TIMELINE -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;letter-spacing:1px;color:#999;text-transform:uppercase;font-weight:700;margin-bottom:20px;">Cronograma</div>
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:900;font-size:14px;">✓</div>
        <div>
          <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">Compra confirmada</div>
          <div style="font-size:14px;color:#666;">Tu pedido está registrado y listo.</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:900;font-size:14px;">→</div>
        <div>
          <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">El ${data.activationDate}</div>
          <div style="font-size:14px;color:#666;">Recibirás el código QR por email para instalar tu eSIM.</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;">
        <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:900;font-size:14px;">3</div>
        <div>
          <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">Activá cuando llegues</div>
          <div style="font-size:14px;color:#666;">El plan comienza a correr desde que activás la eSIM. Instalá cuando llegues a Europa.</div>
        </div>
      </div>
    </div>

    <!-- IMPORTANT -->
    <div style="background:rgba(201,151,58,0.06);border:1px solid rgba(201,151,58,0.2);border-radius:12px;padding:20px;margin-bottom:24px;font-size:14px;color:#666;line-height:1.7;">
      <strong style="color:#1B2F4E;display:block;margin-bottom:12px;">Recordatorio importante</strong>
      El plan comienza a correr desde el momento de la activación. Te recomendamos instalar la eSIM cuando llegues a Europa para aprovechar todos los días.
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}" style="display:inline-block;background:#C9973A;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;line-height:1;">
        Pregunta sobre tu plan
      </a>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #E5E5E5;font-size:12px;color:#999;">
      <div style="margin-bottom:8px;">RUTA34 Telecom</div>
      <a href="https://esimruta34.com" style="color:#C9973A;text-decoration:none;font-weight:600;">esimruta34.com</a>
    </div>

  </div>
</body>
</html>`
  }
}

export function emailAlertaAdmin(data: {
  pendingReview: any[]
  scheduledToday: any[]
  date: string
}) {
  const totalAlertas = data.pendingReview.length + data.scheduledToday.length

  return {
    subject: `⚠️ RUTA34 — ${totalAlertas} acción(es) pendiente(s) para hoy`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#C9973A;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM · ALERTA DIARIA</div>
    </div>

    <div style="background:rgba(230,0,0,0.08);border:1px solid rgba(230,0,0,0.3);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:800;margin-bottom:6px;">⚠️ ${totalAlertas} acción(es) pendiente(s)</div>
      <div style="color:#7A7A7A;font-size:13px;">${data.date}</div>
    </div>

    ${data.pendingReview.length > 0 ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
        📋 Pedidos esperando revisión (${data.pendingReview.length})
      </div>
      ${data.pendingReview.map(o => `
      <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:10px;padding:14px 18px;margin-bottom:8px;display:flex;justify-content:space-between;">
        <div>
          <div style="font-weight:700;font-size:13px;">${o.customer_name} ${o.customer_lastname}</div>
          <div style="color:#7A7A7A;font-size:12px;margin-top:3px;">${o.order_ref} · ${o.agencies?.name || ''}</div>
        </div>
        <div style="color:#F59E0B;font-size:12px;font-weight:700;">Pendiente</div>
      </div>`).join('')}
    </div>` : ''}

    ${data.scheduledToday.length > 0 ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
        🔔 Activaciones programadas para hoy (${data.scheduledToday.length})
      </div>
      ${data.scheduledToday.map(o => `
      <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:10px;padding:14px 18px;margin-bottom:8px;">
        <div style="font-weight:700;font-size:13px;">${o.customer_name} ${o.customer_lastname}</div>
        <div style="color:#7A7A7A;font-size:12px;margin-top:3px;">${o.order_ref} · ${o.tariffs?.name || ''} · ${o.customer_email}</div>
      </div>`).join('')}
    </div>` : ''}

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos"
        style="background:#C9973A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:700;font-size:14px;display:inline-block;">
        Gestionar pedidos →
      </a>
    </div>

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · Alerta automática diaria
    </div>
  </div>
</body>
</html>`
  }
}

// ── B2C: Confirmación de pedido (se envía inmediatamente tras el pago) ─────────
export function emailConfirmacionB2C(data: {
  customerName: string
  orderRef: string
  planName: string
  planGB: number
  planDays: number
  planType: 'local' | 'dataonly' | string
  amountUSD: number
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const activationNote = isLocal
    ? 'Los 28 días comienzan cuando activás la eSIM — podés instalarla antes de salir y activarla al llegar a Europa.'
    : 'Tenés 60 días desde la compra para activar la eSIM. El plan corre desde que la activás.'

  return {
    subject: `Tu compra está confirmada — recibirás tu eSIM en 24 horas`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1B2F4E;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="margin-bottom:40px;text-align:center;">
      <div style="font-size:32px;font-weight:900;letter-spacing:-1px;">
        <span style="color:#1B2F4E;">RUTA</span><span style="color:#C9973A;">34</span>
      </div>
      <div style="font-size:11px;letter-spacing:2px;color:#999;margin-top:4px;text-transform:uppercase;font-weight:600;">Telecom</div>
    </div>

    <!-- HERO -->
    <div style="background:#1B2F4E;border-radius:20px;padding:40px 32px;margin-bottom:24px;text-align:center;color:#fff;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <div style="font-size:28px;font-weight:900;margin-bottom:8px;letter-spacing:-0.5px;">Compra confirmada</div>
      <div style="font-size:16px;color:#AAAAAA;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, tu viaje a Europa está casi listo.
      </div>
    </div>

    <!-- ORDER SUMMARY -->
    <div style="background:#fff;border:1px solid #E5E5E5;border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="font-size:12px;letter-spacing:1px;color:#999;text-transform:uppercase;font-weight:700;margin-bottom:20px;">Tu plan</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px;">
        <div>
          <div style="font-size:24px;font-weight:900;color:#1B2F4E;margin-bottom:4px;">${data.planName}</div>
          <div style="font-size:14px;color:#999;">${data.planGB} GB • ${data.planDays} días</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:28px;font-weight:900;color:#C9973A;">USD ${data.amountUSD.toFixed(2)}</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">pago único</div>
        </div>
      </div>
      <div style="border-top:1px solid #E5E5E5;padding-top:20px;display:flex;justify-content:space-between;font-size:13px;color:#666;">
        <span>Referencia de pedido</span>
        <span style="font-family:monospace;font-weight:700;color:#1B2F4E;">${data.orderRef}</span>
      </div>
    </div>

    <!-- TIMELINE -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;letter-spacing:1px;color:#999;text-transform:uppercase;font-weight:700;margin-bottom:20px;">Lo que viene ahora</div>
      <table role="presentation" style="width:100%;margin-bottom:16px;border-collapse:collapse;">
        <tr>
          <td style="width:40px;padding-right:12px;text-align:center;vertical-align:top;">
            <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;color:#fff;font-weight:900;font-size:14px;line-height:32px;text-align:center;display:inline-block;">1</div>
          </td>
          <td style="vertical-align:top;padding-bottom:16px;">
            <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">Preparamos tu eSIM</div>
            <div style="font-size:14px;color:#666;line-height:1.5;">En los próximos minutos verificamos tu compra. Operamos de 8:00 a 21:00 (España).</div>
          </td>
        </tr>
      </table>
      <table role="presentation" style="width:100%;margin-bottom:16px;border-collapse:collapse;">
        <tr>
          <td style="width:40px;padding-right:12px;text-align:center;vertical-align:top;">
            <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;color:#fff;font-weight:900;font-size:14px;line-height:32px;text-align:center;display:inline-block;">2</div>
          </td>
          <td style="vertical-align:top;padding-bottom:16px;">
            <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">Recibirás tu QR por email</div>
            <div style="font-size:14px;color:#666;line-height:1.5;">En menos de 24 horas recibirás el código QR para instalar tu eSIM.</div>
          </td>
        </tr>
      </table>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:40px;padding-right:12px;text-align:center;vertical-align:top;">
            <div style="width:32px;height:32px;background:#C9973A;border-radius:50%;color:#fff;font-weight:900;font-size:14px;line-height:32px;text-align:center;display:inline-block;">3</div>
          </td>
          <td style="vertical-align:top;">
            <div style="font-weight:700;color:#1B2F4E;margin-bottom:4px;">Activá cuando llegues</div>
            <div style="font-size:14px;color:#666;line-height:1.5;">${activationNote}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- PREP INFO -->
    <div style="background:rgba(201,151,58,0.06);border:1px solid rgba(201,151,58,0.2);border-radius:12px;padding:20px;margin-bottom:24px;font-size:14px;color:#666;line-height:1.7;">
      <strong style="color:#1B2F4E;display:block;margin-bottom:12px;">Antes de instalar tu eSIM</strong>
      • Asegurate que tu celular sea compatible (Settings → General → About → eSIM)<br>
      • Necesitarás WiFi para instalarlo (no internet de datos)<br>
      • Guardá este email — contiene datos importantes
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}" style="display:inline-block;background:#C9973A;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;line-height:1;">
        Escribinos por WhatsApp
      </a>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #E5E5E5;font-size:12px;color:#999;">
      <div style="margin-bottom:8px;">RUTA34 Telecom</div>
      <a href="https://esimruta34.com" style="color:#C9973A;text-decoration:none;font-weight:600;">esimruta34.com</a>
    </div>

  </div>
</body>
</html>`,
  }
}

// ── Admin: Alerta inmediata por cada nuevo pedido B2C ─────────────────────────
export function emailNuevoPedidoAdmin(data: {
  customerName: string
  customerLastname: string
  customerEmail: string
  customerCountry: string
  orderRef: string
  planName: string
  planGB: number
  amountUSD: number
  portalUrl: string
}) {
  return {
    subject: `⚡ Nuevo pedido B2C — ${data.customerName} ${data.customerLastname} · ${data.planName} · USD ${data.amountUSD.toFixed(2)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">

    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:900;">RUTA</span><span style="font-size:24px;font-weight:900;color:#C9973A;">34</span>
      <span style="font-size:10px;letter-spacing:4px;color:#7A7A7A;margin-left:8px;">ADMIN ALERT</span>
    </div>

    <div style="background:rgba(230,0,0,0.12);border:1px solid rgba(230,0,0,0.35);border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;margin-bottom:4px;">⚡ Nuevo pedido — tramitar</div>
      <div style="color:#7A7A7A;font-size:12px;">Recibido ahora · Canal web</div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      ${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
      ${row('Cliente', `${data.customerName} ${data.customerLastname}`)}
      ${row('Email', `<a href="mailto:${data.customerEmail}" style="color:#C9973A;">${data.customerEmail}</a>`)}
      ${row('País', data.customerCountry)}
      ${row('Plan', data.planName)}
      ${row('GB', `${data.planGB} GB`)}
      ${row('Importe', `<strong style="color:#22C55E;">USD ${data.amountUSD.toFixed(2)}</strong>`)}
    </div>

    <div style="text-align:center;">
      <a href="${data.portalUrl}"
        style="display:inline-block;background:#C9973A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;">
        Tramitar en el portal →
      </a>
    </div>

    <div style="color:#555;font-size:11px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · Alerta automática por pedido
    </div>
  </div>
</body>
</html>`,
  }
}

// ── B2C: Entrega de eSIM con QR embebido ──────────────────────────────────────
export function emailEntregaB2C(data: {
  customerName: string
  orderRef: string
  planName: string
  planGB: number
  planDays: number
  planType: 'local' | 'dataonly' | string
  activationString: string
  confirmationCode: string
  amountUSD: number
  qrUrl?: string
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const deliveryMessage = isLocal
    ? 'Tu eSIM para viajar por Europa está lista. Escaneá el QR cuando aterrices.'
    : 'Tu eSIM está lista para activar en cualquier momento dentro de los próximos 60 días.'

  return {
    subject: `Tu eSIM RUTA34 está confirmada — ${data.orderRef}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Tu eSIM está lista</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">Orden ${data.orderRef}</p><p class="p">${deliveryMessage}</p></div></td></tr>
${qrBlock(data.qrUrl ?? 'cid:esim-qr', data.confirmationCode, data.activationString)}
${orderSummaryBlock(data.planName, data.planGB, data.planDays, data.amountUSD)}
${supportBlock()}
${premiumFooter()}`
  }
}

function step(n: number, text: string) {
  return `
  <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
    <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#C9973A;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1;padding-top:1px;">${n}</span>
    <span style="font-size:13px;color:#AAAAAA;line-height:1.5;">${text}</span>
  </div>`
}

function row(label: string, value: string) {
  return `
  <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;">
    <span style="color:#7A7A7A;">${label}</span>
    <span style="font-weight:600;text-align:right;">${value}</span>
  </div>`
}

// ── PREMIUM EMAIL HELPERS (for warm-white, Georgia serif, gold buttons) ────────

function premiumEmailStyles() {
  return `<style>body{margin:0;padding:0;background:#FAF7F2;color:#1B2F4E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;}table{border-collapse:collapse;}img{border:0;outline:none;text-decoration:none;display:block;}.container{width:100%;max-width:680px;margin:0 auto;}.card{background:#FFFFFF;border:1px solid #E9E2D8;border-radius:28px;overflow:hidden;}.section{padding:32px;}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;font-weight:700;}.h1{font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.08;font-weight:400;color:#1B2F4E;margin:10px 0 14px;}.h2{font-size:22px;line-height:1.25;font-weight:800;color:#1B2F4E;margin:0 0 12px;}.p{font-size:16px;line-height:1.65;color:#555555;margin:0;}.muted{color:#8A8A8A;font-size:14px;line-height:1.5;}.button{display:inline-block;background:#C9973A;color:#1B2F4E;text-decoration:none;padding:15px 22px;border-radius:14px;font-weight:800;font-size:15px;}.button-secondary{display:inline-block;background:#FFFFFF;color:#1B2F4E;text-decoration:none;padding:14px 20px;border-radius:14px;border:1px solid #E9E2D8;font-weight:700;font-size:15px;}.divider{height:1px;background:#E9E2D8;line-height:1px;font-size:1px;}.summary-row td{padding:8px 0;font-size:15px;}.summary-label{color:#8A8A8A;}.summary-value{color:#1B2F4E;font-weight:800;text-align:right;}@media only screen and (max-width:600px){.section{padding:24px!important;}.h1{font-size:32px!important;}.h2{font-size:20px!important;}.button,.button-secondary{display:block!important;text-align:center!important;}}</style>`
}

function premiumHeader() {
  return `<table role="presentation" width="100%" style="background:#FAF7F2;padding:28px 12px;"><tr><td align="center"><table role="presentation" class="container" width="100%"><tr><td style="padding:0 0 18px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#1B2F4E;letter-spacing:-0.03em;">Ruta34</div></td></tr>`
}

function premiumFooter() {
  return `<tr><td style="padding:24px 20px;text-align:center;"><p class="muted" style="margin:0 0 8px;">Ruta34 · Conectividad para viajar por España y Europa</p><p class="muted" style="margin:0;">¿Necesitás ayuda? <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}" style="color:#1B2F4E;font-weight:700;text-decoration:none;">Escribinos por WhatsApp</a></p></td></tr></table></td></tr></table></body></html>`
}

function qrBlock(qrUrl: string, confirmationCode: string, activationString: string) {
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section" style="text-align:center;"><div style="display:inline-block;background:#FFFFFF;border:1px solid #E9E2D8;border-radius:24px;padding:18px;"><img src="${qrUrl}" alt="QR de instalación eSIM" width="220" height="220" style="width:220px;height:220px;margin:0 auto;border-radius:8px;" /></div><div style="height:18px;"></div><p class="muted">Código: <strong style="color:#1B2F4E;">${confirmationCode}</strong></p><div style="height:8px;"></div><p class="muted" style="font-family:monospace;word-break:break-all;">${activationString}</p></div></td></tr>`
}

function orderSummaryBlock(planName: string, planGB: number, planDays: number, amountUSD: number) {
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section"><h2 class="h2">Resumen de tu compra</h2><table role="presentation" width="100%"><tr class="summary-row"><td class="summary-label">Plan</td><td class="summary-value">${planName}</td></tr><tr class="summary-row"><td class="summary-label">Datos</td><td class="summary-value">${planGB} GB</td></tr><tr class="summary-row"><td class="summary-label">Duración</td><td class="summary-value">${planDays} días</td></tr><tr><td colspan="2"><div class="divider" style="margin:10px 0;"></div></td></tr><tr class="summary-row"><td class="summary-label">Total</td><td class="summary-value" style="font-size:22px;color:#C9973A;">USD ${amountUSD.toFixed(2)}</td></tr></table></div></td></tr>`
}

function supportBlock() {
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section" style="background:#FFFCF7;"><h2 class="h2">Estamos para ayudarte</h2><p class="p">Si tenés cualquier duda con la instalación o activación, contactanos.</p><div style="height:18px;"></div><a class="button-secondary" href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}">Hablar por WhatsApp</a></div></td></tr>`
}

// ── B2C: Entrega de múltiples eSIMs en un solo email (compras grupales) ───────
export function emailEntregaMultiple(data: {
  customerName: string
  totalCount: number
  planName: string
  planGB: number
  planDays: number
  planType: 'local' | 'dataonly' | string
  amountUSD: number
  esims: Array<{
    label: string
    orderRef: string
    activationString: string
    confirmationCode: string
    qrUrl?: string
  }>
}) {
  const subject = data.totalCount === 1
    ? `Tu eSIM RUTA34 está confirmada`
    : `Tus ${data.totalCount} eSIMs RUTA34 están confirmadas`

  const esimRows = data.esims.map(esim =>
    `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section"><h2 class="h2">${esim.label} — ${esim.orderRef}</h2>${qrBlock(esim.qrUrl ?? 'cid:esim-qr', esim.confirmationCode, esim.activationString)}</div></td></tr>`
  ).join('')

  return {
    subject,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">${data.totalCount === 1 ? 'Tu eSIM está lista' : `Tus ${data.totalCount} eSIMs están listas`}</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">${data.totalCount} ${data.totalCount === 1 ? 'eSIM' : 'eSIMs'}</p><p class="p">Comparte un código diferente con cada persona. No escanees el mismo QR en más de un celular.</p></div></td></tr>
${esimRows}
${orderSummaryBlock(data.planName, data.planGB, data.planDays, data.amountUSD)}
${supportBlock()}
${premiumFooter()}`
  }
}