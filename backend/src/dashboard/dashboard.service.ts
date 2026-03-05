import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyRevenue, totalBookings, totalRooms, roomStatusCounts, totalGuests] =
      await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            paidAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.booking.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        this.prisma.room.count(),
        this.prisma.room.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.guest.count(),
      ]);

    const statusMap = Object.fromEntries(
      roomStatusCounts.map((s) => [s.status, s._count.id]),
    );

    const occupied = statusMap[RoomStatus.OCCUPIED] ?? 0;
    const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;

    return {
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      totalBookings: totalBookings,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalCustomers: totalGuests,
      roomStatus: {
        available: statusMap[RoomStatus.AVAILABLE] ?? 0,
        occupied: statusMap[RoomStatus.OCCUPIED] ?? 0,
        cleaning: statusMap[RoomStatus.CLEANING] ?? 0,
        maintenance: statusMap[RoomStatus.MAINTENANCE] ?? 0,
      },
    };
  }

  async getRevenueOverview(months = 6) {
    const result: { month: string; revenue: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const sum = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      result.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: Number(sum._sum.amount ?? 0),
      });
    }

    return result;
  }

  async getRecentBookings(limit = 10) {
    return this.prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { roomType: true } },
      },
    });
  }

  async getBookingTrends(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    const bookings = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { createdAt: { gte: start } },
      _count: { id: true },
    });

    return Object.fromEntries(bookings.map((b) => [b.status, b._count.id]));
  }
}
