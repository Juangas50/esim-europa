import { Resend } from 'resend';

const resend = new Resend('re_2RKJ3xs1_AZ4wUBWEY41AbE18XuFxvBNT');

const emailTemplate = {
  subject: '🔐 Tu acceso de administrador RUTA34 está listo',
  html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Acceso Admin - RUTA34 Telecom</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F8F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#1B2F4E;border-radius:16px 16px 0 0;padding:24px 32px;text-align:left;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="font-size:24px;">🛡️</div>
        <span style="color:white;font-weight:700;font-size:15px;">RUTA34 Admin</span>
      </div>
    </div>
    <div style="background:white;border-radius:0 0 16px 16px;padding:32px;border:1px solid rgba(0,0,0,0.06);border-top:none;">
      <h1 style="font-size:22px;font-weight:900;color:#1B2F4E;margin:0 0 8px;line-height:1.2;">¡Bienvenido, Admin Test!</h1>
      <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 24px;">Tu cuenta de administrador en el portal RUTA34 Telecom está lista.</p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://www.esimruta34.com/login" style="display:inline-block;background:#C9973A;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
          Acceder al portal →
        </a>
      </div>
      <p style="margin:0;font-size:13px;color:#555;">Email: <strong>jgr_50@hotmail.com</strong></p>
    </div>
  </div>
</body>
</html>
  `
};

try {
  const result = await resend.emails.send({
    from: 'RUTA34 Telecom <hola@esimruta34.com>',
    to: 'jgr_50@hotmail.com',
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });

  console.log('✅ Email sent successfully!');
  console.log('Email ID:', result.data?.id);
} catch (error) {
  console.error('❌ Error:', error.message);
}
