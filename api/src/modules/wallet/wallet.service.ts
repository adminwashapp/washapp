import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerDirection, LedgerEntryType, LedgerStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(washerProfileId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { washerId: washerProfileId },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) throw new NotFoundException('Wallet introuvable');
    return wallet;
  }

  async getLedger(washerProfileId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { washerId: washerProfileId },
    });

    if (!wallet) throw new NotFoundException('Wallet introuvable');

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.ledgerEntry.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ledgerEntry.count({ where: { walletId: wallet.id } }),
    ]);

    return { entries, total, page, limit };
  }

  async holdPayment(
    missionId: string,
    clientId: string,
    washerId: string,
    amount: number,
    reference: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({ where: { washerId } });
    if (!wallet) throw new NotFoundException('Wallet washer introuvable');

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { pendingBalance: { increment: amount } },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          washerId,
          clientId,
          missionId,
          type: LedgerEntryType.PAYMENT_RECEIVED,
          direction: LedgerDirection.CREDIT,
          amount,
          status: LedgerStatus.COMPLETED,
          reference,
          description: 'Paiement reçu - Orange Money',
        },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          washerId,
          clientId,
          missionId,
          type: LedgerEntryType.HOLD,
          direction: LedgerDirection.CREDIT,
          amount,
          status: LedgerStatus.COMPLETED,
          reference,
          description: 'Fonds bloqués en attente de validation',
        },
      }),
      this.prisma.mission.update({
        where: { id: missionId },
        data: { paymentStatus: 'HELD' },
      }),
    ]);

    return { success: true };
  }

  async releaseToWasher(
    washerId: string,
    walletId: string,
    missionId: string,
    amount: number,
  ) {
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          pendingBalance: { decrement: amount },
          availableBalance: { increment: amount },
        },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          walletId,
          washerId,
          missionId,
          type: LedgerEntryType.RELEASE_TO_WASHER,
          direction: LedgerDirection.CREDIT,
          amount,
          status: LedgerStatus.COMPLETED,
          description: 'Fonds libérés après validation mission',
        },
      }),
    ]);

    return { success: true };
  }

  async refundClient(
    washerId: string,
    walletId: string,
    missionId: string,
    amount: number,
    clientId: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { pendingBalance: { decrement: amount } },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          walletId,
          washerId,
          clientId,
          missionId,
          type: LedgerEntryType.REFUND,
          direction: LedgerDirection.DEBIT,
          amount,
          status: LedgerStatus.COMPLETED,
          description: 'Remboursement client',
        },
      }),
      this.prisma.mission.update({
        where: { id: missionId },
        data: { paymentStatus: 'REFUNDED' },
      }),
    ]);

    return { success: true };
  }

  async requestWithdrawal(washerProfileId: string, amount: number, orangeMoneyNumber: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { washerId: washerProfileId } });
    if (!wallet) throw new NotFoundException('Wallet introuvable');

    if (wallet.availableBalance < amount) {
      throw new BadRequestException('Solde insuffisant');
    }

    if (amount < 1000) {
      throw new BadRequestException('Montant minimum de retrait : 1 000 FCFA');
    }

    const withdrawal = await this.prisma.$transaction(async (tx) => {
      const w = await tx.withdrawalRequest.create({
        data: {
          washerId: washerProfileId,
          walletId: wallet.id,
          amount,
          orangeMoneyNumber,
          status: 'PENDING',
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: { decrement: amount } },
      });

      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          washerId: washerProfileId,
          type: LedgerEntryType.WITHDRAWAL,
          direction: LedgerDirection.DEBIT,
          amount,
          status: LedgerStatus.PENDING,
          description: `Demande retrait Orange Money ${orangeMoneyNumber}`,
        },
      });

      return w;
    });

    return withdrawal;
  }

  async confirmCashPayment(missionId: string, washerProfileId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { washerId: washerProfileId } });
    const mission = await this.prisma.mission.findUnique({ where: { id: missionId } });

    if (!wallet || !mission) throw new NotFoundException();

    await this.prisma.$transaction([
      this.prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          washerId: washerProfileId,
          missionId,
          type: LedgerEntryType.CASH_CONFIRMATION,
          direction: LedgerDirection.CREDIT,
          amount: mission.price,
          status: LedgerStatus.COMPLETED,
          description: 'Paiement cash confirmé',
        },
      }),
    ]);

    return { success: true };
  }
}
