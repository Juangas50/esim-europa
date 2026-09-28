import { siteBaseUrl } from "@/lib/utils"
import { parseActivationString } from "@/lib/esim/validate"
import {
  emailDocument, row as blockRow, eyebrow, h1, bodyText, heroImage,
  supportBlock as sharedSupportBlock, iconValueCard, reassuranceCard, multiRefsList, ICONS,
  FONTS, ctaButtonOutline, SUPPORT_URL, CHECK_ICON_SVG, whiteCard,
  whenConnectedBlock, italicNote, howToInstallSteps, stepHeader,
  howToInstallBlock, manualInstallBlock, activationAndQrBlock,
} from "@/lib/email/blocks"

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

// SINGLE reproduce "Ruta34 Email2 ActivacionProgramada.dc.html". MULTI sigue
// el mismo criterio y la misma limitación de fuente que emailConfirmacionB2C
// (ver comentario arriba y sección K del informe de entrega). planDays ahora
// viene de tariffs.validity_days real — ya no hardcodea "28 días".
export function emailAvisoClienteProgramado(data: {
  customerName: string
  orderRefs: string[]
  totalCount: number
  planName: string
  planDays: number
  activationDate: string
  type: string
}) {
  const isMulti = data.totalCount > 1
  const orderRef = data.orderRefs[0]

  const subject = isMulti
    ? `Tus eSIMs están confirmadas — las recibirás el ${data.activationDate}`
    : `Tu eSIM está confirmada — la recibirás el ${data.activationDate}`

  const planLabel = isMulti ? `tus ${data.totalCount} eSIMs` : `tu eSIM`
  const activateLabel = isMulti ? `las activaremos` : `la activaremos`
  const installLabel = isMulti ? `instalarlas` : `instalarla`

  const body = `
${blockRow(`
  ${eyebrow('ACTIVACIÓN PROGRAMADA')}
  ${h1(isMulti ? 'Todo listo.<br>Nos ocupamos de activar tus eSIMs.' : 'Todo listo.<br>Nos ocupamos de activar tu eSIM.')}
`, '8px 40px 22px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-email2.jpg`, 'Escritorio con cuaderno de plan de viaje, pasaporte, teléfono, taza de café y planta, con luz cálida de ventana'), '0 40px 26px')}
${blockRow(bodyText(`
  <div style="margin-bottom:10px;">Hola, ${data.customerName}.</div>
  <div style="margin-bottom:10px;">Programamos la activación de ${planLabel} <b style="color:#1C3454;">${data.planName}</b> para el <b style="color:#1C3454;">${data.activationDate}</b>.</div>
  <div>Ese día ${activateLabel} y te enviaremos un email con lo necesario para ${installLabel}.</div>
`))}
${blockRow(`<table role="presentation" width="100%" style="margin-bottom:20px;"><tr><td>${iconValueCard(ICONS.calendar, 'FECHA DE ACTIVACIÓN', `<div style="font-family:${FONTS.header};font-size:21px;color:#1C3454;">${data.activationDate}</div>`)}</td></tr></table>
${reassuranceCard(isMulti ? 'No tenés que hacer nada.' : 'No tenés que hacer nada.', `Te avisaremos por email cuando activemos ${planLabel}.`)}`)}
${blockRow(iconValueCard(ICONS.plan, 'TU PLAN', `<div style="font-family:${FONTS.header};font-size:23px;color:#1C3454;margin-bottom:4px;">${data.planName}</div><div style="font-family:${FONTS.body};font-size:13.5px;color:#5B6579;">${data.planDays} días</div>`))}
${isMulti
  ? blockRow(multiRefsList(data.orderRefs.map((ref, i) => ({ label: `eSIM ${i + 1} de ${data.totalCount}`, orderRef: ref }))))
  : blockRow(iconValueCard(ICONS.receipt, 'REFERENCIA DE PEDIDO', `<div style="font-family:${FONTS.body};font-size:14px;color:#5B6579;">Pedido <span style="font-weight:700;color:#1C3454;">${orderRef}</span></div>`))
}
${blockRow(sharedSupportBlock(), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: isMulti ? 'Tus eSIMs · Europa' : 'Tu eSIM · Europa', bodyHtml: body }),
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
//
// SINGLE reproduce "Ruta34 Email1 CompraConfirmada.dc.html" (Design Master
// aprobado). MULTI (totalCount > 1) extiende el mismo master con copy
// singular→plural mecánico y el bloque "REFERENCIAS DE PEDIDO" — el subject
// MULTI y el formato "eSIM X de N · Ref. orderRef" están aprobados
// literalmente (FASE 4B §5); el resto del copy plural del cuerpo NO fue
// recibido como archivo/texto literal de Claude Design en este repo — es
// una derivación mecánica singular→plural siguiendo el mismo patrón ya
// aprobado para el subject. Ver informe de entrega, sección K.
export function emailConfirmacionB2C(data: {
  customerName: string
  orderRefs: string[]
  totalCount: number
  planName: string
  planDays: number
  planType: 'local' | 'dataonly' | string
}) {
  const isMulti = data.totalCount > 1
  const orderRef = data.orderRefs[0]

  const subject = isMulti
    ? `Tu compra está confirmada — recibirás tus eSIMs en 24 horas`
    : `Tu compra está confirmada — recibirás tu eSIM en 24 horas`

  const planLabel = isMulti ? `tus ${data.totalCount} eSIMs` : `tu eSIM`
  const readyLabel = isMulti ? `estén listas` : `esté lista`
  const installLabel = isMulti ? `instalarlas` : `instalarla`

  const body = `
${blockRow(`
  ${eyebrow('COMPRA CONFIRMADA')}
  ${h1('Ya está.<br>Recibimos tu compra.')}
`, '8px 40px 22px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-email1.jpg`, 'Valija abierta con ropa doblada, pasaporte, teléfono, botella y neceser sobre una cama, con luz cálida de ventana'), '0 40px 26px')}
${blockRow(bodyText(`
  <div style="margin-bottom:10px;">Hola, ${data.customerName}.</div>
  <div style="margin-bottom:10px;">Tu compra está confirmada y estamos preparando ${planLabel} <b style="color:#1C3454;">${data.planName}</b>.</div>
  <div>Cuando ${readyLabel}, te enviaremos otro email con todo lo necesario para ${installLabel}.</div>
`))}
${blockRow(`<table role="presentation" width="100%" style="margin-bottom:20px;"><tr><td>${iconValueCard(ICONS.plan, 'TU PLAN', `<div style="font-family:${FONTS.header};font-size:23px;color:#1C3454;margin-bottom:4px;">${data.planName}</div><div style="font-family:${FONTS.body};font-size:13.5px;color:#5B6579;">${data.planDays} días</div>`)}</td></tr></table>
${reassuranceCard('Por ahora no tenés que hacer nada.', `Te avisaremos por email en cuanto ${planLabel} ${readyLabel}.`)}`)}
${isMulti
  ? blockRow(multiRefsList(data.orderRefs.map((ref, i) => ({ label: `eSIM ${i + 1} de ${data.totalCount}`, orderRef: ref }))))
  : blockRow(iconValueCard(ICONS.receipt, 'REFERENCIA DE PEDIDO', `<div style="font-family:${FONTS.body};font-size:14px;color:#5B6579;">Pedido <span style="font-weight:700;color:#1C3454;">${orderRef}</span></div>`))
}
${blockRow(sharedSupportBlock(), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: isMulti ? 'Tus eSIMs · Europa' : 'Tu eSIM · Europa', bodyHtml: body }),
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
  return `<tr><td style="padding:24px 20px;text-align:center;"><p class="muted" style="margin:0 0 8px;">Ruta34 · Conectividad para viajar por España y Europa</p><p class="muted" style="margin:0;">¿Necesitás ayuda? <a href="${siteBaseUrl()}/wa" style="color:#1B2F4E;font-weight:700;text-decoration:none;">Escribinos por WhatsApp</a></p></td></tr></table></td></tr></table></body></html>`
}

// ── B2C: Entrega de eSIM única — reproduce "Ruta34 Email5 V4.dc.html" ─────────
//
// El master solo modela el caso "local" (eSIM ya activa desde el envío del
// QR). Para dataonly (donde el plan arranca al activar, no al enviar el QR)
// no hay master aprobado — se adaptan únicamente las 3 líneas que dependen
// del estado de activación (eyebrow, párrafo de bienvenida, nota de
// vigencia), reutilizando el copy ya vigente en producción para ese caso,
// nunca copy nuevo inventado. Todo lo demás (pasos, QR, manual, plan, "cuando
// te conectes", soporte) es idéntico entre ambos tipos y se reproduce
// literalmente del master. QR/activationString/confirmationCode/SM-DP+ sin
// cambios de lógica — solo se integran en el nuevo layout.
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
  qrUrl?: string
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const parsedActivation = parseActivationString(data.activationString)
  const smdp = parsedActivation.ok ? parsedActivation.data.smdp : ''

  const subject = `Tu eSIM RUTA34 está confirmada — ${data.orderRef}`

  const eyebrowText = isLocal ? 'TU ESIM ESTÁ ACTIVA' : 'TU ESIM ESTÁ LISTA'
  const greetingBody = isLocal
    ? `Tu eSIM ${data.planName} está activa y lista para instalar.`
    : `Tu eSIM ${data.planName} está lista para instalar, activala cuando la necesites.`
  const greetingBold = isLocal
    ? 'Instalala cuando quieras y dejá tu celular preparado.'
    : 'Tenés 60 días desde la compra para activarla.'
  const vigenciaTitle = isLocal ? 'Tu eSIM ya está activa.' : 'Activación dentro de 60 días.'
  const vigenciaText = isLocal
    ? 'Instalarla después no cambia su fecha de inicio.'
    : 'La vigencia empieza cuando la activás, no antes.'

  const planPlan = data.planEUGB && data.planEUGB > 0
    ? `<div style="padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid rgba(199,154,62,0.3);">
        <div style="font-family:${FONTS.body};font-size:11px;letter-spacing:0.08em;color:#9AA0AC;margin-bottom:5px;">ESPAÑA</div>
        <div style="font-family:${FONTS.header};font-size:36px;color:#1C3454;margin-bottom:5px;">${data.planGB} GB</div>
        <div style="font-family:${FONTS.body};font-size:14px;color:#5B6579;">para usar en España</div>
      </div>
      <div>
        <div style="font-family:${FONTS.body};font-size:11px;letter-spacing:0.08em;color:#9AA0AC;margin-bottom:5px;">EUROPA</div>
        <div style="font-family:${FONTS.header};font-size:27px;color:#1C3454;margin-bottom:5px;">${data.planEUGB} GB</div>
        <div style="font-family:${FONTS.body};font-size:14px;color:#5B6579;margin-bottom:12px;">de tus ${data.planGB} GB para viajar por Europa</div>
        <div style="font-family:${FONTS.body};font-size:13px;color:#9AA0AC;font-style:italic;">Los GB de Europa forman parte del total. No son adicionales.</div>
      </div>`
    : `<div>
        <div style="font-family:${FONTS.body};font-size:11px;letter-spacing:0.08em;color:#9AA0AC;margin-bottom:5px;">DATOS</div>
        <div style="font-family:${FONTS.header};font-size:36px;color:#1C3454;margin-bottom:5px;">${data.planGB} GB</div>
      </div>`

  const body = `
${blockRow(`
  ${eyebrow(eyebrowText)}
  ${h1('Ya podés instalarla.')}
  <div style="font-family:${FONTS.body};font-size:14.5px;line-height:1.6;color:#33415A;">Ahora sí: tu conexión ya está lista para acompañarte.</div>
`, '24px 40px 20px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-final.jpg`, 'Pasaporte, anteojos de sol, teléfono con eSIM Ruta34 en pantalla y café sobre una mesa, con ventanal de aeropuerto de fondo', 280))}
${blockRow(bodyText(`
  <div style="margin-bottom:10px;">Hola, ${data.customerName}.</div>
  <div style="margin-bottom:10px;">${greetingBody}</div>
  <div style="font-weight:700;color:#1C3454;">${greetingBold}</div>
`))}
${blockRow(whiteCard(`
  <table role="presentation" width="100%"><tr>
    <td width="26"><table role="presentation" width="26" height="26" style="background:#C79A3E;border-radius:50%;"><tr><td align="center" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:#FFFFFF;">01</td></tr></table></td>
    <td style="padding-left:10px;font-family:${FONTS.body};font-size:12px;font-weight:700;letter-spacing:0.1em;color:#1C3454;">ANTES DE EMPEZAR</td>
  </tr></table>
  <div style="height:16px;"></div>
  <div style="font-family:${FONTS.header};font-size:26px;line-height:1.25;color:#1C3454;margin-bottom:12px;">Copiá tu código de activación.</div>
  <div style="font-family:${FONTS.body};font-size:14.5px;line-height:1.6;color:#5B6579;margin-bottom:20px;">Lo vas a necesitar después de usar el QR, durante la instalación de tu eSIM.</div>
  <table role="presentation"><tr><td style="background:#F5EFE3;border:1px solid #EDE3CE;border-radius:14px;padding:20px 32px;text-align:center;">
    <div style="font-family:${FONTS.header};font-size:26px;letter-spacing:0.06em;color:#1C3454;white-space:nowrap;">${data.confirmationCode}</div>
    <div style="font-family:${FONTS.body};font-size:12px;color:#9AA0AC;margin-top:8px;">Copialo ahora y tenelo a mano.</div>
  </td></tr></table>
`, { padding: '36px 40px' }))}
${blockRow(whiteCard(`
  <table role="presentation" width="100%"><tr>
    <td width="26"><table role="presentation" width="26" height="26" style="background:#C79A3E;border-radius:50%;"><tr><td align="center" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:#FFFFFF;">02</td></tr></table></td>
    <td style="padding-left:10px;font-family:${FONTS.body};font-size:12px;font-weight:700;letter-spacing:0.1em;color:#1C3454;">TU QR</td>
  </tr></table>
  <div style="height:16px;"></div>
  <div style="font-family:${FONTS.header};font-size:26px;line-height:1.25;color:#1C3454;margin-bottom:12px;">Usá el QR para instalar tu eSIM.</div>
  <div style="font-family:${FONTS.body};font-size:14.5px;line-height:1.6;color:#5B6579;margin-bottom:20px;">Durante la instalación, tu celular te va a pedir el código que copiaste antes.</div>
  <table role="presentation" width="100%"><tr><td align="center" style="background:#FFFFFF;border:1px solid #EDE7D8;border-radius:14px;padding:20px;">
    <img src="${data.qrUrl ?? 'cid:esim-qr'}" alt="Código QR de instalación eSIM" width="200" height="200" style="width:200px;height:200px;display:block;border:0;">
  </td></tr></table>
`, { padding: '36px 40px' }))}
${blockRow(whiteCard(`
  ${stepHeader('03', 'CÓMO INSTALARLA')}
  <div style="height:8px;"></div>
  ${howToInstallSteps()}
  <div style="margin-top:30px;padding-top:22px;border-top:1px solid rgba(199,154,62,0.3);">
    <div style="font-family:${FONTS.body};font-size:13px;font-weight:700;color:#1C3454;margin-bottom:6px;">Instalación manual</div>
    <div style="font-family:${FONTS.body};font-size:13px;line-height:1.55;color:#5B6579;margin-bottom:14px;">También podés instalar Ruta34 manualmente con los datos de aprovisionamiento:</div>
    <div style="border-left:2px solid #C79A3E;padding:2px 0 2px 14px;">
      <div style="font-family:${FONTS.body};font-size:10.5px;letter-spacing:0.08em;color:#9AA0AC;margin-bottom:4px;">SERVIDOR SM-DP+</div>
      <div style="font-family:monospace;font-size:14px;font-weight:700;color:#1C3454;margin-bottom:12px;">${smdp}</div>
      <div style="font-family:${FONTS.body};font-size:10.5px;letter-spacing:0.08em;color:#9AA0AC;margin-bottom:4px;">CÓDIGO MANUAL</div>
      <div style="font-family:monospace;font-size:13px;font-weight:700;line-height:1.45;color:#1C3454;word-break:break-all;">${data.activationString}</div>
    </div>
  </div>
`, { padding: '36px 40px' }))}
${blockRow(whenConnectedBlock())}
${blockRow(italicNote(vigenciaTitle, vigenciaText))}
${blockRow(whiteCard(`
  <table role="presentation" width="100%"><tr>
    <td width="26"><table role="presentation" width="26" height="26" style="background:#C79A3E;border-radius:50%;"><tr><td align="center" style="font-family:${FONTS.body};font-size:11px;font-weight:700;color:#FFFFFF;">05</td></tr></table></td>
    <td style="padding-left:10px;font-family:${FONTS.body};font-size:12px;font-weight:700;letter-spacing:0.1em;color:#1C3454;">TU PLAN</td>
  </tr></table>
  <div style="font-family:${FONTS.header};font-style:italic;font-size:21px;color:#1C3454;margin:24px 0;">${data.planName}</div>
  <table role="presentation" width="100%"><tr>
    <td width="2" style="background:#C79A3E;"></td>
    <td style="padding-left:18px;">${planPlan}</td>
  </tr></table>
  <table role="presentation" width="100%" style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(199,154,62,0.3);"><tr>
    <td style="font-family:${FONTS.body};font-size:14px;color:#5B6579;">Duración</td>
    <td align="right" style="font-family:${FONTS.body};font-size:14px;font-weight:700;color:#1C3454;">${data.planDays} días</td>
  </tr></table>
`, { padding: '36px 40px' }))}
${blockRow(italicNote('¿Querés evitar posibles cargos en tu SIM habitual?', 'Desactivá los datos móviles de tu SIM habitual. Podés mantener esa SIM encendida.'))}
${blockRow(sharedSupportBlock(data.orderRef), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: 'Tu eSIM · Europa', bodyHtml: body }),
  }
}

// ── B2C: Entrega de múltiples eSIMs en un solo email (compras grupales) ───────
// ── B2C: Entrega de múltiples eSIMs — reproduce "Ruta34 Email6 Multiple.dc.html" ─
//
// El journey real: 01 código / 02 QR se repiten DENTRO de cada eSIM Unit
// (no son pasos globales); 03 cómo instalarlas y 04 cuando te conectes son
// compartidos, una sola vez, después de todas las unidades — igual que el
// master. Cada unidad lleva su propio bloque de instalación manual (SM-DP+
// individual, derivado, no persistido). No existe referencia global de
// compra: solo el orderRef de cada unidad, nunca un "Pedido" al pie.
// EXCEPCIÓN REGISTRADA (FASE 4B §4): el bloque "05 · Tu Plan" del master
// queda pausado — no se implementa acá, no bloquea el resto del email.
// `esims[].label` ya viene calculado por el caller con el orden canónico
// (labelWithinGroup) — este template no recalcula posiciones.
export function emailEntregaMultiple(data: {
  customerName: string
  totalCount: number
  planName: string
  planType: 'local' | 'dataonly' | string
  esims: Array<{
    label: string
    orderRef: string
    activationString: string
    confirmationCode: string
    qrUrl?: string
  }>
}) {
  const isLocal = data.planType === 'local' || data.planType === 'prepago'
  const subject = `Tus ${data.totalCount} eSIMs RUTA34 están confirmadas`

  const greetingBody = isLocal
    ? `Tus ${data.totalCount} eSIMs ${data.planName} están activas y listas para instalar.`
    : `Tus ${data.totalCount} eSIMs ${data.planName} están listas para instalar, activalas cuando las necesites.`
  const vigenciaTitle = isLocal ? 'Las eSIMs ya están activas.' : 'Activación dentro de 60 días.'
  const vigenciaText = isLocal
    ? 'Instalarlas después no cambia su fecha de inicio.'
    : 'La vigencia empieza cuando las activás, no antes.'

  const esimUnits = data.esims.map((esim) => {
    const parsed = parseActivationString(esim.activationString)
    const smdp = parsed.ok ? parsed.data.smdp : ''
    return blockRow(whiteCard(`
      <table role="presentation" width="100%"><tr>
        <td style="font-family:${FONTS.header};font-size:20px;color:#1C3454;">${esim.label}</td>
        <td align="right" style="font-family:${FONTS.body};font-size:12px;color:#9AA0AC;">Ref. ${esim.orderRef}</td>
      </tr></table>
      <div style="height:20px;"></div>
      ${activationAndQrBlock(esim.confirmationCode, esim.qrUrl ?? 'cid:esim-qr')}
      ${manualInstallBlock(smdp, esim.activationString)}
    `))
  }).join('')

  const body = `
${blockRow(`
  ${eyebrow('TUS ESIMS ESTÁN ACTIVAS')}
  ${h1('Ya podés instalarlas.')}
  <div style="font-family:${FONTS.body};font-size:14.5px;line-height:1.6;color:#33415A;">Ahora sí: tu conexión ya está lista para acompañarte.</div>
`, '24px 40px 20px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-final.jpg`, 'Pasaporte, anteojos de sol, teléfono con eSIM Ruta34 en pantalla y café sobre una mesa, con ventanal de aeropuerto de fondo', 280))}
${blockRow(bodyText(`
  <div style="margin-bottom:10px;">Hola, ${data.customerName}.</div>
  <div style="margin-bottom:10px;">${greetingBody}</div>
  <div style="font-weight:700;color:#1C3454;">Asigná cada eSIM a una persona o dispositivo y mantené esa numeración durante la instalación.</div>
`))}
${esimUnits}
${blockRow(howToInstallBlock())}
${blockRow(whenConnectedBlock())}
${blockRow(italicNote(vigenciaTitle, vigenciaText))}
${blockRow(italicNote('¿Querés evitar posibles cargos en tu SIM habitual?', 'Desactivá los datos móviles de tu SIM habitual. Podés mantener esa SIM encendida.'))}
${blockRow(sharedSupportBlock(), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: 'Tus eSIMs · Europa', bodyHtml: body }),
  }
}

// ── B2C: Recordatorio 24h antes de una activación programada ──────────────────
//
// Reproduce "Ruta34 Email3 RecordatorioActivacion.dc.html". El master
// mantiene copy singular sin importar si el grupo del recordatorio tiene
// una o varias eSIMs ("el CTA no cambia" — spec note del master): lo único
// que varía con multi-eSIM es qué codifica rescheduleUrl (?ref=&token= vs
// ?rows=...), nunca el texto visible. orderRef acá es el de referencia del
// grupo (primero en orden canónico), para la línea "Pedido X" del bloque
// de soporte.
export function emailRecordatorioActivacion(data: {
  customerName: string
  orderRef: string
  planName: string
  activationDate: string
  rescheduleUrl?: string
}) {
  const subject = `Mañana recibís tu eSIM RUTA34 — ${data.activationDate}`

  const rescheduleSection = data.rescheduleUrl
    ? blockRow(`
        <div style="font-family:${FONTS.body};font-size:14px;line-height:1.55;color:#33415A;margin-bottom:16px;">Si cambiaron tus planes, todavía podés reprogramar la activación.</div>
        ${ctaButtonOutline("Reprogramar activación", data.rescheduleUrl)}
      `)
    : blockRow(`
        <div style="font-family:${FONTS.body};font-size:14px;line-height:1.55;color:#33415A;">Si necesitás cambiar la fecha, <a href="${SUPPORT_URL}" style="color:#C79A3E;font-weight:700;">escribinos</a>.</div>
      `)

  const body = `
${blockRow(`
  ${eyebrow('ACTIVACIÓN · MAÑANA')}
  ${h1('Mañana activamos tu eSIM.')}
`, '8px 40px 22px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-email3.jpg`, 'Persona terminando de preparar una valija abierta sobre la cama, con ropa doblada, camisa azul, anteojos de sol y neceser alrededor'), '0 40px 28px')}
${blockRow(bodyText(`
  <div style="margin-bottom:10px;">Hola, ${data.customerName}.</div>
  <div>Mañana, ${data.activationDate}, activamos tu <b style="color:#1C3454;">eSIM ${data.planName}</b> y te la enviamos por email.</div>
`), '0 40px 24px')}
${blockRow(iconValueCard(ICONS.calendar, 'FECHA DE ACTIVACIÓN', `<div style="font-family:${FONTS.header};font-size:22px;line-height:1.2;color:#1C3454;">${data.activationDate}</div>`))}
${blockRow(`<table role="presentation" width="100%" style="background:#E7EDF3;border-radius:18px;"><tr><td style="padding:22px 28px;">
  <table role="presentation" width="100%"><tr>
    <td width="24" valign="middle"><table role="presentation" width="24" height="24" style="background:#C79A3E;border-radius:50%;"><tr><td align="center">${CHECK_ICON_SVG}</td></tr></table></td>
    <td style="padding-left:14px;font-family:${FONTS.header};font-size:18px;color:#1C3454;line-height:1.3;">Si tus planes siguen igual, no necesit&aacute;s hacer nada.</td>
  </tr></table>
</td></tr></table>`)}
${rescheduleSection}
${blockRow(`<div style="border-top:1px solid #C79A3E;padding-top:16px;"><div style="font-family:${FONTS.body};font-size:13.5px;line-height:1.6;color:#5B6579;">La vigencia empieza cuando activamos tu eSIM.</div></div>`)}
${blockRow(sharedSupportBlock(data.orderRef), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: 'Tu eSIM · Europa', bodyHtml: body }),
  }
}

// ── B2C: Confirmación de cambio de fecha de activación ────────────────────────
//
// Reproduce "Ruta34 Email4 Reprogramacion.dc.html". Tres estados aprobados
// (FASE 4B §11):
//   SINGLE          — affectedEsims ausente.
//   MULTI · TODAS    — affectedEsims presente, isPartialSelection falso/ausente.
//   MULTI · SELECCIÓN — affectedEsims presente + isPartialSelection true,
//                        agrega "El resto de tus eSIMs mantiene su fecha
//                        de activación." (copy aprobado literalmente).
// Subject/preheader copiados literalmente de lo aprobado. No hay
// previousActivationDate (el master lo descarta explícitamente) ni
// reassurance adicional. Fallback sin rescheduleUrl: oculta el CTA y
// reutiliza el mismo patrón aprobado que Email 3.
export function emailFechaReprogramada(data: {
  customerName: string
  orderRef: string
  planName: string
  newActivationDate: string
  rescheduleUrl?: string
  affectedEsims?: Array<{ label: string; orderRef: string }>
  isPartialSelection?: boolean
}) {
  const isMulti = !!data.affectedEsims && data.affectedEsims.length > 0
  const affectedCount = data.affectedEsims?.length ?? 1

  const subject = isMulti
    ? `Actualizamos la fecha de tus eSIMs Ruta34`
    : `Actualizamos la fecha de tu eSIM Ruta34`

  const preheader = affectedCount === 1
    ? `La activaremos el ${data.newActivationDate}.`
    : `Las activaremos el ${data.newActivationDate}.`

  const dateCardIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#1C3454" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="#1C3454" stroke-width="1.8" stroke-linecap="round"/><path d="M8.5 15l2.2 2.2 4.8-4.7" stroke="#C79A3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

  const affectedList = isMulti
    ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(199,154,62,0.25);">
        <div style="font-family:${FONTS.body};font-size:10px;font-weight:700;letter-spacing:0.06em;color:#9AA0AC;margin-bottom:6px;">APLICA A</div>
        ${data.affectedEsims!.map((e) => `<div style="font-family:${FONTS.body};font-size:12.5px;line-height:1.7;color:#5B6579;">${e.label} &middot; Ref. <span style="font-weight:700;color:#1C3454;font-family:monospace;">${e.orderRef}</span></div>`).join("")}
      </div>`
    : ""

  const partialNote = data.isPartialSelection
    ? blockRow(`<div style="font-family:${FONTS.body};font-size:13px;line-height:1.55;color:#5B6579;">El resto de tus eSIMs mantiene su fecha de activaci&oacute;n.</div>`)
    : ""

  const rescheduleSection = data.rescheduleUrl
    ? blockRow(`
        <div style="font-family:${FONTS.body};font-size:14px;line-height:1.55;color:#33415A;margin-bottom:16px;">Cuando est&eacute; lista, te la enviaremos por email con todo lo necesario para instalarla.</div>
        ${ctaButtonOutline("Reprogramar activación", data.rescheduleUrl)}
      `)
    : blockRow(`<div style="font-family:${FONTS.body};font-size:14px;line-height:1.55;color:#33415A;">Si necesit&aacute;s cambiar la fecha, <a href="${SUPPORT_URL}" style="color:#C79A3E;font-weight:700;">escribinos</a>.</div>`)

  const body = `
${blockRow(`
  ${eyebrow('ACTIVACIÓN · FECHA ACTUALIZADA')}
  ${h1(isMulti ? 'Actualizamos la fecha de tus eSIMs.' : 'Actualizamos la fecha de tu eSIM.')}
`, '8px 40px 22px')}
${blockRow(heroImage(`${siteBaseUrl()}/email/ruta34-hero-email4.jpg`, 'Persona marcando una nueva fecha en una agenda de papel, con una flecha dorada desde la fecha anterior; al fondo, una valija navy lista para el viaje'), '0 40px 28px')}
${blockRow(bodyText(`
  <div style="margin-bottom:8px;">Hola, ${data.customerName}.</div>
  <div>Listo. Cambiamos la fecha de activaci&oacute;n de ${isMulti ? `tus eSIMs` : `tu eSIM`} <b style="color:#1C3454;">${data.planName}</b>.</div>
`), '0 40px 14px')}
${blockRow(`<table role="presentation" width="100%" style="background:#FFFFFF;border:1px solid #C79A3E;border-radius:18px;"><tr><td style="padding:22px 28px;">
  <table role="presentation" width="100%"><tr>
    <td width="36" valign="top"><table role="presentation" width="36" height="36" style="background:#EFE6D2;border-radius:50%;"><tr><td align="center">${dateCardIcon}</td></tr></table></td>
    <td style="padding-left:14px;">
      <div style="font-family:${FONTS.body};font-size:10.5px;font-weight:700;letter-spacing:0.08em;color:#1C3454;margin-bottom:3px;"><span style="color:#A97F2E;">NUEVA</span> FECHA DE ACTIVACIÓN</div>
      <div style="font-family:${FONTS.header};font-size:22px;line-height:1.2;color:#1C3454;">${data.newActivationDate}</div>
    </td>
  </tr></table>
  ${affectedList}
</td></tr></table>`)}
${partialNote}
${rescheduleSection}
${blockRow(`<div style="border-top:1px solid #C79A3E;padding-top:16px;"><div style="font-family:${FONTS.body};font-size:13.5px;line-height:1.6;color:#5B6579;">${isMulti ? 'La vigencia empieza cuando activamos tus eSIMs.' : 'La vigencia empieza cuando activamos tu eSIM.'}</div></div>`)}
${blockRow(sharedSupportBlock(isMulti ? undefined : data.orderRef), '0 40px 32px')}`

  return {
    subject,
    html: emailDocument({ title: subject, headerRight: isMulti ? 'Tus eSIMs · Europa' : 'Tu eSIM · Europa', bodyHtml: body, preheader }),
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
