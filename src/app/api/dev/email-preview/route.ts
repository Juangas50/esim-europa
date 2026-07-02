import {
  emailConfirmacionB2C,
  emailAvisoClienteProgramado,
  emailEntregaB2C,
  emailEntregaMultiple
} from '@/lib/email/templates'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'confirmacion'

  // Datos de ejemplo
  const exampleData = {
    confirmacion: {
      customerName: 'Juan García',
      orderRef: 'ORD-2026-07-001',
      planName: 'Europa 10 GB',
      planGB: 10,
      planDays: 30,
      planType: 'prepago' as const,
      amountUSD: 29.99
    },
    aviso: {
      customerName: 'Juan García',
      tariffName: 'Europa 10 GB',
      activationDate: '2026-07-15',
      type: 'prepago'
    },
    entrega: {
      customerName: 'Juan García',
      orderRef: 'ORD-2026-07-001',
      planName: 'Europa 10 GB',
      planGB: 10,
      planDays: 30,
      planType: 'prepago' as const,
      activationString: '1$eu-prod$ABC123DEF456',
      confirmationCode: '628471',
      amountUSD: 29.99,
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1%24eu-prod%24ABC123DEF456'
    },
    entregaMultiple: {
      customerName: 'Juan García',
      totalCount: 3,
      planName: 'Europa 10 GB',
      planGB: 10,
      planDays: 30,
      planType: 'prepago' as const,
      amountUSD: 89.97,
      esims: [
        {
          label: 'eSIM 1 de 3',
          orderRef: 'ORD-2026-07-001-A',
          activationString: '1$eu-prod$ABC123DEF456',
          confirmationCode: '628471',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1%24eu-prod%24ABC123DEF456'
        },
        {
          label: 'eSIM 2 de 3',
          orderRef: 'ORD-2026-07-001-B',
          activationString: '1$eu-prod$XYZ789UVW012',
          confirmationCode: '837264',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1%24eu-prod%24XYZ789UVW012'
        },
        {
          label: 'eSIM 3 de 3',
          orderRef: 'ORD-2026-07-001-C',
          activationString: '1$eu-prod$PQR345STU678',
          confirmationCode: '495182',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=1%24eu-prod%24PQR345STU678'
        }
      ]
    }
  }

  let emailHtml = ''
  let subject = ''

  switch (type) {
    case 'confirmacion': {
      const result = emailConfirmacionB2C(exampleData.confirmacion)
      subject = result.subject
      emailHtml = result.html
      break
    }
    case 'aviso': {
      const result = emailAvisoClienteProgramado(exampleData.aviso)
      subject = result.subject
      emailHtml = result.html
      break
    }
    case 'entrega': {
      const result = emailEntregaB2C(exampleData.entrega)
      subject = result.subject
      emailHtml = result.html
      break
    }
    case 'entrega-multiple': {
      const result = emailEntregaMultiple(exampleData.entregaMultiple)
      subject = result.subject
      emailHtml = result.html
      break
    }
    default:
      return new Response('Invalid type. Use: confirmacion, aviso, entrega, entrega-multiple', { status: 400 })
  }

  // Wrap in a simple preview container
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 20px; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .preview-wrapper { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .preview-header { background: #1B2F4E; color: white; padding: 16px; border-radius: 6px; margin-bottom: 20px; }
    .preview-header h1 { margin: 0; font-size: 18px; }
    .preview-header p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
    .preview-links { margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 6px; }
    .preview-links a { display: inline-block; margin-right: 12px; padding: 8px 12px; background: #C9973A; color: white; text-decoration: none; border-radius: 4px; font-size: 13px; }
    .email-container { border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="preview-wrapper">
    <div class="preview-header">
      <h1>📧 ${subject}</h1>
      <p>Tipo: ${type} | Vista previa HTML</p>
    </div>
    <div class="preview-links">
      <strong>Otros emails:</strong>
      <a href="?type=confirmacion">Confirmación B2C</a>
      <a href="?type=aviso">Aviso Programado</a>
      <a href="?type=entrega">Entrega B2C</a>
      <a href="?type=entrega-multiple">Entrega Múltiple</a>
    </div>
    <div class="email-container">
      ${emailHtml}
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
