import nodemailer from 'nodemailer';

export class EmailService {
  static async sendVerificationCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"NextCRM" <noreply@nextcrm.com>',
      to: email,
      subject: 'Код подтверждения регистрации',
      html: `Ваш код подтверждения: <strong>${code}</strong>`,
    });
  }
}
