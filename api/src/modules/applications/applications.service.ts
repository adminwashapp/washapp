import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    zone: string;
    transportType: string;
    availability: string;
    experience?: string;
    hasEquipment: boolean;
    waveMoneyNumber?: string;
    preferredPayment?: string;
    profilePhotoUrl?: string;
    idDocumentUrl?: string;
    otherDocumentUrl?: string;
  }) {
    return this.prisma.washerApplication.create({ data });
  }

  async findAll(status?: string) {
    return this.prisma.washerApplication.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.washerApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Candidature introuvable');
    return app;
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const app = await this.findOne(id);
    return this.prisma.washerApplication.update({
      where: { id: app.id },
      data: { status: status as any, ...(adminNote !== undefined ? { adminNote } : {}) },
    });
  }
}