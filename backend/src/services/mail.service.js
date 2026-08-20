import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email, token) {
  const frontendUrl = (process.env.FRONTEND_URL ?? '').replace(/\/+$/, '');

  const resetUrl =
    `${frontendUrl}/reset-password` +
    `?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const text = [
    'Hola',
    '',
    'Recibimos una solicitud para restablecer la contraseña de tu cuenta de RemiSoft.',
    '',
    `Puedes restablecer tu contraseña aquí: ${resetUrl}`,
    '',
    'Este enlace expirará en 30 minutos.',
    '',
    'Si no solicitaste este cambio, puedes ignorar este correo de forma segura.',
    '',
    'Saludos,',
    'El equipo de RemiSoft',
  ].join('\n');

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablecer contraseña - RemiSoft</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#555555;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Restablece de forma segura tu contraseña de RemiSoft.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f3f4f6;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background-color:#ffffff;border:1px solid #e3e3e3;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.06);overflow:hidden;">
            <tr>
              <td align="center" style="padding:24px 20px 20px;border-bottom:1px solid #eeeeee;background-color:#ffffff;">
                <div style="font-family:'Syne',Arial,Helvetica,sans-serif;font-size:38px;line-height:1;font-weight:800;letter-spacing:-2px;white-space:nowrap;color:#993c1d;">
                  <span style="color:#993c1d;">Remi</span><span style="color:#f2a51a;">Soft</span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 38px 34px;">
                <h1 style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:25px;line-height:1.3;font-weight:700;color:#252525;">
                  Restablecer contraseña
                </h1>

                <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.65;color:#606060;">Hola,</p>

                <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.65;color:#606060;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta de RemiSoft.
                </p>

                <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.65;color:#606060;">
                  Haz clic en el siguiente botón para crear una nueva contraseña:
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 30px;">
                  <tr>
                    <td align="center" bgcolor="#df5a2f" style="border-radius:7px;background-color:#df5a2f;">
                      <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:15px 26px;border-radius:7px;background-color:#df5a2f;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;">
                        Restablecer mi contraseña
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#777777;">
                  Por razones de seguridad, este enlace expirará en <strong>30 minutos</strong>.
                </p>

                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#777777;">
                  Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no se modificará.
                </p>

                <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#777777;">
                  Saludos,<br />
                  <strong style="color:#555555;">El equipo de RemiSoft</strong>
                </p>

                <div style="height:1px;margin:30px 0;background-color:#e5e5e5;"></div>

                <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888888;">
                  Si el botón no funciona, copia y pega esta dirección en tu navegador:
                </p>

                <div style="padding:12px;background-color:#f8f8f8;border:1px solid #eeeeee;border-radius:6px;">
                  <a href="${resetUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#245f9e;text-decoration:underline;word-break:break-all;">
                    ${resetUrl}
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:18px 24px;background-color:#fafafa;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#999999;">
                  © 2026 RemiSoft. Todos los derechos reservados.
                </p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#999999;">
                  Este es un mensaje automático. Por favor, no respondas a este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Restablecer contraseña - RemiSoft',
    text,
    html,
  });
}