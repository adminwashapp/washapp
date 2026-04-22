import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterClientDto, RegisterWasherDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerClient(dto: RegisterClientDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Ce numero est deja utilise');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: Role.CLIENT,
        clientProfile: { create: {} },
      },
      include: { clientProfile: true },
    });

    return this.generateTokens(user);
  }

  async registerWasher(dto: RegisterWasherDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Ce numero est deja utilise');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: Role.WASHER,
        washerProfile: {
          create: {
            transportType: (['BIKE','SCOOTER','MOTORBIKE'].includes(dto.transportType ?? '') ? dto.transportType as any : 'MOTORBIKE'),
            orangeMoneyNumber: dto.orangeMoneyNumber,
            wallet: { create: {} },
          },
        },
      },
      include: { washerProfile: { include: { wallet: true } } },
    });

    return this.generateTokens(user);
  }

  async loginClient(dto: LoginDto) {
    const where = dto.email ? { email: dto.email } : { phone: dto.phone! };
    const user = await this.prisma.user.findUnique({
      where,
      include: { clientProfile: true },
    });

    if (!user || user.role !== Role.CLIENT) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateTokens(user);
  }

  async loginWasher(dto: LoginDto) {
    const where = dto.email ? { email: dto.email } : { phone: dto.phone! };
    const user = await this.prisma.user.findUnique({
      where,
      include: {
        washerProfile: {
          include: { wallet: true },
        },
      },
    });

    if (!user || user.role !== Role.WASHER) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateTokens(user);
  }

  async loginAdmin(dto: LoginDto) {
    const where = dto.email ? { email: dto.email } : { phone: dto.phone! };
    const user = await this.prisma.user.findUnique({ where });

    if (!user || user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateTokens(user);
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, token: refreshToken },
    });
    return { success: true };
  }

  async savePushToken(userId: string, token: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { pushToken: token } });
    return { success: true };
  }

  async sendPushToUser(userId: string, title: string, body: string, data?: object) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { pushToken: true } });
    if (!user?.pushToken) return;
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: user.pushToken, title, body, data: data ?? {}, sound: 'default', priority: 'high' }),
      });
    } catch { /* non-blocking */ }
  }

  async sendEmailVerification(userId: string) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token, emailVerifyExpires: expiresAt } });
    return { success: true, _devToken: token };
  }

  async verifyEmail(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    if (!user.emailVerifyToken || user.emailVerifyToken !== token) throw new BadRequestException('Code invalide');
    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) throw new BadRequestException('Code expire');
    await this.prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null } });
    return { success: true };
  }

  async forgotPassword(dto: { phone?: string; email?: string }) {
    const where: any = dto.phone ? { phone: dto.phone } : { email: dto.email ?? '' };
    const user = await this.prisma.user.findUnique({ where });
    if (!user) return { success: true, message: 'Si ce compte existe, un code vous sera envoye.' };
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false }, data: { used: true },
    });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.passwordResetToken.create({ data: { userId: user.id, code, expiresAt } });
    return { success: true, message: 'Code envoye', _devCode: code };
  }

  async resetPassword(dto: { phone?: string; email?: string; code: string; newPassword: string }) {
    const where: any = dto.phone ? { phone: dto.phone } : { email: dto.email ?? '' };
    const user = await this.prisma.user.findUnique({ where });
    if (!user) throw new BadRequestException('Compte introuvable');
    const token = await this.prisma.passwordResetToken.findFirst({
      where: { userId: user.id, code: dto.code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!token) throw new BadRequestException('Code invalide ou expire');
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await this.prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } });
    return { success: true, message: 'Mot de passe mis a jour' };
  }

  // ── Washer OTP Login ──────────────────────────────────────────────────────

  async washerRequestOtp(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, role: 'WASHER' },
      include: { washerProfile: true },
    });
    if (!user) throw new BadRequestException('Aucun compte washer trouve pour cet email');
    if (!user.washerProfile?.isApproved) throw new BadRequestException('Votre compte nest pas encore approuve par ladmin');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({ where: { id: user.id }, data: { otpCode: code, otpExpiry: expiry } });
    await this.sendOtpEmail(user.email!, user.name, code);
    return { message: 'Code envoye sur votre email' };
  }

  async washerVerifyOtp(email: string, code: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, role: 'WASHER' },
      include: { washerProfile: true },
    });
    if (!user || !user.otpCode || !user.otpExpiry) throw new UnauthorizedException('Code invalide');
    if (user.otpCode !== code) throw new UnauthorizedException('Code incorrect');
    if (new Date() > user.otpExpiry) throw new UnauthorizedException('Code expire');

    await this.prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiry: null } });

    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, washerProfile: user.washerProfile },
    };
  }

  private async sendOtpEmail(email: string, name: string, code: string) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[OTP] RESEND_API_KEY non configure, code:', code);
      return;
    }
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'Washapp <onboarding@resend.dev>',
          to: [email],
          subject: 'Votre code de connexion Washapp',
          html: `<div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;background:#f9fafb;border-radius:16px">
            <h2 style="color:#1558f5;margin-bottom:8px">Washapp</h2>
            <p>Bonjour ${name},</p>
            <p>Votre code de connexion Washer :</p>
            <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#1558f5;text-align:center;padding:20px;background:#fff;border-radius:12px;margin:20px 0;border:2px solid #e0e7ff">${code}</div>
            <p style="color:#666;font-size:13px">Ce code expire dans <strong>10 minutes</strong>. Ne le partagez jamais.</p>
          </div>`,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err: any) {
      console.error('[OTP] Erreur envoi email:', err?.response?.data ?? err.message);
    }
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, role: user.role, phone: user.phone };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }

  // TEMP: Reset admin password
  async resetAdminPassword() {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await this.prisma.user.updateMany({
      where: { 
        OR: [
          { email: 'adminwashapp@gmail.com' },
          { email: 'support@washapp.ci' },
          { role: 'ADMIN' }
        ]
      },
      data: { passwordHash },
    });
    return { message: 'Password reset to: Admin123! for all admin accounts' };
  }

  // TEMP: List admin accounts
  async listAdminAccounts() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true },
    });
    return { admins };
  }
}