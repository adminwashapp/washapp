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
      data: { status: status as any, ...(adminNote !== undefined && adminNote !== null ? { adminNote } : {}) },
    });
    return updated;
  }

  async validateAndCreateAccount(id: string) {
    const app = await this.findOne(id);
    // Mettre à jour le statut
    await this.prisma.washerApplication.update({
      where: { id: app.id },
      data: { status: 'VALIDATED' as any },
    });
    // Créer le compte
    try {
      const createdAccount = await this.createWasherAccount(app);
      // Envoyer les credentials dès qu'on a un tempPassword (nouveau compte ou réactivation)
      if (createdAccount.tempPassword) {
        const notifications = await this.sendCredentials(app, createdAccount.tempPassword);
        return { success: true, washerAccount: { ...createdAccount, notifications } };
      }
      return { success: true, washerAccount: createdAccount };
    } catch (e: any) {
      return { success: true, washerAccount: null, accountError: e.message };
    }
  }

  private normalizeTransportType(value: string): 'BIKE' | 'SCOOTER' | 'MOTORBIKE' {
    const map: Record<string, 'BIKE' | 'SCOOTER' | 'MOTORBIKE'> = {
      MOTORBIKE: 'MOTORBIKE', Moto: 'MOTORBIKE', moto: 'MOTORBIKE',
      SCOOTER: 'SCOOTER', Scooter: 'SCOOTER', scooter: 'SCOOTER',
      BIKE: 'BIKE', Velo: 'BIKE', velo: 'BIKE', Vélo: 'BIKE',
    };
    return map[value] || 'MOTORBIKE';
  }

  private async createWasherAccount(app: any) {
    // Vérifier si un compte existe déjà avec ce téléphone
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: app.phone },
    });

    if (existingUser) {
      const existingWasher = await this.prisma.washerProfile.findFirst({
        where: { userId: existingUser.id },
      });
      if (existingWasher) {
        // Réinitialiser le mot de passe temp et activer le profil
        const digits = existingUser.phone?.replace(/\D/g, '') || '';
        const tempPassword = 'Wash' + digits.slice(-4);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        await this.prisma.user.update({ where: { id: existingUser.id }, data: { passwordHash } });
        await this.prisma.washerProfile.update({
          where: { id: existingWasher.id },
          data: { accountStatus: 'ACTIVE' },
        });
        return { alreadyExists: true, phone: app.phone, tempPassword, name: `${app.firstName} ${app.lastName}` };
      }
      // User existe mais pas de profil washer → créer le profil
      const digits = existingUser.phone?.replace(/\D/g, '') || '';
      const tempPassword = 'Wash' + digits.slice(-4);
      const washerProfile = await this.prisma.washerProfile.create({
        data: {
          userId: existingUser.id,
          transportType: this.normalizeTransportType(app.transportType),
          orangeMoneyNumber: app.waveMoneyNumber || '',
          zoneLabel: app.zone || '',
          accountStatus: 'ACTIVE',
        },
      });
      const existingWallet = await this.prisma.wallet.findFirst({ where: { washerId: washerProfile.id } });
      if (!existingWallet) {
        await this.prisma.wallet.create({
          data: { washerId: washerProfile.id, availableBalance: 0, pendingBalance: 0, currency: 'XOF' },
        });
      }
      return { alreadyExists: false, phone: app.phone, tempPassword, name: `${app.firstName} ${app.lastName}` };
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
        transportType: this.normalizeTransportType(app.transportType),
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
