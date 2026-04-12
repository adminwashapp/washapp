import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  async createSubscription(washerProfileId: string) {
    const amount = parseInt(process.env.WASHER_SUBSCRIPTION_AMOUNT || '35000');
    const durationDays = parseInt(process.env.WASHER_SUBSCRIPTION_DURATION_DAYS || '7');

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);

    await this.prisma.washerSubscription.updateMany({
      where: { washerId: washerProfileId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    const subscription = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.washerSubscription.create({
        data: {
          washerId: washerProfileId,
          amount,
          status: 'ACTIVE',
          startsAt,
          endsAt,
        },
      });

      await tx.washerProfile.update({
        where: { id: washerProfileId },
        data: { subscriptionStatus: 'ACTIVE' },
      });

      return sub;
    });

    return subscription;
  }

  async getActiveSubscription(washerProfileId: string) {
    return this.prisma.washerSubscription.findFirst({
      where: { washerId: washerProfileId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions() {
    const expired = await this.prisma.washerSubscription.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { lt: new Date() },
      },
    });

    for (const sub of expired) {
      await this.prisma.$transaction([
        this.prisma.washerSubscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        }),
        this.prisma.washerProfile.update({
          where: { id: sub.washerId },
          data: { subscriptionStatus: 'EXPIRED', isOnline: false },
        }),
      ]);

      this.logger.log(`Abonnement expiré pour washer ${sub.washerId}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetMonthlyStats() {
    const now = new Date();
    if (now.getDate() === 1) {
      this.logger.log('Réinitialisation stats mensuelles annulations');
    }
  }
}
