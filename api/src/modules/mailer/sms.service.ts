import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendWasherCredentials(params: {
    phone: string;
    name: string;
    tempPassword: string;
  }) {
    const { phone, name, tempPassword } = params;

    const message =
      `Bienvenue ${name} ! Votre candidature Washapp a été validée.\n` +
      `Connectez-vous sur l'app Washapp Washer avec :\n` +
      `📱 Tel : ${phone}\n` +
      `🔑 MDP : ${tempPassword}\n` +
      `Changez votre mot de passe à la première connexion.`;

    // Africa's Talking (principal pour CI/West Africa)
    if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
      return this.sendViaAfricasTalking(phone, message);
    }

    // Twilio fallback
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return this.sendViaTwilio(phone, message);
    }

    this.logger.warn('Aucun fournisseur SMS configuré — SMS non envoyé');
    return { sent: false, reason: 'Fournisseur SMS non configuré' };
  }

  private normalizePhone(phone: string): string {
    // Normalise vers format international +225XXXXXXXX pour CI
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('225')) return `+${cleaned}`;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `+225${cleaned.slice(1)}`;
    if (cleaned.length === 10) return `+225${cleaned}`;
    return `+${cleaned}`;
  }

  private async sendViaAfricasTalking(phone: string, message: string) {
    try {
      const to = this.normalizePhone(phone);
      const params = new URLSearchParams({
        username: process.env.AT_USERNAME!,
        to,
        message,
        ...(process.env.AT_SENDER_ID ? { from: process.env.AT_SENDER_ID } : {}),
      });

      const res = await axios.post(
        'https://api.africastalking.com/version1/messaging',
        params.toString(),
        {
          headers: {
            apiKey: process.env.AT_API_KEY!,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log(`SMS Africa's Talking envoyé à ${to}: ${JSON.stringify(res.data)}`);
      return { sent: true, provider: 'africastalking' };
    } catch (e: any) {
      this.logger.error(`Erreur SMS Africa's Talking: ${e.message}`);
      return { sent: false, reason: e.message };
    }
  }

  private async sendViaTwilio(phone: string, message: string) {
    try {
      const to = this.normalizePhone(phone);
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const from = process.env.TWILIO_PHONE_NUMBER!;

      const params = new URLSearchParams({ To: to, From: from, Body: message });
      const res = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params.toString(),
        {
          auth: { username: accountSid, password: authToken },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      this.logger.log(`SMS Twilio envoyé à ${to}`);
      return { sent: true, provider: 'twilio' };
    } catch (e: any) {
      this.logger.error(`Erreur SMS Twilio: ${e.message}`);
      return { sent: false, reason: e.message };
    }
  }
}
