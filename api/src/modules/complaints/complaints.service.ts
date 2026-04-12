import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async getAll(status?: string) {
    return this.prisma.complaint.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        client: { include: { user: { select: { name: true, phone: true } } } },
        washer: { include: { user: { select: { name: true, phone: true } } } },
        mission: { select: { serviceType: true, price: true, photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(complaintId: string, resolutionNote: string) {
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'RESOLVED', resolutionNote },
    });
  }

  async reject(complaintId: string, resolutionNote: string) {
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'REJECTED', resolutionNote },
    });
  }
}
