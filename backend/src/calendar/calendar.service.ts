import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CalendarAvailabilityStatus =
  | 'FULLY_BOOKED'
  | 'PARTIALLY_AVAILABLE'
  | 'AVAILABLE'
  | 'BLOCKED';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(input: { roomTypeId: string; startDate: Date; endDate: Date }) {
    const { roomTypeId, startDate, endDate } = input;
    if (endDate < startDate) throw new BadRequestException('endDate must be >= startDate');

    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { totalUnits: true },
    });
    if (!roomType) throw new BadRequestException('Invalid roomTypeId');
    const totalRooms = roomType.totalUnits;

    const rooms = await this.prisma.room.findMany({
      where: { roomTypeId },
      select: { id: true },
    });
    const roomIds = rooms.map((r) => r.id);

    const [bookings, locks, blocks] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          items: { some: { roomTypeId } },
          checkInDate: { lt: endDate },
          checkOutDate: { gt: startDate },
        },
        include: { items: { where: { roomTypeId } } },
      }),
      this.prisma.reservationLock.findMany({
        where: {
          roomTypeId,
          expiresAt: { gt: new Date() },
          checkInDate: { lt: endDate },
          checkOutDate: { gt: startDate },
        },
        select: { checkInDate: true, checkOutDate: true, quantity: true },
      }),
      roomIds.length
        ? this.prisma.blockedDate.findMany({
            where: {
              roomId: { in: roomIds },
              startDate: { lt: endDate },
              endDate: { gt: startDate },
            },
            select: { roomId: true, startDate: true, endDate: true },
          })
        : Promise.resolve([]),
    ]);

    const out: {
      date: string;
      status: CalendarAvailabilityStatus;
      availableRooms: number;
      totalRooms: number;
    }[] = [];

    const d = new Date(startDate);
    while (d <= endDate) {
      const day = new Date(d);
      const dateStr = day.toISOString().split('T')[0];

      let bookedRooms = 0;
      for (const b of bookings) {
        if (b.checkInDate <= day && b.checkOutDate > day) {
          for (const item of b.items) bookedRooms += item.quantity;
        }
      }

      let lockedRooms = 0;
      for (const l of locks) {
        if (l.checkInDate <= day && l.checkOutDate > day) lockedRooms += l.quantity;
      }

      let blockedRooms = 0;
      if (blocks.length) {
        const blockedSet = new Set<string>();
        for (const b of blocks) {
          if (b.startDate <= day && b.endDate > day) blockedSet.add(b.roomId);
        }
        blockedRooms = blockedSet.size;
      }

      const availableRooms = Math.max(0, totalRooms - bookedRooms - lockedRooms - blockedRooms);
      const status: CalendarAvailabilityStatus =
        blockedRooms >= totalRooms
          ? 'BLOCKED'
          : availableRooms <= 0
            ? 'FULLY_BOOKED'
            : availableRooms < totalRooms
              ? 'PARTIALLY_AVAILABLE'
              : 'AVAILABLE';

      out.push({ date: dateStr, status, availableRooms, totalRooms });
      d.setDate(d.getDate() + 1);
    }

    return out;
  }
}

