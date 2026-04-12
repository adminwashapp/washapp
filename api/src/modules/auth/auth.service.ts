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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerClient(dto: RegisterClientDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Ce numéro est déjà utilisé');

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
    if (existing) throw new ConflictException('Ce numéro est déjà utilisé');

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
            transportType: (dto.transportType as any) || 'MOTORBIKE',
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
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
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
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
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
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

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


  // ── Push token ────────────────────────────────────────────────────────────
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

  // ── Email verification ────────────────────────────────────────────────────
  async sendEmailVerification(userId: string) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token, emailVerifyExpires: expiresAt } });
    // In production: send email with token. For MVP: return token.
    return { success: true, _devToken: token };
  }

  async verifyEmail(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    if (!user.emailVerifyToken || user.emailVerifyToken !== token) throw new BadRequestException('Code invalide');
    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) throw new BadRequestException('Code expiré');
    await this.prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null } });
    return { success: true };
  }

  async forgotPassword(dto: { phone?: string; email?: string }) {
    const where: any = dto.phone ? { phone: dto.phone } : { email: dto.email ?? '' };
    const user = await this.prisma.user.findUnique({ where });
    if (!user) return { success: true, message: ''Si ce compte existe, un code vous sera envoye.'' };
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
}
