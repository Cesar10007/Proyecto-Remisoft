import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendPasswordResetEmail(email, token) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, '');

  const resetUrl =
    `${frontendUrl}/reset-password` +
    `?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const text = [
    'Hola',
    '',
    'Recibimos una solicitud para restablecer tu contraseña.',
    '',
    `Restablece tu contraseña aquí: ${resetUrl}`,
    '',
    'Si no solicitaste este cambio, puedes ignorar este correo.',
    '',
    'Saludos,',
    'RemiSoft',
  ].join('\n');

  const html = `
<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#555555;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Restablece tu contraseña de RemiSoft.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;margin:0;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;">
            <tr>
              <td style="padding:42px 38px 24px;text-align:center;">
                <div style="font-size:42px;line-height:1;font-weight:700;letter-spacing:-2px;color:#a53f1d;">
                  Remi<span style="color:#f2aa22;">Soft</span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 38px 34px;">
                <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;color:#171717;">
                  Hola
                </h1>

                <p style="margin:0 0 32px;font-size:18px;line-height:1.6;color:#666666;">
                  Recibimos una solicitud para restablecer tu contraseña.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 38px;">
                  <tr>
                    <td align="center" bgcolor="#171717" style="border-radius:5px;">
                      <a
                        href="${resetUrl}"
                        target="_blank"
                        style="display:inline-block;padding:14px 22px;border-radius:5px;background-color:#171717;color:#ffffff;font-size:16px;font-weight:400;text-decoration:none;"
                      >
                        Restablecer contraseña
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 30px;font-size:17px;line-height:1.6;color:#666666;">
                  Si no solicitaste este cambio, puedes ignorar este correo.
                </p>

                <p style="margin:0;font-size:17px;line-height:1.6;color:#666666;">
                  Saludos,<br />
                  RemiSoft
                </p>

                <div style="height:1px;margin:32px 0;background-color:#dddddd;"></div>

                <p style="margin:0;font-size:15px;line-height:1.6;color:#666666;">
                  Si tienes problemas para hacer clic en el botón, copia y pega esta URL en tu navegador:
                </p>

                <p style="margin:8px 0 0;word-break:break-all;font-size:14px;line-height:1.5;">
                  <a href="${resetUrl}" target="_blank" style="color:#245f9e;text-decoration:underline;">
                    ${resetUrl}
                  </a>
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