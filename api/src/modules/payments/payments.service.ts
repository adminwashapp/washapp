import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async initiateOrangeMoney(missionId: string, clientProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, clientId: clientProfileId },
      include: { washer: true },
    });

    if (!mission) throw new Error('Mission introuvable');
    if (mission.paymentMethod !== 'ORANGE_MONEY') throw new Error('Méthode de paiement invalide');

    const reference = `WA-${uuidv4().slice(0, 8).toUpperCase()}`;

    this.logger.log(`Orange Money initié - mission ${missionId} - ref ${reference}`);

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { paymentStatus: 'PAID' },
    });

    return {
      reference,
      amount: mission.price,
      currency: 'XOF',
      missionId,
      status: 'INITIATED',
      message: 'Paiement Orange Money initié. En intégration réelle, rediriger vers le portail OM.',
    };
  }

  async confirmOrangeMoney(missionId: string, reference: string, clientProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, clientId: clientProfileId },
      include: { washer: { include: { wallet: true } } },
    });

    if (!mission || !mission.washerId) throw new Error('Mission ou washer introuvable');

    await this.walletService.holdPayment(
      missionId,
      clientProfileId,
      mission.washerId,
      mission.price,
      reference,
    );

    return { success: true, status: 'HELD', reference };
  }

  async confirmCashByClient(missionId: string, clientProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, clientId: clientProfileId },
    });

    if (!mission) throw new Error('Mission introuvable');

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { paymentStatus: 'CASH_PENDING' },
    });

    return { success: true, status: 'CASH_PENDING' };
  }

  async confirmCashByWasher(missionId: string, washerProfileId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, washerId: washerProfileId },
    });

    if (!mission) throw new Error('Mission introuvable');

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { paymentStatus: 'CASH_CONFIRMED' },
    });

    await this.walletService.confirmCashPayment(missionId, washerProfileId);

    return { success: true, status: 'CASH_CONFIRMED' };
  }
}
