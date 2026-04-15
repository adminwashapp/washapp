import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  channelId?: string;
  priority?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('NotificationsService pret (Expo Push API)');
  }

  private async sendExpoPush(token: string, notification: { title: string; body: string; data?: Record<string, string> }) {
    if (!token || !token.startsWith('ExponentPushToken')) {
      this.logger.debug(`Token invalide ou absent: ${token?.slice(0, 30)}`);
      return;
    }
    try {
      const message: ExpoMessage = {
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
        channelId: 'washapp_missions',
        priority: 'high',
      };
      const res = await axios.post('https://exp.host/--/api/v2/push/send', message, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
      });
      this.logger.debug(`Expo Push envoye: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      this.logger.error(`Erreur Expo Push: ${e.message}`);
    }
  }

  async sendToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { washerProfile: { select: { fcmToken: true } } },
    });
    if (!user) return;
    const token = user.washerProfile?.fcmToken ?? user.pushToken;
    if (!token) { this.logger.debug(`Pas de token pour user ${userId}`); return; }
    await this.sendExpoPush(token, notification);
  }

  async sendMissionToWasher(
    userId: string,
    missionData: {
      missionId: string; type: string; serviceType: string;
      price: number; address: string; lat: number; lng: number;
      scheduledAt?: string; timeoutSeconds: number;
    },
  ) {
    const serviceLabels: Record<string, string> = {
      EXTERIOR: 'Exterieur', INTERIOR: 'Interieur', FULL: 'Complet',
    };
    const isInstant = missionData.type === 'INSTANT';
    await this.sendToUser(userId, {
      title: isInstant ? 'Nouvelle mission !' : 'Nouvelle reservation !',
      body: `${serviceLabels[missionData.serviceType] || missionData.serviceType} - ${missionData.price} FCFA`,
      data: {
        type: 'NEW_MISSION', missionId: missionData.missionId,
        missionType: missionData.type, serviceType: missionData.serviceType,
        price: String(missionData.price), address: missionData.address,
        lat: String(missionData.lat), lng: String(missionData.lng),
        scheduledAt: missionData.scheduledAt || '',
        timeoutSeconds: String(missionData.timeoutSeconds),
      },
    });
  }

  async sendToClient(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    await this.sendToUser(userId, notification);
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (user.role === 'WASHER') {
      await this.prisma.washerProfile.updateMany({ where: { userId }, data: { fcmToken } });
    } else {
      await this.prisma.user.update({ where: { id: userId }, data: { pushToken: fcmToken } });
    }
  }
}