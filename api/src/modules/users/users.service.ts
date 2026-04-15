import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getClientProfile(userId: string) {
    return this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        vehicles: true,
        addresses: { where: { isDefault: true } },
      },
    });
  }

  async addVehicle(clientProfileId: string, data: { type: string; brand: string; model: string; plateNumber: string; color?: string }) {
    return this.prisma.vehicle.create({ data: { clientId: clientProfileId, ...data } });
  }

  async getVehicles(clientProfileId: string) {
    return this.prisma.vehicle.findMany({ where: { clientId: clientProfileId } });
  }

  async addAddress(clientProfileId: string, data: { label: string; fullAddress: string; lat: number; lng: number; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { clientId: clientProfileId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { clientId: clientProfileId, ...data } });
  }

  async getAddresses(clientProfileId: string) {
    return this.prisma.address.findMany({ where: { clientId: clientProfileId }, orderBy: { isDefault: 'desc' } });
  }

  // ── ABONNEMENTS ────────────────────────────────────────────────────────────

  async activateSubscription(clientProfileId: string, serviceType: string, vehiclePlate?: string, vehicleModel?: string) {
    const existing = await this.prisma.clientSubscription.findFirst({
      where: { clientId: clientProfileId, status: 'ACTIVE' },
    });
    if (existing) throw new ConflictException('Vous avez deja un abonnement actif');

    const priceMap: Record<string, number> = {
      EXTERIOR: 16500,
      INTERIOR: 27500,
      FULL: 44000,
    };
    const price = priceMap[serviceType] ?? 0;

    return this.prisma.clientSubscription.create({
      data: {
        clientId: clientProfileId,
        serviceType: serviceType as any,
        total: 11,
        remaining: 11,
        price,
        completedPaidWashesCount: 0,
        freeWashAvailable: false,
        subscriptionStartedAt: new Date(),
        vehiclePlate: vehiclePlate ?? null,
        vehicleModel: vehicleModel ?? null,
        status: 'ACTIVE',
      },
    });
  }

  async getActiveSubscription(clientProfileId: string) {
    const sub = await this.prisma.clientSubscription.findFirst({
      where: { clientId: clientProfileId, status: 'ACTIVE' },
    });
    if (!sub) return null;

    // Historique des missions comptees
    const missions = await this.prisma.mission.findMany({
      where: {
        clientId: clientProfileId,
        serviceType: sub.serviceType,
        status: 'VALIDATED',
        validatedAt: { gte: sub.subscriptionStartedAt },
      },
      orderBy: { validatedAt: 'desc' },
      take: 20,
      select: { id: true, serviceType: true, price: true, validatedAt: true, address: true },
    });

    return { ...sub, missions };
  }

  async getSubscriptions(clientProfileId: string) {
    return this.prisma.clientSubscription.findMany({
      where: { clientId: clientProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelSubscription(clientProfileId: string) {
    const sub = await this.prisma.clientSubscription.findFirst({
      where: { clientId: clientProfileId, status: 'ACTIVE' },
    });
    if (!sub) throw new NotFoundException('Aucun abonnement actif');
    return this.prisma.clientSubscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED' },
    });
  }

  async incrementSubscriptionCounter(clientProfileId: string, serviceType: string) {
    const sub = await this.prisma.clientSubscription.findFirst({
      where: { clientId: clientProfileId, status: 'ACTIVE' },
    });
    if (!sub) return;
    if (sub.serviceType !== serviceType && sub.serviceType !== 'FULL' && serviceType !== 'FULL') return;

    const newCount = sub.completedPaidWashesCount + 1;
    const freeWashAvailable = newCount >= 11;

    await this.prisma.clientSubscription.update({
      where: { id: sub.id },
      data: {
        completedPaidWashesCount: newCount,
        freeWashAvailable,
        remaining: Math.max(0, 11 - newCount),
      },
    });
  }
}