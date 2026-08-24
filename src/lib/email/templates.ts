// ── Bloqueo de dark-mode: sin estas dos líneas, iOS Mail / Gmail / Outlook.com
// auto-invierten los colores del email y rompen la paleta Ruta34 por completo.
const LIGHT_MODE_META = `<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">`

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
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Pedido recibido</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">${data.orderRef}</p><p class="p">Hola <strong style="color:#1B2F4E;">${data.sellerName}</strong>, tu pedido fue registrado correctamente.</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">Detalle del pedido</h2>
${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
${row('Cliente', `${data.customerName} ${data.customerLastname}`)}
${row('Tarifa', data.tariffName)}
${row('Tipo', data.type === 'prepago' ? 'eSIM Prepago' : 'eSIM DataOnly')}
${row('Activación', isDataOnly ? 'El cliente activa cuando quiera (60 días)' : isScheduled ? `Programada para el ${data.activationDate}` : 'Inmediata — el equipo RUTA34 la procesa hoy')}
</div></td></tr>
${isScheduled ? noticeBlock('📆', 'Activación programada.', `El cliente recibirá un email de aviso ahora. El QR se envía el ${data.activationDate}.`) : ''}
${isDataOnly ? noticeBlock('📡', 'eSIM DataOnly.', 'El cliente tiene 60 días para activar el QR. El plan no empieza hasta que lo escanee.') : ''}
${premiumFooter()}`
  }
}

export function emailAvisoClienteProgramado(data: {
  customerName: string
  tariffName: string
  activationDate: string
  type: string
}) {
  const isLocal = data.type === 'prepago' || data.type === 'local'

  return {
    subject: `Tu eSIM está confirmada — la recibirás el ${data.activationDate}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Activación programada</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">📅 Tu eSIM está confirmada</p><p class="p">Hola <strong style="color:#1B2F4E;">${data.customerName}</strong>, tu eSIM está lista y programada.</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">Tu plan</h2>
${row('Plan', data.tariffName)}
${row('Tipo', isLocal ? '28 días desde activación' : 'DataOnly • 60 días')}
${row('Recibirás tu QR', `<span style="color:#C9973A;font-weight:800;">${data.activationDate}</span>`)}
</div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">Cronograma</h2>
${step(1, `<strong style="color:#1B2F4E;">Compra confirmada</strong><br>Tu pedido está registrado y listo.`)}
${step(2, `<strong style="color:#1B2F4E;">El ${data.activationDate}</strong><br>Ese día activamos tu eSIM y te enviamos el código QR — ahí empiezan a correr tus días de plan.`)}
${step(3, `<strong style="color:#1B2F4E;">Instalá apenas lo recibas</strong><br>Tus días ya están corriendo desde que te enviamos el QR, no desde que lo escaneás. Instalá la eSIM apenas la recibas para no perder días de tu plan.`)}
</div></td></tr>
${noticeBlock('⏳', 'Importante: cuándo empiezan tus días.', `Tus días de plan arrancan el ${data.activationDate}, el día que te enviamos el código QR — no cuando lo instalás en tu celular. Te recomendamos instalar la eSIM apenas la recibas para aprovechar el plan completo.`)}
${supportBlock()}
${premiumFooter()}`
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
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Alerta diaria</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 8px;">⚠️ ${totalAlertas} acción(es) pendiente(s)</p><p class="muted">${data.date}</p></div></td></tr>
${data.pendingReview.length > 0 ? `
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">📋 Pedidos esperando revisión (${data.pendingReview.length})</h2>
${data.pendingReview.map(o => orderListItem(
  `${o.customer_name} ${o.customer_lastname}`,
  `${o.order_ref} · ${o.agencies?.name || ''}`,
  badge('Pendiente', '#F59E0B'),
)).join('')}
</div></td></tr>` : ''}
${data.scheduledToday.length > 0 ? `
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">🔔 Activaciones programadas para hoy (${data.scheduledToday.length})</h2>
${data.scheduledToday.map(o => orderListItem(
  `${o.customer_name} ${o.customer_lastname}`,
  `${o.order_ref} · ${o.tariffs?.name || ''} · ${o.customer_email}`,
  badge('Hoy', '#C9973A'),
)).join('')}
</div></td></tr>` : ''}
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section" style="text-align:center;"><a class="button" href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos">Gestionar pedidos →</a></div></td></tr>
${premiumFooter()}`
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
    ? 'Tus 28 días empiezan a correr en cuanto te enviamos el código QR (dentro de las próximas 24 horas) — no cuando lo instalás. Instalá la eSIM apenas la recibas para no perder días de tu plan.'
    : 'Tenés 60 días desde la compra para activar la eSIM. El plan corre desde que la activás.'

  return {
    subject: `Tu compra está confirmada — recibirás tu eSIM en 24 horas`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Compra confirmada</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">✅ Compra confirmada</p><p class="p">Hola <strong style="color:#1B2F4E;">${data.customerName}</strong>, tu viaje a Europa está casi listo.</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">Tu plan</h2>
${row('Plan', `${data.planName} · ${data.planGB} GB · ${data.planDays} días`)}
${row('Total', `<span style="color:#C9973A;font-size:18px;">USD ${data.amountUSD.toFixed(2)}</span>`)}
${row('Referencia de pedido', `<span style="font-family:monospace;">${data.orderRef}</span>`)}
</div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section"><h2 class="h2">Lo que viene ahora</h2>
${step(1, `<strong style="color:#1B2F4E;">Preparamos tu eSIM</strong><br>En los próximos minutos verificamos tu compra. Operamos de 8:00 a 21:00 (España).`)}
${step(2, `<strong style="color:#1B2F4E;">Recibirás tu QR por email</strong><br>En menos de 24 horas recibirás el código QR para instalar tu eSIM.`)}
${step(3, `<strong style="color:#1B2F4E;">Activá cuando llegues</strong><br>${activationNote}`)}
</div></td></tr>
${noticeBlock('📱', 'Antes de instalar tu eSIM', 'Asegurate que tu celular sea compatible (Settings → General → About → eSIM) · Necesitarás WiFi para instalarlo (no internet de datos) · Guardá este email — contiene datos importantes.')}
${supportBlock()}
${premiumFooter()}`,
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
  activationDate?: string | null
}) {
  const isScheduled = !!data.activationDate

  return {
    subject: `⚡ Nuevo pedido B2C — ${data.customerName} ${data.customerLastname} · ${data.planName} · USD ${data.amountUSD.toFixed(2)}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;">${badge('⚡ Nuevo pedido — tramitar', '#DC2626')}<p style="font-size:22px;font-weight:900;color:#1B2F4E;margin:14px 0 4px;">${data.customerName} ${data.customerLastname}</p><p class="muted">Recibido ahora · Canal web</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section">
${row('Referencia', `<span style="font-family:monospace;color:#C9973A;">${data.orderRef}</span>`)}
${row('Email', `<a href="mailto:${data.customerEmail}" style="color:#1B2F4E;">${data.customerEmail}</a>`)}
${row('País', data.customerCountry)}
${row('Plan', `${data.planName} · ${data.planGB} GB`)}
${row('Importe', `<strong style="color:#16A34A;">USD ${data.amountUSD.toFixed(2)}</strong>`)}
${row('Activación', isScheduled ? `<strong style="color:#C9973A;">Programada para el ${data.activationDate}</strong>` : 'Inmediata')}
</div></td></tr>
${isScheduled ? noticeBlock('📆', 'No es urgente.', 'Este pedido es de activación programada — no hace falta entregar el QR hoy, el cliente recibirá el recordatorio automático 24h antes de la fecha elegida.') : ''}
<tr><td><div class="section" style="text-align:center;"><a class="button" href="${data.portalUrl}">Tramitar en el portal →</a></div></td></tr>
${premiumFooter()}`,
  }
}

function step(n: number, text: string) {
  return `
  <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start;">
    <span style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#C9973A;color:#1B2F4E;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;line-height:1;">${n}</span>
    <span style="font-size:14px;color:#555555;line-height:1.6;">${text}</span>
  </div>`
}

function row(label: string, value: string) {
  return `
  <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:10px;font-size:13px;">
    <span style="color:#8A8A8A;">${label}</span>
    <span style="font-weight:700;text-align:right;color:#1B2F4E;">${value}</span>
  </div>`
}

function noticeBlock(emoji: string, title: string, text: string) {
  return `<tr><td><div class="section"><div style="background:rgba(201,151,58,0.06);border:1px solid rgba(201,151,58,0.2);border-radius:12px;padding:20px;font-size:14px;color:#555555;line-height:1.7;">${emoji} <strong style="color:#1B2F4E;display:block;margin-bottom:6px;">${title}</strong>${text}</div></div></td></tr>`
}

function badge(text: string, color: string) {
  return `<span style="display:inline-block;background:${color};color:#FFFFFF;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">${text}</span>`
}

function orderListItem(title: string, subtitle: string, badgeHtml: string) {
  return `<div style="background:#FFFFFF;border:1px solid #E9E2D8;border-radius:12px;padding:14px 18px;margin-bottom:8px;"><table role="presentation" width="100%"><tr><td><div style="font-weight:700;font-size:13px;color:#1B2F4E;">${title}</div><div style="color:#8A8A8A;font-size:12px;margin-top:3px;">${subtitle}</div></td><td align="right" style="white-space:nowrap;">${badgeHtml}</td></tr></table></div>`
}

// ── PREMIUM EMAIL HELPERS (for warm-white, Georgia serif, gold buttons) ────────

function premiumEmailStyles() {
  return `<style>body{margin:0;padding:0;background:#FAF7F2;color:#1B2F4E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;}table{border-collapse:collapse;}img{border:0;outline:none;text-decoration:none;display:block;}.container{width:100%;max-width:680px;margin:0 auto;}.card{background:#FFFFFF;border:1px solid #E9E2D8;border-radius:28px;overflow:hidden;}.section{padding:32px;}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;font-weight:700;}.h1{font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.08;font-weight:400;color:#1B2F4E;margin:10px 0 14px;}.h2{font-size:22px;line-height:1.25;font-weight:800;color:#1B2F4E;margin:0 0 12px;}.p{font-size:16px;line-height:1.65;color:#555555;margin:0;}.muted{color:#8A8A8A;font-size:14px;line-height:1.5;}.button{display:inline-block;background:#C9973A;color:#1B2F4E;text-decoration:none;padding:15px 22px;border-radius:14px;font-weight:800;font-size:15px;}.button-secondary{display:inline-block;background:#FFFFFF;color:#1B2F4E;text-decoration:none;padding:14px 20px;border-radius:14px;border:1px solid #E9E2D8;font-weight:700;font-size:15px;}.divider{height:1px;background:#E9E2D8;line-height:1px;font-size:1px;}.summary-row td{padding:8px 0;font-size:15px;}.summary-label{color:#8A8A8A;}.summary-value{color:#1B2F4E;font-weight:800;text-align:right;}@media only screen and (max-width:600px){.section{padding:24px!important;}.h1{font-size:32px!important;}.h2{font-size:20px!important;}.button,.button-secondary{display:block!important;text-align:center!important;}}</style>`
}

function premiumHeader() {
  return `<table role="presentation" width="100%" style="background:#FAF7F2;padding:28px 12px;"><tr><td align="center"><table role="presentation" class="container" width="100%"><tr><td style="padding:0 0 18px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#1B2F4E;letter-spacing:-0.03em;">Ruta34</div></td></tr>`
}

function premiumFooter() {
  return `<tr><td style="padding:24px 20px;text-align:center;"><p class="muted" style="margin:0 0 8px;">Ruta34 · Conectividad para viajar por España y Europa</p><p class="muted" style="margin:0;">¿Necesitás ayuda? <a href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34647204011'}" style="color:#1B2F4E;font-weight:700;text-decoration:none;">Escribinos por WhatsApp</a></p></td></tr></table></td></tr></table></body></html>`
}

function qrBlock(qrUrl: string, confirmationCode: string, activationString: string) {
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section" style="text-align:center;"><div style="display:inline-block;background:#FFFFFF;border:1px solid #E9E2D8;border-radius:24px;padding:18px;"><img src="${qrUrl}" alt="QR de instalación eSIM" width="220" height="220" style="width:220px;height:220px;margin:0 auto;border-radius:8px;" /></div><div style="height:18px;"></div><p class="muted">Código: <strong style="color:#1B2F4E;">${confirmationCode}</strong></p><div style="height:8px;"></div><p class="muted" style="font-family:monospace;word-break:break-all;">${activationString}</p></div></td></tr>`
}

function orderSummaryBlock(planName: string, planGB: number, planEUGB: number | undefined, planDays: number, amountUSD: number) {
  const dataRow = planEUGB && planEUGB > 0
    ? `<tr class="summary-row"><td class="summary-label">🇪🇸 Datos España</td><td class="summary-value">${planGB} GB</td></tr><tr class="summary-row"><td class="summary-label">🇪🇺 Datos UE Roaming</td><td class="summary-value">${planEUGB} GB</td></tr>`
    : `<tr class="summary-row"><td class="summary-label">📍 Datos</td><td class="summary-value">${planGB} GB</td></tr>`
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section"><h2 class="h2">Resumen de tu compra</h2><table role="presentation" width="100%"><tr class="summary-row"><td class="summary-label">Plan</td><td class="summary-value">${planName}</td></tr>${dataRow}<tr class="summary-row"><td class="summary-label">Duración</td><td class="summary-value">${planDays} días</td></tr><tr><td colspan="2"><div class="divider" style="margin:10px 0;"></div></td></tr><tr class="summary-row"><td class="summary-label">Total</td><td class="summary-value" style="font-size:22px;color:#C9973A;">USD ${amountUSD.toFixed(2)}</td></tr></table></div></td></tr>`
}

function supportBlock() {
  return `<tr><td><div class="divider"></div></td></tr><tr><td><div class="section" style="background:#FFFCF7;"><h2 class="h2">Estamos para ayudarte</h2><p class="p">Si tenés cualquier duda con la instalación o activación, contactanos.</p><div style="height:18px;"></div><a class="button-secondary" href="https://wa.me/${process.env.WHATSAPP_NUMBER ?? '34647204011'}">Hablar por WhatsApp</a></div></td></tr>`
}

// ── B2C: Entrega de eSIM con QR embebido ──────────────────────────────────────
export function emailEntregaB2C(data: {
  customerName: string
  orderRef: string
  planName: string
  planGB: number
  planEUGB?: number
  planDays: number
  planType: 'local' | 'dataonly' | string
  activationString: string
  confirmationCode: string
  amountUSD: number
  qrUrl?: string
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const deliveryMessage = isLocal
    ? 'Tu eSIM ya está activa y tus 28 días ya están corriendo. Instalala cuanto antes para no perder días de tu plan.'
    : 'Tu eSIM está lista para activar en cualquier momento dentro de los próximos 60 días.'

  return {
    subject: `Tu eSIM RUTA34 está confirmada — ${data.orderRef}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Tu eSIM está lista</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">Orden ${data.orderRef}</p><p class="p">${deliveryMessage}</p></div></td></tr>
${qrBlock(data.qrUrl ?? 'cid:esim-qr', data.confirmationCode, data.activationString)}
${orderSummaryBlock(data.planName, data.planGB, data.planEUGB, data.planDays, data.amountUSD)}
${supportBlock()}
${premiumFooter()}`
  }
}

// ── B2C: Entrega de múltiples eSIMs en un solo email (compras grupales) ───────
export function emailEntregaMultiple(data: {
  customerName: string
  totalCount: number
  planName: string
  planGB: number
  planEUGB?: number
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
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">${data.totalCount === 1 ? 'Tu eSIM está lista' : `Tus ${data.totalCount} eSIMs están listas`}</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">${data.totalCount} ${data.totalCount === 1 ? 'eSIM' : 'eSIMs'}</p><p class="p">Comparte un código diferente con cada persona. No escanees el mismo QR en más de un celular.</p></div></td></tr>
${esimRows}
${orderSummaryBlock(data.planName, data.planGB, data.planEUGB, data.planDays, data.amountUSD)}
${supportBlock()}
${premiumFooter()}`
  }
}

// ── B2C: Recordatorio 24h antes de una activación programada ──────────────────
export function emailRecordatorioActivacion(data: {
  customerName: string
  orderRef: string
  planName: string
  activationDate: string
  rescheduleUrl: string
}) {
  return {
    subject: `Mañana recibís tu eSIM RUTA34 — ${data.activationDate}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Falta poco</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">⏰ Mañana te enviamos tu eSIM</p><p class="p">Hola <strong style="color:#1B2F4E;">${data.customerName}</strong>, tu ${data.planName} está programada para mañana, <strong style="color:#1B2F4E;">${data.activationDate}</strong>. Vas a recibir el código QR por email ese mismo día.</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section" style="text-align:center;">
<p class="p" style="margin-bottom:20px;">¿Necesitás mover la fecha? Podés cambiarla vos mismo, siempre dentro del año permitido desde tu compra.</p>
<a class="button" href="${data.rescheduleUrl}">Cambiar fecha →</a>
</div></td></tr>
${noticeBlock('📌', 'Referencia de tu pedido', `<span style="font-family:monospace;">${data.orderRef}</span> — guardala por si necesitás contactarnos.`)}
${supportBlock()}
${premiumFooter()}`
  }
}

// ── B2C: Confirmación de cambio de fecha de activación ────────────────────────
export function emailFechaReprogramada(data: {
  customerName: string
  orderRef: string
  planName: string
  newActivationDate: string
}) {
  return {
    subject: `Tu nueva fecha de activación — ${data.newActivationDate}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
${premiumEmailStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" width="100%" style="background:#FAF7F2;margin:0;padding:0;border-collapse:collapse;">
${premiumHeader()}
<tr><td style="padding:32px 20px;">
<table role="presentation" class="container" width="100%">
<tr><td><div class="section" style="text-align:center;"><p class="eyebrow">Fecha actualizada</p><p style="font-size:28px;font-weight:900;color:#1B2F4E;margin:0 0 12px;">📆 Nueva fecha confirmada</p><p class="p">Hola <strong style="color:#1B2F4E;">${data.customerName}</strong>, actualizamos la fecha de activación de tu ${data.planName}.</p></div></td></tr>
<tr><td><div class="divider"></div></td></tr>
<tr><td><div class="section">
${row('Referencia', `<span style="font-family:monospace;">${data.orderRef}</span>`)}
${row('Recibirás tu QR', `<span style="color:#C9973A;font-weight:800;">${data.newActivationDate}</span>`)}
</div></td></tr>
${supportBlock()}
${premiumFooter()}`
  }
}

// ── ADMIN: Email de bienvenida para nuevo administrador ─────────────────────
export function emailNuevoAdmin(data: {
  adminName: string
  email: string
  tempPassword: string
  loginUrl: string
}) {
  return {
    subject: '🔐 Tu acceso de administrador RUTA34 está listo',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${LIGHT_MODE_META}
  <title>Acceso Admin - RUTA34 Telecom</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#1B2F4E;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="64" viewBox="0 0 1200 320" style="max-width:100%;height:auto;display:block;margin:0 auto;">
        <rect x="40" y="60" width="200" height="200" rx="44.0" fill="#FFFFFF"/>
        <text x="140.0" y="184.0" text-anchor="middle" fill="#1B2F4E" font-family="'DM Serif Display','Noto Serif Display','DejaVu Serif',serif" font-size="108.0" font-weight="400">34</text>
        <text x="300" y="155" fill="#FFFFFF" font-family="'Plus Jakarta Sans','Noto Sans','DejaVu Sans',sans-serif" font-size="96" font-weight="800" letter-spacing="2">RUTA34</text>
      </svg>
    </div>

    <!-- Body -->
    <div style="background:#FFFFFF;border-radius:0 0 16px 16px;padding:32px;border:1px solid #E9E2D8;border-top:none;">

      <h1 style="font-size:22px;font-weight:900;color:#1B2F4E;margin:0 0 8px;line-height:1.2;">
        ¡Bienvenido, ${data.adminName}!
      </h1>
      <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu cuenta de administrador en el portal RUTA34 Telecom está lista. Usa las credenciales abajo para acceder por primera vez.
      </p>

      <!-- Credenciales -->
      <div style="background:#FAF7F2;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #C9973A;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8A8A8A;">
          Credenciales de acceso
        </p>
        <div style="margin-bottom:12px;">
          <p style="margin:0 0 4px;font-size:12px;color:#666;">Email:</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1B2F4E;font-family:monospace;word-break:break-all;">
            ${data.email}
          </p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#666;">Contraseña temporal:</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1B2F4E;font-family:monospace;letter-spacing:1px;">
            ${data.tempPassword}
          </p>
        </div>
      </div>

      <!-- Botón de acceso -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${data.loginUrl}" style="display:inline-block;background:#C9973A;color:#1B2F4E;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;">
          Acceder al portal →
        </a>
      </div>

      <!-- Aviso importante -->
      <div style="background:rgba(201,151,58,0.06);border:1px solid rgba(201,151,58,0.2);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
          <strong style="color:#1B2F4E;">⚠️ Importante:</strong> Al acceder por primera vez, se te pedirá que <strong>establezca una nueva contraseña personal</strong>. Esta contraseña temporal no se puede cambiar directamente en el portal.
        </p>
      </div>

      <!-- Pasos -->
      <h2 style="font-size:15px;font-weight:700;color:#1B2F4E;margin:0 0 12px;">Qué hacer ahora:</h2>
      <ol style="margin:0 0 24px;padding-left:20px;color:#555555;font-size:14px;line-height:1.8;">
        <li>Haz clic en "Acceder al portal" arriba</li>
        <li>Inicia sesión con tu email y la contraseña temporal</li>
        <li>En el siguiente paso, se te pedirá que <strong>establezca una nueva contraseña personal</strong></li>
        <li>Usa una contraseña segura (mín. 8 caracteres, números, mayúsculas)</li>
        <li>Esa nueva contraseña será la que uses de ahora en adelante</li>
      </ol>

      <!-- Seguridad -->
      <div style="background:#FAF7F2;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
          <strong style="color:#1B2F4E;">🔒 Seguridad:</strong> Esta credencial temporal es única y solo válida para tu primera sesión. Nadie más puede usar estas credenciales una vez que cambies tu contraseña.
        </p>
      </div>

    </div>

    <p style="text-align:center;color:#8A8A8A;font-size:12px;margin:16px 0 0;">
      RUTA34 Telecom · Portal de Administración<br />
      <a href="https://esimruta34.com" style="color:#8A8A8A;">esimruta34.com</a>
    </p>
  </div>
</body>
</html>
    `,
  }
}
