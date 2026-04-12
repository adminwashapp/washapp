import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { DispatchService } from './dispatch.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class DispatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DispatchGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private dispatchService: DispatchService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET }) as any;
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.connectedUsers.set(payload.sub, client.id);

      client.join(`user:${payload.sub}`);
      client.join(`role:${payload.role}`);

      this.logger.log(`Client connecté: ${payload.sub} (${payload.role})`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);

      if (client.data.role === 'WASHER') {
        await this.prisma.washerProfile.updateMany({
          where: { userId: client.data.userId },
          data: { isOnline: false },
        });
      }

      this.logger.log(`Client déconnecté: ${client.data.userId}`);
    }
  }

  @SubscribeMessage('washer:go-online')
  async handleGoOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.prisma.washerProfile.update({
      where: { id: washer.id },
      data: { isOnline: true },
    });

    await this.prisma.washerLocation.upsert({
      where: { washerId: washer.id },
      create: { washerId: washer.id, lat: data.lat, lng: data.lng },
      update: { lat: data.lat, lng: data.lng },
    });

    client.emit('washer:status', { isOnline: true });
    this.logger.log(`Washer ${washer.id} en ligne`);
  }

  @SubscribeMessage('washer:go-offline')
  async handleGoOffline(@ConnectedSocket() client: Socket) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.prisma.washerProfile.update({
      where: { id: washer.id },
      data: { isOnline: false },
    });

    client.emit('washer:status', { isOnline: false });
  }

  @SubscribeMessage('washer:update-location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.prisma.washerLocation.upsert({
      where: { washerId: washer.id },
      create: { washerId: washer.id, lat: data.lat, lng: data.lng },
      update: { lat: data.lat, lng: data.lng },
    });

    const mission = await this.prisma.mission.findFirst({
      where: {
        washerId: washer.id,
        status: { in: ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] },
      },
      select: { id: true, clientId: true },
    });

    if (mission) {
      const clientUser = await this.prisma.clientProfile.findUnique({
        where: { id: mission.clientId },
        include: { user: true },
      });

      if (clientUser) {
        this.sendToUser(clientUser.userId, 'washer:location-update', {
          missionId: mission.id,
          lat: data.lat,
          lng: data.lng,
        });
      }
    }
  }

  @SubscribeMessage('mission:accept')
  async handleAcceptMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    const result = await this.dispatchService.acceptMission(data.missionId, washer.id);
    client.emit('mission:accept:result', result);

    if (result.success && result.mission) {
      this.sendToUser(result.mission.client.user.id, 'mission:washer-assigned', {
        missionId: data.missionId,
        washer: {
          name: result.mission.washer?.user.name,
          phone: result.mission.washer?.user.phone,
          rating: washer.averageRating,
        },
      });
    }
  }

  @SubscribeMessage('mission:decline')
  async handleDeclineMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.dispatchService.declineMission(data.missionId, washer.id);
    client.emit('mission:decline:result', { success: true });
  }

  @SubscribeMessage('mission:arrive')
  async handleArrive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.dispatchService.washerArrive(data.missionId, washer.id);

    const mission = await this.prisma.mission.findUnique({
      where: { id: data.missionId },
      include: { client: { include: { user: true } } },
    });

    if (mission) {
      this.sendToUser(mission.client.userId, 'mission:status-update', {
        missionId: data.missionId,
        status: 'ARRIVED',
      });
    }
  }

  @SubscribeMessage('mission:start')
  async handleStartMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    await this.dispatchService.startMission(data.missionId, washer.id);

    const mission = await this.prisma.mission.findUnique({
      where: { id: data.missionId },
      include: { client: { include: { user: true } } },
    });

    if (mission) {
      this.sendToUser(mission.client.userId, 'mission:status-update', {
        missionId: data.missionId,
        status: 'IN_PROGRESS',
      });
    }
  }

  @SubscribeMessage('mission:complete')
  async handleCompleteMission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { missionId: string },
  ) {
    const washer = await this.prisma.washerProfile.findFirst({
      where: { userId: client.data.userId },
    });

    if (!washer) return;

    const result = await this.dispatchService.completeMission(data.missionId, washer.id);
    client.emit('mission:complete:result', result);
  }

  sendMissionToWasher(userId: string, missionData: any) {
    this.server.to(`user:${userId}`).emit('mission:new', missionData);
    this.logger.log(`Mission envoyée au washer ${userId} via Socket`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
