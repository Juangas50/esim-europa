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
<body style="margin:0;padding:0;background:#0C0C0C;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#E60000;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#181818;border:1px solid #2A2A2A;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:22px;font-weight:800;margin-bottom:8px;">✅ Pedido recibido</div>
      <div style="color:#7A7A7A;font-size:14px;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.sellerName}</strong>, tu pedido fue registrado correctamente.
      </div>
    </div>

    <div style="background:#181818;border:1px solid #2A2A2A;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:11px;color:#7A7A7A;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Detalle del pedido</div>

      ${row('Referencia', `<span style="font-family:monospace;color:#6EC1E4;">${data.orderRef}</span>`)}
      ${row('Cliente', `${data.customerName} ${data.customerLastname}`)}
      ${row('Tarifa', data.tariffName)}
      ${row('Tipo', data.type === 'prepago' ? 'eSIM Prepago' : 'eSIM DataOnly')}
      ${row('Activación', isDataOnly ? 'El cliente activa cuando quiera (60 días)' : isScheduled ? `Programada para el ${data.activationDate}` : 'Inmediata — el equipo RUTA34 la procesa hoy')}
    </div>

    ${isScheduled ? `
    <div style="background:rgba(110,193,228,0.08);border:1px solid rgba(110,193,228,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      📆 <strong style="color:#fff;">Activación programada.</strong> El cliente recibirá un email de aviso ahora. El QR se envía el ${data.activationDate}.
    </div>` : ''}

    ${isDataOnly ? `
    <div style="background:rgba(110,193,228,0.08);border:1px solid rgba(110,193,228,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      📡 <strong style="color:#fff;">eSIM DataOnly.</strong> El cliente tiene 60 días para activar el QR. El plan no empieza hasta que lo escanee.
    </div>` : ''}

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #2A2A2A;">
      RUTA34 Telecom · Portal de Partners<br>
      <span style="color:#E60000;">ruta34telecom.com</span>
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
<body style="margin:0;padding:0;background:#0C0C0C;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#E60000;">34</span>
      <div style="font-size:9px;letter-spacing:6px;color:#7A7A7A;margin-top:2px;">TELECOM</div>
    </div>

    <div style="background:#181818;border:1px solid #2A2A2A;border-radius:14px;padding:28px;margin-bottom:20px;">
      <div style="font-size:22px;font-weight:800;margin-bottom:8px;">📱 Tu eSIM está confirmada</div>
      <div style="color:#7A7A7A;font-size:14px;line-height:1.6;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, tu eSIM para viajar a Europa está lista.
      </div>
    </div>

    <div style="background:#181818;border:1px solid #2A2A2A;border-radius:14px;padding:28px;margin-bottom:20px;">
      ${row('Plan', data.tariffName)}
      ${row('Tipo', data.type === 'prepago' ? 'eSIM Prepago (28 días desde activación)' : 'DataOnly')}
      ${row('Recibís el QR el', `<strong style="color:#6EC1E4;">${data.activationDate}</strong>`)}
    </div>

    <div style="background:rgba(230,0,0,0.08);border:1px solid rgba(230,0,0,0.25);border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;color:#AAAAAA;line-height:1.6;">
      ⚠️ <strong style="color:#fff;">Importante:</strong> El plan empieza a correr desde el momento de activación. Te recomendamos activar la eSIM cuando llegués a Europa.
    </div>

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #2A2A2A;">
      RUTA34 Telecom · <span style="color:#E60000;">ruta34telecom.com</span>
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
<body style="margin:0;padding:0;background:#0C0C0C;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:28px;font-weight:900;">RUTA</span><span style="font-size:28px;font-weight:900;color:#E60000;">34</span>
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
      <div style="background:#181818;border:1px solid #2A2A2A;border-radius:10px;padding:14px 18px;margin-bottom:8px;display:flex;justify-content:space-between;">
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
      <div style="background:#181818;border:1px solid #2A2A2A;border-radius:10px;padding:14px 18px;margin-bottom:8px;">
        <div style="font-weight:700;font-size:13px;">${o.customer_name} ${o.customer_lastname}</div>
        <div style="color:#7A7A7A;font-size:12px;margin-top:3px;">${o.order_ref} · ${o.tariffs?.name || ''} · ${o.customer_email}</div>
      </div>`).join('')}
    </div>` : ''}

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos"
        style="background:#E60000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:700;font-size:14px;display:inline-block;">
        Gestionar pedidos →
      </a>
    </div>

    <div style="color:#7A7A7A;font-size:12px;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #2A2A2A;">
      RUTA34 Telecom · Alerta automática diaria
    </div>
  </div>
</body>
</html>`
  }
}

function row(label: string, value: string) {
  return `
  <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;">
    <span style="color:#7A7A7A;">${label}</span>
    <span style="font-weight:600;text-align:right;">${value}</span>
  </div>`
}