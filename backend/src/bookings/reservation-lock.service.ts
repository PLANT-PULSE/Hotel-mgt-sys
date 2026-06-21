import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Prisma, RoomStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

type DbClient = PrismaService | Prisma.TransactionClient;

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
];

@Injectable()
export class ReservationLockService {
  private static readonly LOCK_DURATION_MINUTES = 10;

  constructor(private prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }

  private overlapFilter(checkInDate: Date, checkOutDate: Date) {
    return {
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate },
    };
  }

  async createLock(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    quantity = 1,
  ): Promise<{ sessionToken: string; expiresAt: Date }> {
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const availability = await this.checkAvailability(roomTypeId, checkInDate, checkOutDate);

    if (!availability.available || availability.availableQuantity < quantity) {
      throw new BadRequestException(
        `Not enough rooms available. Only ${availability.availableQuantity} room(s) left for these dates.`,
      );
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + ReservationLockService.LOCK_DURATION_MINUTES,
    );

    await this.prisma.reservationLock.create({
      data: {
        roomTypeId,
        checkInDate,
        checkOutDate,
        quantity,
        sessionToken,
        expiresAt,
      },
    });

    return { sessionToken, expiresAt };
  }

  async validateLock(sessionToken: string): Promise<boolean> {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
    });

    if (!lock) {
      return false;
    }

    if (new Date() > lock.expiresAt) {
      await this.prisma.reservationLock.delete({
        where: { sessionToken },
      });
      return false;
    }

    return true;
  }

  async getLock(sessionToken: string) {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
      include: { roomType: true },
    });

    if (!lock) {
      return null;
    }

    if (new Date() > lock.expiresAt) {
      await this.prisma.reservationLock.delete({
        where: { sessionToken },
      });
      return null;
    }

    return lock;
  }

  async confirmBookingFromLock(sessionToken: string, bookingId: string): Promise<boolean> {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
    });

    if (!lock) {
      return false;
    }

    await this.prisma.reservationLock.update({
      where: { sessionToken },
      data: { bookingId },
    });

    return true;
  }

  async releaseLock(sessionToken: string): Promise<void> {
    await this.prisma.reservationLock.delete({
      where: { sessionToken },
    }).catch(() => undefined);
  }

  async checkAvailability(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    tx?: Prisma.TransactionClient,
    excludeSessionToken?: string,
  ): Promise<{ available: boolean; availableQuantity: number; lockedQuantity: number }> {
    const db = this.client(tx);

    const roomType = await db.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return { available: false, availableQuantity: 0, lockedQuantity: 0 };
    }

    const totalCapacity = await db.room.count({
      where: {
        roomTypeId,
        status: { not: RoomStatus.MAINTENANCE },
      },
    });

    const capacity = totalCapacity > 0 ? totalCapacity : roomType.totalUnits;

    const overlappingBookings = await db.booking.findMany({
      where: {
        status: { in: ACTIVE_BOOKING_STATUSES },
        items: { some: { roomTypeId } },
        ...this.overlapFilter(checkInDate, checkOutDate),
      },
      include: { items: { where: { roomTypeId } } },
    });

    let bookedQuantity = 0;
    for (const booking of overlappingBookings) {
      for (const item of booking.items) {
        bookedQuantity += item.quantity;
      }
    }

    const activeLocks = await db.reservationLock.findMany({
      where: {
        roomTypeId,
        expiresAt: { gt: new Date() },
        ...(excludeSessionToken ? { sessionToken: { not: excludeSessionToken } } : {}),
        ...this.overlapFilter(checkInDate, checkOutDate),
      },
    });

    const lockedQuantity = activeLocks.reduce((sum, lock) => sum + lock.quantity, 0);
    const availableQuantity = Math.max(0, capacity - bookedQuantity - lockedQuantity);

    return {
      available: availableQuantity > 0,
      availableQuantity,
      lockedQuantity,
    };
  }

  async assertItemsAvailable(
    items: { roomTypeId: string; quantity: number }[],
    checkInDate: Date,
    checkOutDate: Date,
    tx?: Prisma.TransactionClient,
    excludeSessionToken?: string,
  ): Promise<void> {
    for (const item of items) {
      const availability = await this.checkAvailability(
        item.roomTypeId,
        checkInDate,
        checkOutDate,
        tx,
        excludeSessionToken,
      );

      if (availability.availableQuantity < item.quantity) {
        throw new BadRequestException(
          `Not enough rooms available for the selected dates. Only ${availability.availableQuantity} room(s) left.`,
        );
      }
    }
  }

  async getAvailableDates(
    roomTypeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; available: number }[]> {
    const dates: { date: string; available: number }[] = [];
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return dates;
    }

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const availability = await this.checkAvailability(
        roomTypeId,
        currentDate,
        nextDay,
      );

      dates.push({
        date: currentDate.toISOString().split('T')[0],
        available: availability.availableQuantity,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  async cleanupExpiredLocks(): Promise<number> {
    const result = await this.prisma.reservationLock.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}
