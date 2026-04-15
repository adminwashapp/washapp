import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    try {
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
        this.logger.log('Firebase Admin initialise');
      } else {
        this.logger.warn('Firebase non configure - notifications push desactivees');
      }
    } catch (e) {
      this.logger.error('Erreur init Firebase', e);
    }
  }

  private async sendFcm(token: string, notification: { title: string; body: string; data?: Record<string, string> }) {
    if (!this.firebaseApp) return;
    try {
      await admin.messaging(this.firebaseApp).send({
        token,
        notification: { title: notification.title, body: notification.body },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'washapp_missions' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
      this.logger.debug('Notification envoyee');
    } catch (e) {
      this.logger.error('Erreur envoi FCM', e);
    }
  }

  async sendToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.firebaseApp) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { washerProfile: { select: { fcmToken: true } } },
    });
    if (!user) return;
    const token = user.washerProfile?.fcmToken ?? user.pushToken;
    if (!token) { this.logger.debug(`Pas de token pour user ${userId}`); return; }
    await this.sendFcm(token, notification);
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