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

    <!-- Header -->
    <div style="background:#1B2F4E;border-radius:16px 16px 0 0;padding:24px 32px;text-align:left;">
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 1000 240" style="max-width:100%;height:auto;">
        <rect x="30" y="45" width="150" height="150" rx="33.0" fill="#1B2F4E"/>
        <text x="105.0" y="138.0" text-anchor="middle" fill="#C9973A" font-family="'DM Serif Display','Noto Serif Display','DejaVu Serif',serif" font-size="81.0" font-weight="400">34</text>
        <text x="230" y="150" fill="white" font-family="'Plus Jakarta Sans','Noto Sans','DejaVu Sans',sans-serif" font-size="82" font-weight="800" letter-spacing="2">RUTA34</text>
      </svg>
    </div>

    <!-- Body -->
    <div style="background:white;border-radius:0 0 16px 16px;padding:32px;border:1px solid rgba(0,0,0,0.06);border-top:none;">

      <h1 style="font-size:22px;font-weight:900;color:#1B2F4E;margin:0 0 8px;line-height:1.2;">
        ¡Bienvenido, Admin Test!
      </h1>
      <p style="color:#555555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu cuenta de administrador en el portal RUTA34 Telecom está lista. Usa las credenciales abajo para acceder por primera vez.
      </p>

      <!-- Credenciales -->
      <div style="background:#F8F8F8;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #C9973A;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;">
          Credenciales de acceso
        </p>
        <div style="margin-bottom:12px;">
          <p style="margin:0 0 4px;font-size:12px;color:#666;">Email:</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1B2F4E;font-family:monospace;word-break:break-all;">
            jgr_50@hotmail.com
          </p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#666;">Contraseña temporal:</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1B2F4E;font-family:monospace;letter-spacing:1px;">
            TempPass123!
          </p>
        </div>
      </div>

      <!-- Botón de acceso -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://www.esimruta34.com/login" style="display:inline-block;background:#C9973A;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;transition:background 0.2s;">
          Acceder al portal →
        </a>
      </div>

      <!-- Aviso importante -->
      <div style="background:rgba(230,0,0,0.08);border:1px solid rgba(230,0,0,0.25);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
          <strong style="color:#C9973A;">⚠️ Importante:</strong> Al acceder por primera vez, se te pedirá que <strong>establezca una nueva contraseña personal</strong>.
        </p>
      </div>

      <h2 style="font-size:15px;font-weight:700;color:#1B2F4E;margin:0 0 12px;">Qué hacer ahora:</h2>
      <ol style="margin:0 0 24px;padding-left:20px;color:#555555;font-size:14px;line-height:1.8;">
        <li>Haz clic en "Acceder al portal" arriba</li>
        <li>Inicia sesión con tu email y contraseña temporal</li>
        <li>En el siguiente paso, se te pedirá que establezca una nueva contraseña</li>
        <li>Usa una contraseña segura (mín. 8 caracteres, números, mayúsculas)</li>
      </ol>
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

  console.log('✅ Email reenviado exitosamente!');
  console.log('Email ID:', result.data?.id);
  console.log('Con logo RUTA34 corporativo');
} catch (error) {
  console.error('❌ Error:', error.message);
}
