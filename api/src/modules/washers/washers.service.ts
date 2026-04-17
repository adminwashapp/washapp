import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WashersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(washerProfileId: string) {
    const profile = await this.prisma.washerProfile.findUnique({
      where: { id: washerProfileId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        wallet: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        reservationStats: true,
      },
    });

    if (!profile) throw new NotFoundException('Profil introuvable');
    return profile;
  }

  async getReservations(washerProfileId: string) {
    return this.prisma.mission.findMany({
      where: {
        washerId: washerProfileId,
        missionType: 'BOOKING',
        status: { notIn: ['CANCELLED', 'VALIDATED'] },
      },
      include: {
        client: { include: { user: { select: { name: true, phone: true } } } },
        vehicle: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getEarnings(washerProfileId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { washerId: washerProfileId },
    });

    const totalEarned = await this.prisma.ledgerEntry.aggregate({
      where: {
        washerId: washerProfileId,
        type: 'RELEASE_TO_WASHER',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { washerId: washerProfileId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      wallet,
      totalEarned: totalEarned._sum.amount || 0,
      withdrawals,
    };
  }


  async getStatsToday(washerProfileId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [missions, earnings] = await Promise.all([
      this.prisma.mission.count({
        where: {
          washerId: washerProfileId,
          status: 'COMPLETED',
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: {
          washerId: washerProfileId,
          type: 'RELEASE_TO_WASHER',
          status: 'COMPLETED',
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      todayMissions: missions,
      todayEarnings: earnings._sum.amount || 0,
    };
  }
  async uploadMissionPhoto(
    missionId: string,
    washerProfileId: string,
    photoType: 'BEFORE' | 'AFTER',
    filePath: string,
    fileUrl: string,
  ) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, washerId: washerProfileId },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');

    const existingPhoto = await this.prisma.missionPhoto.findFirst({
      where: { missionId, washerId: washerProfileId, type: photoType },
    });

    if (existingPhoto) {
      return this.prisma.missionPhoto.update({
        where: { id: existingPhoto.id },
        data: { url: fileUrl },
      });
    }

    return this.prisma.missionPhoto.create({
      data: {
        missionId,
        washerId: washerProfileId,
        type: photoType,
        url: fileUrl,
      },
    });
  }

  async cancelReservation(missionId: string, washerProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, washerId: washerProfileId, missionType: 'BOOKING' },
    });

    if (!mission) throw new NotFoundException('Réservation introuvable');

    if (mission.status === 'IN_PROGRESS') {
      throw new BadRequestException('Impossible d\'annuler une mission en cours');
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await this.prisma.$transaction([
      this.prisma.mission.update({
        where: { id: missionId },
        data: { status: 'CANCELLED', washerId: null },
      }),
      this.prisma.washerReservationStat.upsert({
        where: { washerId_monthKey: { washerId: washerProfileId, monthKey } },
        create: { washerId: washerProfileId, monthKey, cancellationsCount: 1 },
        update: { cancellationsCount: { increment: 1 } },
      }),
    ]);

    const stat = await this.prisma.washerReservationStat.findUnique({
      where: { washerId_monthKey: { washerId: washerProfileId, monthKey } },
    });

    if (stat && stat.cancellationsCount >= 2) {
      await this.prisma.washerReservationStat.update({
        where: { washerId_monthKey: { washerId: washerProfileId, monthKey } },
        data: { reservationsBlocked: true },
      });
    }

    return { success: true };
  }

  async updateFcmToken(washerProfileId: string, fcmToken: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { fcmToken },
    });
  }

  async getActiveMission(washerProfileId: string) {
    return this.prisma.mission.findFirst({
      where: {
        washerId: washerProfileId,
        status: { in: ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] },
      },
      include: {
        client: { include: { user: { select: { name: true, phone: true } } } },
        vehicle: true,
        photos: true,
      },
    });
  }
}
