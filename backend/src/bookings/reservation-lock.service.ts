import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationLockService {
  // Lock duration in minutes
  private static readonly LOCK_DURATION_MINUTES = 10;

  constructor(private prisma: PrismaService) {}

  /**
   * Create a temporary reservation lock to prevent double bookings
   * This is called when a user starts the booking process
   */
  async createLock(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    quantity: number = 1,
  ): Promise<{ sessionToken: string; expiresAt: Date }> {
    // Check if rooms are available for the requested dates
    const availability = await this.checkAvailability(roomTypeId, checkInDate, checkOutDate);
    
    if (!availability.available || availability.availableQuantity < quantity) {
      throw new BadRequestException(
        `Not enough rooms available. Only ${availability.availableQuantity} rooms left for these dates.`,
      );
    }

    // Generate unique session token
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ReservationLockService.LOCK_DURATION_MINUTES);

    // Create the lock
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

  /**
   * Validate a reservation lock (check if it's still valid)
   */
  async validateLock(sessionToken: string): Promise<boolean> {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
    });

    if (!lock) {
      return false;
    }

    // Check if lock has expired
    if (new Date() > lock.expiresAt) {
      // Clean up expired lock
      await this.prisma.reservationLock.delete({
        where: { sessionToken },
      });
      return false;
    }

    return true;
  }

  /**
   * Get lock details
   */
  async getLock(sessionToken: string) {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
      include: { roomType: true },
    });

    if (!lock) {
      return null;
    }

    // Check if expired
    if (new Date() > lock.expiresAt) {
      await this.prisma.reservationLock.delete({
        where: { sessionToken },
      });
      return null;
    }

    return lock;
  }

  /**
   * Convert lock to booking (confirm the reservation)
   */
  async confirmBookingFromLock(
    sessionToken: string,
    bookingId: string,
  ): Promise<boolean> {
    const lock = await this.prisma.reservationLock.findUnique({
      where: { sessionToken },
    });

    if (!lock) {
      return false;
    }

    // Update lock with booking ID
    await this.prisma.reservationLock.update({
      where: { sessionToken },
      data: { bookingId },
    });

    return true;
  }

  /**
   * Release a reservation lock (user cancelled or timed out)
   */
  async releaseLock(sessionToken: string): Promise<void> {
    await this.prisma.reservationLock.delete({
      where: { sessionToken },
    }).catch(() => {
      // Ignore if lock doesn't exist
    });
  }

  /**
   * Check availability for given dates and room type
   */
  async checkAvailability(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<{ available: boolean; availableQuantity: number; lockedQuantity: number }> {
    // Get total units for this room type
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return { available: false, availableQuantity: 0, lockedQuantity: 0 };
    }

    const totalUnits = roomType.totalUnits;

    // Get confirmed bookings for these dates
    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        items: {
          some: { roomTypeId },
        },
        OR: [
          {
            checkInDate: { lte: checkInDate },
            checkOutDate: { gt: checkInDate },
          },
          {
            checkInDate: { lt: checkOutDate },
            checkOutDate: { gte: checkOutDate },
          },
          {
            checkInDate: { gte: checkInDate },
            checkOutDate: { lte: checkOutDate },
          },
        ],
      },
      include: { items: { where: { roomTypeId } } },
    });

    // Calculate booked quantity
    let bookedQuantity = 0;
    for (const booking of confirmedBookings) {
      for (const item of booking.items) {
        bookedQuantity += item.quantity;
      }
    }

    // Get active locks for these dates
    const activeLocks = await this.prisma.reservationLock.findMany({
      where: {
        roomTypeId,
        expiresAt: { gt: new Date() },
        OR: [
          {
            checkInDate: { lte: checkInDate },
            checkOutDate: { gt: checkInDate },
          },
          {
            checkInDate: { lt: checkOutDate },
            checkOutDate: { gte: checkOutDate },
          },
          {
            checkInDate: { gte: checkInDate },
            checkOutDate: { lte: checkOutDate },
          },
        ],
      },
    });

    const lockedQuantity = activeLocks.reduce((sum, lock) => sum + lock.quantity, 0);

    const availableQuantity = Math.max(0, totalUnits - bookedQuantity - lockedQuantity);

    return {
      available: availableQuantity > 0,
      availableQuantity,
      lockedQuantity,
    };
  }

  /**
   * Get available dates for a room type (for calendar display)
   */
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

    const totalUnits = roomType.totalUnits;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Get bookings for this specific date
      const bookingsOnDate = await this.prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          items: { some: { roomTypeId } },
          checkInDate: { lte: currentDate },
          checkOutDate: { gt: currentDate },
        },
        include: { items: { where: { roomTypeId } } },
      });

      let bookedOnDate = 0;
      for (const booking of bookingsOnDate) {
        for (const item of booking.items) {
          bookedOnDate += item.quantity;
        }
      }

      // Get locks for this date
      const locksOnDate = await this.prisma.reservationLock.findMany({
        where: {
          roomTypeId,
          expiresAt: { gt: new Date() },
          checkInDate: { lte: currentDate },
          checkOutDate: { gt: currentDate },
        },
      });

      const lockedOnDate = locksOnDate.reduce((sum, lock) => sum + lock.quantity, 0);
      const availableOnDate = Math.max(0, totalUnits - bookedOnDate - lockedOnDate);

      dates.push({
        date: dateStr,
        available: availableOnDate,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Clean up expired locks (should be called periodically)
   */
  async cleanupExpiredLocks(): Promise<number> {
    const result = await this.prisma.reservationLock.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}
