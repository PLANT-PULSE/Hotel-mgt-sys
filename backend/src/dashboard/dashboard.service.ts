import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus, PaymentStatus, BookingStatus } from '@prisma/client';

interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ============ OVERVIEW STATS ============
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyRevenue, totalBookings, totalRooms, roomStatusCounts, totalGuests, totalRevenue] =
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
        this.prisma.payment.aggregate({
          where: { status: PaymentStatus.COMPLETED },
          _sum: { amount: true },
        }),
      ]);

    const statusMap = Object.fromEntries(
      roomStatusCounts.map((s) => [s.status, s._count.id]),
    );

    const occupied = statusMap[RoomStatus.OCCUPIED] ?? 0;
    const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;

    return {
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      totalBookings: totalBookings,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalCustomers: totalGuests,
      totalRooms,
      roomStatus: {
        available: statusMap[RoomStatus.AVAILABLE] ?? 0,
        occupied: statusMap[RoomStatus.OCCUPIED] ?? 0,
        cleaning: statusMap[RoomStatus.CLEANING] ?? 0,
        maintenance: statusMap[RoomStatus.MAINTENANCE] ?? 0,
      },
    };
  }

  // ============ REVENUE OVERVIEW ============
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

  // ============ RECENT BOOKINGS ============
  async getRecentBookings(limit = 10) {
    return this.prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { roomType: true } },
        guest: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    });
  }

  // ============ BOOKING TRENDS ============
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

  // ============ CALENDAR / OCCUPANCY VIEW ============
  async getCalendarOccupancy(months = 12) {
    const result: { month: string; occupancyRate: number; bookedRooms: number; totalRooms: number }[] = [];
    const now = new Date();
    const totalRooms = await this.prisma.room.count();

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const start = new Date(d);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      // Get bookings that overlap with this month
      const bookingsInMonth = await this.prisma.booking.findMany({
        where: {
          status: BookingStatus.CONFIRMED,
          checkInDate: { lte: end },
          checkOutDate: { gte: start },
        },
        include: { items: true },
      });

      // Calculate total booked room-nights for this month
      let bookedRoomNights = 0;
      const daysInMonth = end.getDate();
      
      for (const booking of bookingsInMonth) {
        // Calculate overlapping days
        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);
        const overlapStart = start > bookingStart ? start : bookingStart;
        const overlapEnd = end < bookingEnd ? end : bookingEnd;
        const overlappingDays = Math.max(0, Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)));
        
        bookedRoomNights += overlappingDays * booking.items.reduce((sum, item) => sum + item.quantity, 0);
      }

      const totalRoomNights = totalRooms * daysInMonth;
      const occupancyRate = totalRoomNights > 0 ? (bookedRoomNights / totalRoomNights) * 100 : 0;

      result.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        bookedRooms: bookingsInMonth.length,
        totalRooms,
      });
    }

    return result;
  }

  // ============ ROOM BOOKINGS CALENDAR ============
  async getRoomBookingsCalendar(roomId?: string, startDate?: Date, endDate?: Date) {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59);

    const rooms = await this.prisma.room.findMany({
      where: roomId ? { id: roomId } : undefined,
      include: {
        roomType: true,
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
            checkInDate: { lte: end },
            checkOutDate: { gte: start },
          },
          orderBy: { checkInDate: 'asc' },
        },
      },
    });

    return rooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType.name,
      status: room.status,
      bookings: room.bookings.map(b => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        guestName: `${b.guestFirstName} ${b.guestLastName}`,
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        status: b.status,
      })),
    }));
  }

  // ============ DAILY BOOKINGS ============
  async getDailyBookings(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, id: true },
    });

    // Group by date
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, 0);
    }

    bookings.forEach(b => {
      const key = b.createdAt.toISOString().split('T')[0];
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  // ============ MOST BOOKED ROOMS ============
  async getMostBookedRooms(limit = 5) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        items: { include: { roomType: true } },
      },
    });

    const roomTypeCounts = new Map<string, { name: string; count: number }>();
    
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const current = roomTypeCounts.get(item.roomTypeId) || { name: item.roomType.name, count: 0 };
        current.count += item.quantity;
        roomTypeCounts.set(item.roomTypeId, current);
      });
    });

    return Array.from(roomTypeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ============ BOOKING STATUS BREAKDOWN ============
  async getBookingStatusBreakdown() {
    const statuses = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return Object.fromEntries(statuses.map(s => [s.status, s._count.id]));
  }

  // ============ BLOCK DATES ============
  async blockDates(roomId: string, startDate: Date, endDate: Date, reason?: string) {
    return this.prisma.blockedDate.create({
      data: {
        roomId,
        startDate,
        endDate,
        reason,
      },
    });
  }

  // ============ GET BLOCKED DATES ============
  async getBlockedDates(roomId?: string) {
    return this.prisma.blockedDate.findMany({
      where: roomId ? { roomId } : undefined,
      include: { room: true },
    });
  }

  // ============ DELETE BLOCKED DATE ============
  async deleteBlockedDate(id: string) {
    return this.prisma.blockedDate.delete({ where: { id } });
  }

  // ============ REVENUE BY ROOM TYPE ============
  async getRevenueByRoomType() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED },
      include: {
        items: { include: { roomType: true } },
      },
    });

    const revenueByType = new Map<string, { name: string; revenue: number }>();
    
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const current = revenueByType.get(item.roomTypeId) || { name: item.roomType.name, revenue: 0 };
        current.revenue += Number(item.totalPrice);
        revenueByType.set(item.roomTypeId, current);
      });
    });

    return Array.from(revenueByType.values())
      .sort((a, b) => b.revenue - a.revenue);
  }

  // ============ GUEST STATS ============
  async getGuestStats() {
    const [totalGuests, newGuestsThisMonth, guestsWithBookings] = await Promise.all([
      this.prisma.guest.count(),
      this.prisma.guest.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.guest.count({
        where: {
          bookings: { some: {} },
        },
      }),
    ]);

    return {
      totalGuests,
      newGuestsThisMonth,
      guestsWithBookings,
      returnGuests: guestsWithBookings,
    };
  }
}
