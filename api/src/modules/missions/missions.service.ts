import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateComplaintDto,
  CreateMissionDto,
  CreateRatingDto,
  ValidateMissionDto,
} from './dto/mission.dto';
import {
  MissionStatus,
  MissionType,
  PaymentMethod,
  ServiceType,
  ValidationStatus,
} from '@prisma/client';

const SERVICE_PRICES: Record<ServiceType, number> = {
  EXTERIOR: 1500,
  INTERIOR: 2500,
  FULL: 4000,
};

@Injectable()
export class MissionsService {
  constructor(
    private prisma: PrismaService,
    private dispatchService: DispatchService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
  ) {}

  async createMission(clientProfileId: string, dto: CreateMissionDto) {
    const price = SERVICE_PRICES[dto.serviceType];

    const mission = await this.prisma.mission.create({
      data: {
        clientId: clientProfileId,
        vehicleId: dto.vehicleId,
        fullAddress: dto.fullAddress,
        lat: dto.lat,
        lng: dto.lng,
        missionType: dto.missionType,
        serviceType: dto.serviceType,
        paymentMethod: dto.paymentMethod,
        price,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: MissionStatus.SEARCHING,
      },
      include: { client: { include: { user: true } } },
    });

    if (dto.missionType === MissionType.INSTANT) {
      this.dispatchService.dispatchInstant(mission.id, dto.lat, dto.lng);
    } else {
      this.dispatchService.dispatchBooking(
        mission.id,
        dto.lat,
        dto.lng,
        new Date(dto.scheduledAt!),
      );
    }

    return mission;
  }

  async getMission(missionId: string, userId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        client: { include: { user: { select: { name: true, phone: true } } } },
        washer: { include: { user: { select: { name: true, phone: true } } } },
        vehicle: true,
        photos: true,
        rating: true,
        complaint: true,
      },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');

    return mission;
  }

  async getClientMissions(clientProfileId: string) {
    return this.prisma.mission.findMany({
      where: { clientId: clientProfileId },
      include: {
        washer: { include: { user: { select: { name: true } } } },
        vehicle: true,
        photos: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWasherMissions(washerProfileId: string) {
    return this.prisma.mission.findMany({
      where: { washerId: washerProfileId },
      include: {
        client: { include: { user: { select: { name: true } } } },
        vehicle: true,
        photos: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateMission(missionId: string, clientProfileId: string, dto: ValidateMissionDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        washer: { include: { wallet: true, user: true } },
        photos: true,
      },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');
    if (mission.clientId !== clientProfileId) throw new ForbiddenException();
    if (mission.status !== MissionStatus.COMPLETED) {
      throw new BadRequestException('La mission doit être terminée avant validation');
    }

    const beforePhotos = mission.photos.filter((p) => p.type === 'BEFORE');
    const afterPhotos = mission.photos.filter((p) => p.type === 'AFTER');

    if (!beforePhotos.length || !afterPhotos.length) {
      throw new BadRequestException('Photos avant/après manquantes');
    }

    await this.prisma.mission.update({
      where: { id: missionId },
      data: {
        status: MissionStatus.VALIDATED,
        validationStatus: ValidationStatus.CLIENT_VALIDATED,
        validatedAt: new Date(),
        paymentStatus:
          mission.paymentMethod === PaymentMethod.ORANGE_MONEY ? 'RELEASED' : 'CASH_CONFIRMED',
      },
    });

    if (mission.paymentMethod === PaymentMethod.ORANGE_MONEY && mission.washer?.wallet) {
      await this.walletService.releaseToWasher(
        mission.washerId!,
        mission.washer.wallet.id,
        missionId,
        mission.price,
      );
    }

    if (mission.washer?.user?.id) {
      await this.notificationsService.sendToUser(mission.washer.user.id, {
        title: 'Mission validée',
        body: `${mission.price} FCFA ont été ajoutés à votre wallet`,
        data: { missionId, type: 'MISSION_VALIDATED' },
      });
    }

    return { success: true };
  }

  async rateMission(
    missionId: string,
    clientProfileId: string,
    dto: CreateRatingDto,
  ) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { rating: true },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');
    if (mission.clientId !== clientProfileId) throw new ForbiddenException();
    if (mission.status !== MissionStatus.VALIDATED) {
      throw new BadRequestException('La mission doit être validée avant notation');
    }
    if (mission.rating) throw new BadRequestException('Mission déjà notée');

    const rating = await this.prisma.rating.create({
      data: {
        missionId,
        clientId: clientProfileId,
        washerId: mission.washerId!,
        stars: dto.stars,
        comment: dto.comment,
      },
    });

    const washerProfile = await this.prisma.washerProfile.findUnique({
      where: { id: mission.washerId! },
    });

    if (washerProfile) {
      const newCount = washerProfile.ratingsCount + 1;
      const newAverage =
        (washerProfile.averageRating * washerProfile.ratingsCount + dto.stars) / newCount;

      await this.prisma.washerProfile.update({
        where: { id: mission.washerId! },
        data: { averageRating: newAverage, ratingsCount: newCount },
      });

      if (dto.stars < 3 || newAverage < 3) {
        await this.prisma.washerProfile.update({
          where: { id: mission.washerId! },
          data: { accountStatus: 'SUSPENDED' },
        });
      }
    }

    return rating;
  }

  async complainMission(
    missionId: string,
    clientProfileId: string,
    dto: CreateComplaintDto,
  ) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { complaint: true },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');
    if (mission.clientId !== clientProfileId) throw new ForbiddenException();
    if (mission.complaint) throw new BadRequestException('Plainte déjà soumise');

    const complaint = await this.prisma.complaint.create({
      data: {
        missionId,
        clientId: clientProfileId,
        washerId: mission.washerId!,
        reason: dto.reason,
        description: dto.description,
      },
    });

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.DISPUTED },
    });

    const washer = await this.prisma.washerProfile.findUnique({
      where: { id: mission.washerId! },
    });

    if (washer) {
      const newCount = washer.complaintsCount + 1;
      await this.prisma.washerProfile.update({
        where: { id: mission.washerId! },
        data: {
          complaintsCount: newCount,
          accountStatus: newCount >= 3 ? 'SUSPENDED' : washer.accountStatus,
        },
      });
    }

    return complaint;
  }

  async cancelMission(missionId: string, clientProfileId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) throw new NotFoundException('Mission introuvable');
    if (mission.clientId !== clientProfileId) throw new ForbiddenException();

    if (
      [MissionStatus.IN_PROGRESS, MissionStatus.COMPLETED, MissionStatus.VALIDATED].includes(
        mission.status,
      )
    ) {
      throw new BadRequestException('Impossible d\'annuler cette mission');
    }

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.CANCELLED },
    });

    return { success: true };
  }
}
