import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWasherCredentials(params: {
    email: string;
    name: string;
    phone: string;
    tempPassword: string;
  }) {
    const { email, name, phone, tempPassword } = params;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('SMTP non configuré — email non envoyé');
      return { sent: false, reason: 'SMTP non configuré' };
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1558f5;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Washapp</h1>
            <p style="color:#a3c4ff;margin:6px 0 0;font-size:14px;">Votre véhicule lavé où que vous soyez</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">Bienvenue ${name} ! 🎉</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
              Votre candidature a été <strong style="color:#1558f5;">validée</strong>. 
              Voici vos informations de connexion pour l'application <strong>Washapp Washer</strong>.
            </p>

            <!-- Credentials box -->
            <div style="background:#f0f5ff;border:2px solid #dbe8ff;border-radius:10px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Vos identifiants</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #dbe8ff;">
                    <span style="color:#888;font-size:14px;">Téléphone</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #dbe8ff;text-align:right;">
                    <strong style="color:#1a1a2e;font-size:15px;">${phone}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#888;font-size:14px;">Mot de passe temporaire</span>
                  </td>
                  <td style="padding:10px 0;text-align:right;">
                    <strong style="color:#1558f5;font-size:18px;background:#e8efff;padding:4px 12px;border-radius:6px;">${tempPassword}</strong>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Warning -->
            <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
              <p style="margin:0;color:#92400e;font-size:13px;">
                ⚠️ <strong>Changez ce mot de passe</strong> dès votre première connexion dans l'application.
              </p>
            </div>

            <!-- Download CTA -->
            <p style="color:#555;font-size:15px;margin:0 0 16px;">Téléchargez l'application <strong>Washapp Washer</strong> et connectez-vous avec votre numéro de téléphone.</p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${process.env.WASHER_APP_DOWNLOAD_URL || 'https://play.google.com'}" 
                 style="display:inline-block;background:#1558f5;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
                📱 Télécharger l'app Washer
              </a>
            </div>

            <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
              En cas de problème, contactez-nous sur WhatsApp ou répondez à cet email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Washapp — Abidjan, Côte d'Ivoire
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `Washapp <${process.env.SMTP_USER}>`,
        to: email,
        subject: '✅ Candidature validée — Vos identifiants Washapp Washer',
        html,
      });
      this.logger.log(`Email credentials envoyé à ${email}`);
      return { sent: true };
    } catch (e: any) {
      this.logger.error(`Erreur envoi email: ${e.message}`);
      return { sent: false, reason: e.message };
    }
  }
}
