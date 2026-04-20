import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MissionStatus, DispatchAttemptStatus } from '@prisma/client';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);
  private readonly instantTimeoutMs: number;
  private readonly bookingTimeoutMs: number;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {
    this.instantTimeoutMs = (parseInt(process.env.INSTANT_DISPATCH_TIMEOUT_SEC || '20')) * 1000;
    this.bookingTimeoutMs = (parseInt(process.env.BOOKING_DISPATCH_TIMEOUT_SEC || '120')) * 1000;
  }

  async dispatchInstant(missionId: string, lat: number, lng: number) {
    this.logger.log(`Dispatch instantané mission ${missionId}`);

    const washers = await this.getEligibleWashers(lat, lng, 'INSTANT');

    if (!washers.length) {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED },
      });
      this.logger.warn(`Aucun washer disponible pour mission ${missionId}`);
      return;
    }

    await this.tryDispatchToWasher(missionId, washers, 0, 'INSTANT');
  }

  async dispatchBooking(
    missionId: string,
    lat: number,
    lng: number,
    scheduledAt: Date,
  ) {
    this.logger.log(`Dispatch réservation mission ${missionId}`);

    const washers = await this.getEligibleWashers(lat, lng, 'BOOKING', scheduledAt);

    if (!washers.length) {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED },
      });
      return;
    }

    await this.tryDispatchToWasher(missionId, washers, 0, 'BOOKING');
  }

  private async getEligibleWashers(
    lat: number,
    lng: number,
    type: 'INSTANT' | 'BOOKING',
    scheduledAt?: Date,
  ) {
    const washers = await this.prisma.washerProfile.findMany({
      where: {
        isOnline: true,
        accountStatus: 'ACTIVE',
        subscriptionStatus: 'ACTIVE',
        location: { isNot: null },
      },
      include: {
        location: true,
        user: { select: { id: true, name: true } },
        wallet: true,
      },
    });

    const now = new Date();

    const eligible = washers.filter((w) => {
      if (!w.location) return false;

      const dist = haversineDistance(lat, lng, w.location.lat, w.location.lng);

      if (dist > 10) return false;

      return true;
    });

    eligible.sort((a, b) => {
      if (type === 'BOOKING') {
        const ratingDiff = b.averageRating - a.averageRating;
        if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      }
      const distA = haversineDistance(lat, lng, a.location!.lat, a.location!.lng);
      const distB = haversineDistance(lat, lng, b.location!.lat, b.location!.lng);
      return distA - distB;
    });

    return eligible;
  }

  private async tryDispatchToWasher(
    missionId: string,
    washers: any[],
    index: number,
    type: 'INSTANT' | 'BOOKING',
  ) {
    if (index >= washers.length) {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED },
      });
      this.logger.warn(`Tous les washers ont refusé/expiré pour mission ${missionId}`);
      return;
    }

    const mission = await this.prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission || mission.status !== MissionStatus.SEARCHING) return;

    const washer = washers[index];
    const timeoutMs = type === 'INSTANT' ? this.instantTimeoutMs : this.bookingTimeoutMs;
    const expiresAt = new Date(Date.now() + timeoutMs);

    await this.prisma.missionDispatchAttempt.create({
      data: {
        missionId,
        washerId: washer.id,
        attemptType: type,
        expiresAt,
        status: DispatchAttemptStatus.PENDING,
      },
    });

    const missionData = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { client: { include: { user: { select: { name: true } } } } },
    });

    try {
      await this.notificationsService.sendMissionToWasher(washer.user.id, {
        missionId,
        type,
        serviceType: missionData!.serviceType,
        price: missionData!.price,
        address: missionData!.fullAddress,
        lat: missionData!.lat,
        lng: missionData!.lng,
        scheduledAt: missionData!.scheduledAt?.toISOString(),
        timeoutSeconds: timeoutMs / 1000,
      });
    } catch (notifErr: any) {
      this.logger.error(`Erreur notification washer ${washer.id}: ${notifErr.message}`);
    }

    this.logger.log(
      `Mission ${missionId} envoyée au washer ${washer.id} (tentative ${index + 1})`,
    );

    setTimeout(async () => {
      const attempt = await this.prisma.missionDispatchAttempt.findFirst({
        where: {
          missionId,
          washerId: washer.id,
          status: DispatchAttemptStatus.PENDING,
        },
      });

      if (attempt) {
        await this.prisma.missionDispatchAttempt.update({
          where: { id: attempt.id },
          data: { status: DispatchAttemptStatus.EXPIRED },
        });

        this.logger.log(`Mission ${missionId} expirée pour washer ${washer.id}, tentative suivante`);
        await this.tryDispatchToWasher(missionId, washers, index + 1, type);
      }
    }, timeoutMs);
  }

  async acceptMission(missionId: string, washerProfileId: string) {
    const attempt = await this.prisma.missionDispatchAttempt.findFirst({
      where: {
        missionId,
        washerId: washerProfileId,
        status: DispatchAttemptStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });

    if (!attempt) {
      return { success: false, message: 'Cette mission n\'est plus disponible' };
    }

    await this.prisma.$transaction([
      this.prisma.missionDispatchAttempt.update({
        where: { id: attempt.id },
        data: { status: DispatchAttemptStatus.ACCEPTED },
      }),
      this.prisma.mission.update({
        where: { id: missionId },
        data: {
          washerId: washerProfileId,
          status: MissionStatus.ASSIGNED,
          acceptedAt: new Date(),
        },
      }),
    ]);

    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        client: { include: { user: { select: { id: true, name: true } } } },
        washer: { include: { user: { select: { name: true, phone: true } } } },
      },
    });

    await this.notificationsService.sendToUser(mission!.client.user.id, {
      title: 'Washer trouvé !',
      body: `${mission!.washer!.user.name} arrive vers vous`,
      data: { missionId, type: 'WASHER_ASSIGNED' },
    });

    return { success: true, mission };
  }

  async declineMission(missionId: string, washerProfileId: string) {
    const attempt = await this.prisma.missionDispatchAttempt.findFirst({
      where: {
        missionId,
        washerId: washerProfileId,
        status: DispatchAttemptStatus.PENDING,
      },
    });

    if (!attempt) return { success: false };

    await this.prisma.missionDispatchAttempt.update({
      where: { id: attempt.id },
      data: { status: DispatchAttemptStatus.DECLINED },
    });

    const allAttempts = await this.prisma.missionDispatchAttempt.findMany({
      where: { missionId },
      orderBy: { sentAt: 'asc' },
    });

    const nextIndex = allAttempts.length;

    const mission = await this.prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission || mission.status !== MissionStatus.SEARCHING) return { success: true };

    const remainingWashers = await this.getEligibleWashers(
      mission.lat,
      mission.lng,
      mission.missionType as 'INSTANT' | 'BOOKING',
    );

    const alreadyTried = allAttempts.map((a) => a.washerId);
    const nextWashers = remainingWashers.filter((w) => !alreadyTried.includes(w.id));

    if (nextWashers.length > 0) {
      await this.tryDispatchToWasher(missionId, nextWashers, 0, mission.missionType as any);
    } else {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED },
      });
    }

    return { success: true };
  }

  async washerArrive(missionId: string, washerProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, washerId: washerProfileId },
      include: { client: { include: { user: true } } },
    });

    if (!mission) return null;

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.ARRIVED, arrivedAt: new Date() },
    });

    await this.notificationsService.sendToUser(mission.client.user.id, {
      title: 'Washer arrivé',
      body: 'Votre washer est arrivé !',
      data: { missionId, type: 'WASHER_ARRIVED' },
    });

    return { success: true };
  }

  async startMission(missionId: string, washerProfileId: string) {
    await this.prisma.mission.updateMany({
      where: { id: missionId, washerId: washerProfileId },
      data: { status: MissionStatus.IN_PROGRESS, startedAt: new Date() },
    });
    return { success: true };
  }

  async completeMission(missionId: string, washerProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, washerId: washerProfileId },
      include: {
        photos: true,
        client: { include: { user: true } },
      },
    });

    if (!mission) return null;

    const beforePhotos = mission.photos.filter((p) => p.type === 'BEFORE');
    const afterPhotos = mission.photos.filter((p) => p.type === 'AFTER');

    if (!beforePhotos.length || !afterPhotos.length) {
      return { success: false, message: 'Photos avant/après obligatoires' };
    }

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.COMPLETED, completedAt: new Date() },
    });

    await this.notificationsService.sendToUser(mission.client.user.id, {
      title: 'Mission terminée',
      body: 'Votre véhicule est propre ! Veuillez valider la mission.',
      data: { missionId, type: 'MISSION_COMPLETED' },
    });

    setTimeout(async () => {
      const m = await this.prisma.mission.findUnique({ where: { id: missionId } });
      if (m && m.status === MissionStatus.COMPLETED) {
        const wallet = await this.prisma.wallet.findUnique({
          where: { washerId: washerProfileId },
        });
        if (wallet) {
          await this.prisma.mission.update({
            where: { id: missionId },
            data: {
              status: MissionStatus.VALIDATED,
              validationStatus: 'AUTO_VALIDATED',
              validatedAt: new Date(),
              paymentStatus: mission.paymentMethod === 'ORANGE_MONEY' ? 'RELEASED' : 'CASH_CONFIRMED',
            },
          });

          if (mission.paymentMethod === 'ORANGE_MONEY') {
            await this.prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                pendingBalance: { decrement: mission.price },
                availableBalance: { increment: mission.price },
              },
            });
            await this.prisma.ledgerEntry.create({
              data: {
                walletId: wallet.id,
                washerId: washerProfileId,
                missionId,
                type: 'RELEASE_TO_WASHER',
                direction: 'CREDIT',
                amount: mission.price,
                status: 'COMPLETED',
                description: 'Auto-validation après 24h',
              },
            });
          }
        }
      }
    }, 24 * 60 * 60 * 1000);

    return { success: true };
  }
}
