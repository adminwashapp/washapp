import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async getWasherRatings(washerProfileId: string) {
    return this.prisma.rating.findMany({
      where: { washerId: washerProfileId },
      include: {
        client: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
