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
    subject: `Tu eSIM RUTA34 está confirmada — la recibís el ${data.activationDate}`,
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
      <div style="font-size:22px;font-weight:800;margin-bottom:8px;">📱 Tu eSIM está confirmada</div>
      <div style="color:#7A7A7A;font-size:14px;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, tu eSIM para viajar a Europa está lista.
      </div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      ${row('Plan', data.tariffName)}
      ${row('Tipo', data.type === 'prepago' ? 'eSIM Prepago (28 días desde activación)' : 'DataOnly')}
      ${row('Recibís el QR el', `<strong style="color:#C9973A;">${data.activationDate}</strong>`)}
    </div>

    <div style="background:rgba(230,0,0,0.08);border:1px solid rgba(230,0,0,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      ⚠️ <strong style="color:#fff;">Importante:</strong> El plan empieza a correr desde el momento de activación. Te recomendamos activar la eSIM cuando llegués a Europa.
    </div>

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · <span style="color:#C9973A;">ruta34telecom.com</span>
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
    subject: `Recibimos tu pedido ${data.orderRef} — te enviamos tu eSIM antes de 24 hs`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#C9973A;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:22px;font-weight:800;margin-bottom:8px;">✅ Recibimos tu pedido</div>
      <div style="color:#AAAAAA;font-size:15px;line-height:1.7;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, confirmamos que recibimos tu compra.<br><br>
        Estamos preparando tu eSIM y la recibirás en este email <strong style="color:#C9973A;">antes de las próximas 24 horas</strong>.<br>
        Operamos todos los días de <strong style="color:#fff;">8:00 a 21:00</strong> (hora de España).
      </div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Detalle de tu pedido</div>
      ${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
      ${row('Plan', data.planName)}
      ${row('Datos', `${data.planGB} GB · ${data.planDays} días`)}
      ${row('Tipo', isLocal ? '🇪🇸 eSIM España (llamadas + SMS incluidos)' : '✈️ eSIM Europa (datos en 30+ países)')}
      ${row('Total pagado', `<strong style="color:#fff;">USD ${data.amountUSD.toFixed(2)}</strong>`)}
    </div>

    <div style="background:rgba(201,151,58,0.08);border:1px solid rgba(201,151,58,0.2);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.7;">
      📌 <strong style="color:#fff;">Mientras tanto:</strong><br>
      · Verificá que tu celular es compatible con eSIM (Settings → General → About → eSIM)<br>
      · Cuando llegue el QR, necesitarás WiFi para instalarlo (no internet de datos)<br>
      · ${activationNote}
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}"
        style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:700;font-size:14px;">
        💬 ¿Dudas? Escribinos por WhatsApp
      </a>
    </div>

    <div style="color:#555;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · <a href="https://esimruta34.com" style="color:#C9973A;text-decoration:none;">esimruta34.com</a>
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
  activationString: string   // 1$server$code
  confirmationCode: string   // 6 dígitos
  amountUSD: number
  qrUrl?: string             // URL pública HTTPS — si existe se usa en el body; si no, cid:esim-qr
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const importantNote = isLocal
    ? '⏱ Los <strong style="color:#fff;">28 días</strong> comienzan cuando activás la eSIM. Recomendamos activarla al aterrizar en Europa.'
    : '⏱ Tenés <strong style="color:#fff;">60 días</strong> desde la compra para activar la eSIM. El plan corre desde que la escaneás.'

  return {
    subject: `📱 Tu eSIM RUTA34 está lista — guardá este email`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#C9973A;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;text-align:center;">
      <div style="font-size:24px;font-weight:800;margin-bottom:8px;">📱 Tu eSIM está lista</div>
      <div style="color:#AAAAAA;font-size:15px;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, tu eSIM para Europa ya está preparada.<br>
        Escaneá el código QR con tu celular para instalarla.
      </div>
    </div>

    <!-- QR CODE -->
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
      <div style="font-size:11px;color:#888;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Tu código QR</div>
      <img src="${data.qrUrl ?? 'cid:esim-qr'}" alt="Código QR eSIM RUTA34" width="220" height="220"
           style="display:block;margin:0 auto;border-radius:8px;" />
      <div style="margin-top:16px;background:#F5F5F5;border-radius:8px;padding:12px;font-size:11px;color:#555;font-family:monospace;word-break:break-all;text-align:left;">
        <div style="font-size:10px;color:#999;margin-bottom:4px;font-family:sans-serif;">Si no podés escanear el QR, usá esta cadena de activación:</div>
        ${data.activationString}
      </div>
    </div>

    <!-- CONFIRMATION CODE -->
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:24px;margin-bottom:20px;text-align:center;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Código de confirmación</div>
      <div style="font-size:48px;font-weight:900;letter-spacing:8px;color:#C9973A;">${data.confirmationCode}</div>
      <div style="font-size:12px;color:#7A7A7A;margin-top:8px;">Necesitarás ingresar este código después de escanear el QR</div>
    </div>

    <!-- INSTRUCTIONS -->
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:15px;font-weight:800;margin-bottom:20px;">Cómo activar tu eSIM</div>

      <!-- iPhone -->
      <div style="background:#1B2F4E;border-radius:10px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">🍎</span>
          <span style="font-size:13px;font-weight:700;color:#fff;">iPhone (iOS 14.4 o superior)</span>
        </div>
        ${step(1, 'Mantené presionado el código QR con tu cámara o desde este email')}
        ${step(2, 'Seleccioná <strong>"Añadir eSIM"</strong> en el menú que aparece')}
        ${step(3, 'Ingresá el código de confirmación <strong>' + data.confirmationCode + '</strong>')}
        ${step(4, 'Activá la línea cuando te lo solicite')}
        <div style="margin-top:10px;font-size:11px;color:#555;">
          ¿No aparece la opción? Usá el método manual: <strong>Ajustes → Datos móviles → Añadir plan de datos</strong>
        </div>
      </div>

      <!-- Android -->
      <div style="background:#1B2F4E;border-radius:10px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">🤖</span>
          <span style="font-size:13px;font-weight:700;color:#fff;">Android (Samsung, Pixel, Motorola y otros)</span>
        </div>
        ${step(1, 'Conectate a una red WiFi')}
        ${step(2, '<strong>Samsung:</strong> Ajustes → Conexiones → Administrador de SIM → Añadir plan<br><span style="color:#7A7A7A;font-size:11px;"><strong>Pixel / otros:</strong> Ajustes → Red e Internet → SIMs → Añadir eSIM</span>')}
        ${step(3, 'Escaneá el código QR')}
        ${step(4, 'Ingresá el código de confirmación <strong>' + data.confirmationCode + '</strong>')}
        ${step(5, 'Seleccioná <strong>"Activar"</strong> o <strong>"Usar SIM"</strong>')}
      </div>

      <!-- Manual fallback -->
      <div style="background:#1B2F4E;border-radius:10px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#7A7A7A;margin-bottom:8px;">📋 ¿No podés escanear el QR? Activación manual</div>
        <div style="font-size:12px;color:#AAAAAA;line-height:1.7;">
          Ingresá manualmente la cadena de activación en tu celular:<br>
          <span style="font-family:monospace;color:#C9973A;font-size:11px;word-break:break-all;">${data.activationString}</span>
        </div>
      </div>
    </div>

    <!-- IMPORTANT NOTE -->
    <div style="background:rgba(230,0,0,0.08);border:1px solid rgba(230,0,0,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.7;">
      ${importantNote}
    </div>

    <!-- ORDER SUMMARY -->
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:24px;margin-bottom:20px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Resumen de tu compra</div>
      ${row('Plan', data.planName)}
      ${row('Datos', `${data.planGB} GB · ${data.planDays} días`)}
      ${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
      ${row('Total', `<strong style="color:#fff;">USD ${data.amountUSD.toFixed(2)}</strong>`)}
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}"
        style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:700;font-size:14px;">
        💬 ¿Necesitás ayuda? Escribinos por WhatsApp
      </a>
    </div>

    <div style="color:#555;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · <a href="https://esimruta34.com" style="color:#C9973A;text-decoration:none;">esimruta34.com</a><br>
      <span style="color:#333;font-size:11px;">Guardá este email — contiene los datos de tu eSIM</span>
    </div>
  </div>
</body>
</html>`,
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
    label: string        // "eSIM 1 de 5"
    orderRef: string
    activationString: string
    confirmationCode: string
    qrUrl?: string
  }>
}) {
  const subject = data.totalCount === 1
    ? `📱 Tu eSIM RUTA34 está lista — guardá este email`
    : `📱 Tus ${data.totalCount} eSIMs RUTA34 están listas — guardá este email`

  const intro = data.totalCount === 1
    ? `Hola <strong style="color:#fff;">${data.customerName}</strong>, tu eSIM para Europa ya está preparada.`
    : `Hola <strong style="color:#fff;">${data.customerName}</strong>, tus ${data.totalCount} eSIMs para Europa están listas.<br>
       Cada eSIM tiene su propio código QR. <strong style="color:#C9973A;">Compartí uno distinto con cada persona</strong> — no escanees el mismo QR en más de un celular.`

  const esimBlocks = data.esims.map((esim, idx) => `
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:24px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:800;color:#C9973A;letter-spacing:1px;text-transform:uppercase;">${esim.label}</div>
        <div style="font-size:11px;font-family:monospace;color:#C9973A;">${esim.orderRef}</div>
      </div>

      <!-- QR -->
      <div style="background:#fff;border-radius:12px;padding:18px;text-align:center;margin-bottom:16px;">
        <div style="font-size:10px;color:#888;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Código QR de instalación</div>
        ${esim.qrUrl
          ? `<img src="${esim.qrUrl}" alt="QR ${esim.label}" width="200" height="200" style="display:block;margin:0 auto;border-radius:8px;" />`
          : `<div style="width:200px;height:200px;background:#f5f5f5;margin:0 auto;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">QR adjunto</div>`
        }
        <div style="margin-top:14px;background:#F5F5F5;border-radius:8px;padding:10px;font-size:10px;color:#555;font-family:monospace;word-break:break-all;text-align:left;">
          <div style="font-size:9px;color:#999;margin-bottom:3px;font-family:sans-serif;">Cadena manual (si no podés escanear):</div>
          ${esim.activationString}
        </div>
      </div>

      <!-- Código de confirmación -->
      <div style="text-align:center;margin-bottom:12px;">
        <div style="font-size:10px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Código de confirmación</div>
        <div style="font-size:36px;font-weight:900;letter-spacing:6px;color:#C9973A;">${esim.confirmationCode}</div>
        <div style="font-size:11px;color:#7A7A7A;margin-top:6px;">Ingresalo después de escanear el QR</div>
      </div>

      <!-- Campo "Para" — para imprimir/reenviar -->
      ${data.totalCount > 1 ? `
      <div style="border-top:1px solid #3D5A82;padding-top:12px;margin-top:4px;">
        <div style="font-size:11px;color:#7A7A7A;">
          <strong style="color:#fff;">Para:</strong> ________________________________
        </div>
        <div style="font-size:10px;color:#555;margin-top:4px;">Anotá el nombre de la persona que va a usar esta eSIM.</div>
      </div>` : ''}
    </div>
  `).join('')

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1B2F4E;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#C9973A;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:28px;margin-bottom:24px;text-align:center;">
      <div style="font-size:22px;font-weight:800;margin-bottom:10px;">
        📱 ${data.totalCount === 1 ? 'Tu eSIM está lista' : `Tus ${data.totalCount} eSIMs están listas`}
      </div>
      <div style="color:#AAAAAA;font-size:14px;line-height:1.6;">${intro}</div>
    </div>

    ${data.totalCount > 1 ? `
    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      ⚠️ <strong style="color:#fff;">Importante:</strong> No escanees el mismo QR en más de un celular. Cada código funciona para una sola eSIM.
    </div>` : ''}

    <!-- Resumen del pedido -->
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:20px;margin-bottom:24px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Resumen</div>
      ${row('Plan', data.planName)}
      ${row('Datos', `${data.planGB} GB · ${data.planDays} días`)}
      ${data.totalCount > 1 ? row('Cantidad', `${data.totalCount} eSIMs`) : ''}
      ${row('Total pagado', `<strong style="color:#fff;">US$${data.amountUSD.toFixed(2)}</strong>`)}
    </div>

    <!-- Bloque de cada eSIM -->
    ${esimBlocks}

    <!-- Instrucciones -->
    <div style="background:#2D4A72;border:1px solid #3D5A82;border-radius:14px;padding:24px;margin-bottom:20px;">
      <div style="font-size:14px;font-weight:800;margin-bottom:16px;">Cómo instalar la eSIM</div>
      ${step(1, 'Conectate a WiFi antes de instalar')}
      ${step(2, 'Abrí Ajustes → Datos móviles → Añadir eSIM')}
      ${step(3, 'Escaneá el QR con la cámara del celular')}
      ${step(4, 'Ingresá el código de confirmación cuando te lo pida')}
      ${step(5, 'Dejá la eSIM instalada antes de salir · Activala al llegar a Europa')}
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34600000000'}"
        style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:700;font-size:14px;">
        💬 ¿Necesitás ayuda? Escribinos por WhatsApp
      </a>
    </div>

    <div style="color:#555;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #3D5A82;">
      RUTA34 Telecom · <a href="https://esimruta34.com" style="color:#C9973A;text-decoration:none;">esimruta34.com</a><br>
      <span style="color:#444;font-size:11px;">Pago único · sin renovación automática · Conservás tu WhatsApp</span>
    </div>
  </div>
</body>
</html>`,
  }
}