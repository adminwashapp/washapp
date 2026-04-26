import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { SmsService } from '../mailer/sms.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerService,
    private sms: SmsService,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    zone: string;
    transportType: string;
    availability: string;
    experience?: string;
    hasEquipment: boolean;
    waveMoneyNumber?: string;
    preferredPayment?: string;
    profilePhotoUrl?: string;
    idDocumentUrl?: string;
    otherDocumentUrl?: string;
  }) {
    return this.prisma.washerApplication.create({ data });
  }

  async findAll(status?: string) {
    return this.prisma.washerApplication.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.washerApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Candidature introuvable');
    return app;
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const app = await this.findOne(id);

    const updated = await this.prisma.washerApplication.update({
      where: { id: app.id },
      data: { status: status as any, ...(adminNote !== undefined ? { adminNote } : {}) },
    });

    // Quand la candidature est validée, créer le compte washer automatiquement
    if (status === 'VALIDATED') {
      const createdAccount = await this.createWasherAccount(app);
      // Envoyer les credentials si nouveau compte
      if (!createdAccount.alreadyExists && createdAccount.tempPassword) {
        const notifications = await this.sendCredentials(app, createdAccount.tempPassword);
        return { ...updated, washerAccount: { ...createdAccount, notifications } };
      }
      return { ...updated, washerAccount: createdAccount };
    }

    return updated;
  }

  private async createWasherAccount(app: any) {
    // Vérifier si un compte existe déjà avec ce téléphone
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: app.phone },
    });

    if (existingUser) {
      // Compte déjà existant — juste activer le profil washer si besoin
      const existingWasher = await this.prisma.washerProfile.findFirst({
        where: { userId: existingUser.id },
      });
      if (existingWasher) {
        await this.prisma.washerProfile.update({
          where: { id: existingWasher.id },
          data: { accountStatus: 'ACTIVE' },
        });
        return { alreadyExists: true, phone: app.phone };
      }
    }

    // Générer mot de passe temporaire : Wash + 4 derniers chiffres du téléphone
    const digits = app.phone.replace(/\D/g, '');
    const tempPassword = 'Wash' + digits.slice(-4);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Créer le User
    const user = await this.prisma.user.create({
      data: {
        name: `${app.firstName} ${app.lastName}`,
        phone: app.phone,
        email: app.email || null,
        passwordHash,
        role: 'WASHER',
        isPhoneVerified: true,
      },
    });

    // Créer le WasherProfile
    const washerProfile = await this.prisma.washerProfile.create({
      data: {
        userId: user.id,
        transportType: (app.transportType as any) || 'MOTORBIKE',
        orangeMoneyNumber: app.waveMoneyNumber || '',
        zoneLabel: app.zone || '',
        accountStatus: 'ACTIVE',
      },
    });

    // Créer le Wallet
    await this.prisma.wallet.create({
      data: {
        washerId: washerProfile.id,
        availableBalance: 0,
        pendingBalance: 0,
        currency: 'XOF',
      },
    });

    return {
      alreadyExists: false,
      phone: app.phone,
      tempPassword,
      name: `${app.firstName} ${app.lastName}`,
    };
  }

  private async sendCredentials(app: any, tempPassword: string) {
    const name = `${app.firstName} ${app.lastName}`;

    // SMS (priorité)
    const smsResult = await this.sms.sendWasherCredentials({
      phone: app.phone,
      name,
      tempPassword,
    });

    // Email si disponible
    let emailResult = { sent: false, reason: 'Pas d\'email' };
    if (app.email) {
      emailResult = await this.mailer.sendWasherCredentials({
        email: app.email,
        name,
        phone: app.phone,
        tempPassword,
      });
    }

    return { sms: smsResult, email: emailResult };
  }

  async delete(id: string) {
    await this.prisma.washerApplication.delete({ where: { id } });
    return { success: true };
  }
}
