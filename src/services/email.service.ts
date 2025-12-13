// src/services/email.service.ts
export class EmailService {
  static async sendVerificationCode(email: string, code: string) {
    const useMock = process.env.USE_MOCK_EMAIL === 'true'
    
    // || process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST;

    if (useMock) {
      // Просто логируем код в консоль для разработки
      console.log(`📧 [DEV] Код подтверждения для ${email}: ${code}`);
      console.log(`📧 Чтобы завершить регистрацию, введите код: ${code}`);
      return;
    }

    // Реальная отправка email
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = EmailService.getVerificationEmailHtml(code);
    const text = EmailService.getVerificationEmailText(code);

    try {
      await transporter.sendMail({
        from: '"NextCRM" <noreply@nextcrm.com>',
        to: email,
        subject: 'Код подтверждения регистрации в NextCRM',
        html: html,
        text: text,
        headers: {
          // Headers для избежания спама
          'X-Priority': '3', // Нормальный приоритет
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'NextCRM Mailer',
          'X-Antivirus': 'Checked',
          'List-Unsubscribe': '<mailto:unsubscribe@nextcrm.com>',
        },
        // DKIM подпись (если настроена)
        dkim: {
          domainName: 'nextcrm.com',
          keySelector: 'default',
          privateKey: process.env.DKIM_PRIVATE_KEY || '',
        },
      });
      console.log(`✅ Email отправлен на ${email}`);
    } catch (error) {
      console.error(`❌ Ошибка отправки email на ${email}:`, error);
      throw error;
    }
  }

  private static getVerificationEmailHtml(code: string): string {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Код подтверждения NextCRM</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, div, p, a {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
        }
        
        body {
            font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }
        
        /* Основные цвета из вашей палитры */
        .bg-primary { background-color: #f8fafc; } /* slate-50 */
        .bg-secondary { background-color: #ffffff; } /* white */
        .bg-accent { background-color: #10a4c9; } /* технологичный голубой */
        .text-primary { color: #1e293b; } /* slate-800 */
        .text-secondary { color: #64748b; } /* slate-500 */
        .text-on-accent { color: #ffffff; } /* white */
        .border-color { border-color: #e2e8f0; } /* slate-200 */
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .mobile-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .code-container {
                font-size: 28px !important;
                letter-spacing: 8px !important;
                padding: 20px !important;
            }
            .header {
                padding: 30px 20px !important;
            }
            .content {
                padding: 30px 20px !important;
            }
        }
    </style>
</head>
<body class="bg-primary" style="background-color: #f8fafc; margin: 0; padding: 0;">
    <!--[if mso]>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
    <td style="padding: 20px;">
    <![endif]-->
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <!-- Main container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" class="container" style="max-width: 600px; width: 100%;">
                    
                    <!-- Logo header -->
                    <tr>
                        <td class="header" style="background: linear-gradient(135deg, #10a4c9 0%, #0d8bb8 100%); padding: 40px 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: -0.5px;">NextCRM</h1>
                            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0 0; font-weight: normal;">
                                Современная CRM-система
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content" style="background-color: #ffffff; padding: 40px 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                            
                            <!-- Greeting -->
                            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                                Подтверждение регистрации
                            </h2>
                            
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                Добро пожаловать в NextCRM! Для завершения регистрации и активации вашего аккаунта используйте код подтверждения ниже.
                            </p>
                            
                            
                            <!-- Instructions -->
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                                Скопируйте этот код и вставьте его в поле подтверждения на сайте NextCRM.
                            </p>
                            
<!-- Code container с инструкцией -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
    <tr>
        <td align="center">
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                        border: 2px dashed #10a4c9; 
                        border-radius: 12px; 
                        padding: 32px; 
                        display: inline-block; 
                        text-align: center;
                        position: relative;">
                
                <!-- Код в отдельном элементе для легкого выделения -->
                <div id="verification-code" 
                     style="font-size: 36px; 
                            font-weight: bold; 
                            letter-spacing: 12px; 
                            color: #10a4c9; 
                            margin: 0; 
                            font-family: 'Courier New', monospace;
                            padding: 10px;
                            background: white;
                            border-radius: 8px;
                            user-select: all;
                            -webkit-user-select: all;
                            -moz-user-select: all;
                            -ms-user-select: all;
                            cursor: text;">
                    ${code}
                </div>
                
                <!-- Инструкция по копированию -->
                <div style="margin-top: 16px;">
                    <p style="color: #64748b; font-size: 14px; margin: 8px 0; line-height: 1.5;">
                        <strong>Как скопировать код:</strong>
                    </p>
                    <p style="color: #64748b; font-size: 12px; margin: 4px 0; line-height: 1.4;">
                        1. Нажмите на код выше<br>
                        2. Выделите весь текст<br>
                        3. Нажмите Ctrl+C (Cmd+C на Mac)<br>
                        4. Вставьте в поле на сайте
                    </p>
                </div>
                
                <!-- Иконка копирования (визуальная подсказка) -->
                <div style="position: absolute; top: -12px; right: -12px; background: #10a4c9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                    📋
                </div>
                
            </div>
        </td>
    </tr>
</table
                            
                            <!-- Safety note -->
                            <div style="background-color: #f8fafc; border-left: 4px solid #10a4c9; padding: 16px; border-radius: 4px; margin: 32px 0 0 0;">
                                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                                    <strong>Важно для безопасности:</strong><br>
                                    • Никогда не передавайте этот код третьим лицам<br>
                                    • Если вы не регистрировались в NextCRM, проигнорируйте это письмо<br>
                                    • Код автоматически станет недействительным через 10 минут
                                </p>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px 40px 40px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                                Это автоматическое сообщение от службы поддержки NextCRM.<br>
                                Пожалуйста, не отвечайте на это письмо.
                            </p>
                            
                            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 16px;">
                                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                                    © ${new Date().getFullYear()} NextCRM. Все права защищены.<br>
                                    <a href="${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/privacy" 
                                       style="color: #10a4c9; text-decoration: none;">Конфиденциальность</a> • 
                                    <a href="${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/terms" 
                                       style="color: #10a4c9; text-decoration: none;">Условия</a> • 
                                    <a href="${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/help" 
                                       style="color: #10a4c9; text-decoration: none;">Помощь</a>
                                </p>
                                
                                <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">
                                    <a href="mailto:support@nextcrm.com" style="color: #10a4c9; text-decoration: none;">support@nextcrm.com</a>
                                </p>
                            </div>
                            
                            <!-- Unsubscribe link (important for spam avoidance) -->
                            <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
                                <a href="${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/unsubscribe" 
                                   style="color: #64748b; text-decoration: underline;">
                                    Отписаться от рассылки
                                </a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
</body>
</html>
    `;
  }

  private static getVerificationEmailText(code: string): string {
    return `
NextCRM - Подтверждение регистрации
======================================

Добро пожаловать в NextCRM!

Для завершения регистрации и активации вашего аккаунта используйте следующий код подтверждения:

${code}

Код действителен в течение 10 минут.

Чтобы подтвердить регистрацию, перейдите по ссылке:
${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/verify

Или введите код на странице подтверждения.

---
Важно для безопасности:
• Никогда не передавайте этот код третьим лицам
• Если вы не регистрировались в NextCRM, проигнорируйте это письмо
• Код автоматически станет недействительным через 10 минут
---

С уважением,
Команда NextCRM

Это автоматическое сообщение. Пожалуйста, не отвечайте на это письмо.

© ${new Date().getFullYear()} NextCRM. Все права защищены.
Конфиденциальность: ${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/privacy
Условия: ${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/terms
Помощь: ${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/help

Отписаться от рассылки: ${process.env.NEXTAUTH_URL || 'https://nextcrm.com'}/unsubscribe
    `;
  }
}
