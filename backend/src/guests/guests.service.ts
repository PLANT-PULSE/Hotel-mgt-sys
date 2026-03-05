import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [guests, total] = await Promise.all([
      this.prisma.guest.findMany({
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        },
        skip,
        take: limit,
      }),
      this.prisma.guest.count(),
    ]);
    return { data: guests, meta: { page, limit, total } };
  }

  async findById(id: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        user: true,
        bookings: { include: { items: { include: { roomType: true } } } },
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async findByUserId(userId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async updateLoyaltyPoints(id: string, points: number) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Guest not found');
    const newPoints = guest.loyaltyPoints + points;
    return this.prisma.guest.update({
      where: { id },
      data: { loyaltyPoints: Math.max(0, newPoints) },
    });
  }
}
