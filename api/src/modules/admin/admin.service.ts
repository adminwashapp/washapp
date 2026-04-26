import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalClients,
      totalWashers,
      activeWashers,
      missionsToday,
      missionsTotal,
      todayRevenue,
      openComplaintsCount,
      pendingWithdrawals,
      missionsSearching,
      missionsValidatedToday,
      recentMissions,
      openComplaints,
    ] = await this.prisma.$transaction([
      this.prisma.clientProfile.count(),
      this.prisma.washerProfile.count(),
      this.prisma.washerProfile.count({ where: { accountStatus: 'ACTIVE' } }),
      this.prisma.mission.count({ where: { createdAt: { gte: today } } }),
      this.prisma.mission.count(),
      this.prisma.mission.aggregate({
        where: { createdAt: { gte: today }, status: { in: ['VALIDATED', 'COMPLETED'] } },
        _sum: { price: true },
      }),
      this.prisma.complaint.count({ where: { status: 'OPEN' } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.mission.count({ where: { status: 'SEARCHING' } }),
      this.prisma.mission.count({ where: { status: 'VALIDATED', validatedAt: { gte: today } } }),
      this.prisma.mission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          client: { include: { user: { select: { name: true, phone: true } } } },
          washer: { include: { user: { select: { name: true, phone: true } } } },
        },
      }),
      this.prisma.complaint.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          client: { include: { user: { select: { name: true, phone: true } } } },
          washer: { include: { user: { select: { name: true, phone: true } } } },
        },
      }),
    ]);

    return {
      stats: {
        totalClients,
        totalWashers,
        activeWashers,
        missionsToday,
        missionsTotal,
        revenueToday: todayRevenue._sum.price || 0,
        openComplaints: openComplaintsCount,
        pendingWithdrawals,
        missionsSearching,
        missionsValidatedToday,
      },
      recentMissions,
      openComplaints,
    };
  }

  async getWashers(status?: string, page = 1, limit = 20) {
    const where = status ? { accountStatus: status as any } : {};
    const [washers, total] = await this.prisma.$transaction([
      this.prisma.washerProfile.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true, email: true } },
          wallet: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.washerProfile.count({ where }),
    ]);

    return { washers, total, page, limit };
  }

  async activateWasher(washerProfileId: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { accountStatus: 'ACTIVE', isApproved: true },
    });
  }

  async suspendWasher(washerProfileId: string, reason?: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { accountStatus: 'SUSPENDED', isOnline: false },
    });
  }

  async validateWasherTraining(washerProfileId: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { trainingValidated: true },
    });
  }

  async validateWasherTest(washerProfileId: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { testValidated: true },
    });
  }

  async validateWasherEquipment(washerProfileId: string) {
    return this.prisma.washerProfile.update({
      where: { id: washerProfileId },
      data: { equipmentValidated: true },
    });
  }

  async getMissions(status?: string, page = 1, limit = 20) {
    const where = status ? { status: status as any } : {};
    const [missions, total] = await this.prisma.$transaction([
      this.prisma.mission.findMany({
        where,
        include: {
          client: { include: { user: { select: { name: true, phone: true } } } },
          washer: { include: { user: { select: { name: true, phone: true } } } },
          photos: true,
          complaint: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mission.count({ where }),
    ]);

    return { missions, total, page, limit };
  }

  async getComplaints(status?: string) {
    return this.prisma.complaint.findMany({
      where: status ? { status: status as any } : {},
      include: {
        client: { include: { user: { select: { name: true, phone: true } } } },
        washer: { include: { user: { select: { name: true, phone: true } } } },
        mission: { include: { photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComplaint(complaintId: string, resolutionNote: string) {
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'RESOLVED', resolutionNote, updatedAt: new Date() },
    });
  }

  async getLedger(page = 1, limit = 50) {
    const [entries, total] = await this.prisma.$transaction([
      this.prisma.ledgerEntry.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          washer: { include: { user: { select: { name: true, phone: true } } } },
          mission: { select: { serviceType: true, price: true } },
        },
      }),
      this.prisma.ledgerEntry.count(),
    ]);

    return { entries, total, page, limit };
  }

  async getWithdrawals(status?: string) {
    return this.prisma.withdrawalRequest.findMany({
      where: status ? { status: status as any } : {},
      include: {
        washer: { include: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processWithdrawal(withdrawalId: string, status: 'APPROVED' | 'PAID' | 'REJECTED') {
    const withdrawal = await this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status, processedAt: new Date() },
    });

    if (status === 'REJECTED') {
      await this.prisma.wallet.update({
        where: { id: withdrawal.walletId },
        data: { availableBalance: { increment: withdrawal.amount } },
      });

      await this.prisma.ledgerEntry.create({
        data: {
          walletId: withdrawal.walletId,
          washerId: withdrawal.washerId,
          type: 'ADJUSTMENT',
          direction: 'CREDIT',
          amount: withdrawal.amount,
          status: 'COMPLETED',
          description: 'Remboursement retrait rejeté',
        },
      });
    }

    return withdrawal;
  }

  async getSubscriptions() {
    return this.prisma.washerSubscription.findMany({
      include: {
        washer: { include: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getClients(search: string, page: number, limit: number) {
    const where: any = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { phone: { contains: search } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};
    const [clients, total] = await this.prisma.$transaction([
      this.prisma.clientProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, createdAt: true, isActive: true } },
          _count: { select: { missions: true, complaints: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.clientProfile.count({ where }),
    ]);
    return { clients, total, page, limit };
  }

  async getClientById(id: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, createdAt: true, isActive: true } },
        missions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { washer: { include: { user: { select: { name: true } } } } },
        },
        complaints: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { missions: true, complaints: true } },
      },
    });
    return client;
  }

  async toggleClientBan(clientProfileId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      include: { user: true },
    });
    if (!client) throw new Error('Client introuvable');
    const newStatus = !client.user.isActive;
    await this.prisma.user.update({
      where: { id: client.userId },
      data: { isActive: newStatus },
    });
    return { success: true, isActive: newStatus };
  }

  async deleteWasher(washerProfileId: string) {
    const washer = await this.prisma.washerProfile.findUnique({
      where: { id: washerProfileId },
    });
    if (!washer) throw new Error('Washer introuvable');
    await this.prisma.user.delete({ where: { id: washer.userId } });
    return { success: true };
  }

  async deleteClient(clientProfileId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
    });
    if (!client) throw new Error('Client introuvable');
    await this.prisma.user.delete({ where: { id: client.userId } });
    return { success: true };
  }
}
