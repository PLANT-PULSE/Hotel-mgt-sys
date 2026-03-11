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

  /**
   * Get comprehensive dashboard overview with all key metrics
   */
  async getDashboardOverview() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      stats,
      revenueOverview,
      recentBookings,
      todayCheckins,
      todayCheckouts,
      pendingPayments,
      roomTypePerformance,
    ] = await Promise.all([
      this.getStats(),
      this.getRevenueOverview(6),
      this.getRecentBookings(5),
      this.getTodayCheckins(),
      this.getTodayCheckouts(),
      this.getPendingPayments(),
      this.getRoomTypePerformance(),
    ]);

    return {
      stats,
      revenueOverview,
      recentBookings,
      todayCheckins,
      todayCheckouts,
      pendingPayments,
      roomTypePerformance,
      timestamp: new Date(),
    };
  }

  /**
   * Get check-ins scheduled for today
   */
  async getTodayCheckins() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.booking.count({
      where: {
        checkInDate: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' },
      },
    });
  }

  /**
   * Get check-outs scheduled for today
   */
  async getTodayCheckouts() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.booking.count({
      where: {
        checkOutDate: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' },
      },
    });
  }

  /**
   * Get pending payments that haven't been completed
   */
  async getPendingPayments() {
    const pendingCount = await this.prisma.payment.count({
      where: { status: PaymentStatus.PENDING },
    });

    const pendingAmount = await this.prisma.payment.aggregate({
      where: { status: PaymentStatus.PENDING },
      _sum: { amount: true },
    });

    return {
      count: pendingCount,
      totalAmount: Number(pendingAmount._sum.amount ?? 0),
    };
  }

  /**
   * Get performance metrics by room type
   */
  async getRoomTypePerformance(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const roomTypes = await this.prisma.roomType.findMany({
      include: {
        bookingItems: {
          include: {
            booking: {
              include: { payments: true },
            },
          },
          where: {
            booking: { createdAt: { gte: startDate } },
          },
        },
      },
    });

    return roomTypes.map((rt) => {
      const bookingItems = rt.bookingItems;
      const totalBookings = bookingItems.length;
      const totalRevenue = bookingItems.reduce((sum, item) => {
        const completedPayments = item.booking.payments.filter(
          (p) => p.status === PaymentStatus.COMPLETED,
        );
        const paymentSum = completedPayments.reduce(
          (s, p) => s + Number(p.amount),
          0,
        );
        return sum + paymentSum;
      }, 0);

      return {
        id: rt.id,
        name: rt.name,
        type: rt.type,
        basePrice: rt.basePrice,
        totalBookings,
        totalRevenue,
        avgRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      };
    });
  }

  /**
   * Get guest analytics including new guests this month
   */
  async getGuestAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalGuests,
      newGuestsThisMonth,
      returningGuests,
      totalBookingsByGuests,
    ] = await Promise.all([
      this.prisma.guest.count(),
      this.prisma.guest.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.guest.count({
        where: {
          bookings: {
            some: {
              createdAt: { lt: startOfMonth },
            },
          },
        },
      }),
      this.prisma.booking.count({
        where: {
          guestId: { not: null },
        },
      }),
    ]);

    return {
      totalGuests,
      newGuestsThisMonth,
      returningGuests,
      totalBookingsByGuests,
      loyaltyRate:
        totalGuests > 0 ? (returningGuests / totalGuests) * 100 : 0,
    };
  }
}
