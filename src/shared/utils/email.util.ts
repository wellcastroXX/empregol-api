import { Resend } from 'resend';
import { env } from '../../config/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, name: string, code: string): Promise<void> {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verifique sua conta — Empregol',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Use o código abaixo para verificar seu e-mail:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                    background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
          ${code}
        </div>
        <p>O código expira em <strong>15 minutos</strong>.</p>
        <p style="color: #888; font-size: 13px;">Se você não criou essa conta, ignore este e-mail.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL ?? 'https://empregol.com.br'}/redefinir-senha?token=${token}`;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Redefinição de senha — Empregol',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Olá, ${name}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #1a73e8; color: #fff;
                  padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Redefinir senha
        </a>
        <p>O link expira em <strong>1 hora</strong>.</p>
        <p style="color: #888; font-size: 13px;">Se você não solicitou isso, ignore este e-mail.</p>
      </div>
    `,
  });
}
