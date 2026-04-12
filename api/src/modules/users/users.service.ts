import { Injectable } from '@nestjs/common';
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

  async addVehicle(
    clientProfileId: string,
    data: { type: string; brand: string; model: string; plateNumber: string; color?: string },
  ) {
    return this.prisma.vehicle.create({
      data: { clientId: clientProfileId, ...data },
    });
  }

  async getVehicles(clientProfileId: string) {
    return this.prisma.vehicle.findMany({
      where: { clientId: clientProfileId },
    });
  }

  async addAddress(
    clientProfileId: string,
    data: { label: string; fullAddress: string; lat: number; lng: number; isDefault?: boolean },
  ) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { clientId: clientProfileId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { clientId: clientProfileId, ...data },
    });
  }

  async getAddresses(clientProfileId: string) {
    return this.prisma.address.findMany({
      where: { clientId: clientProfileId },
      orderBy: { isDefault: 'desc' },
    });
  }
}
