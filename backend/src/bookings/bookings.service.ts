import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { RequestUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private generateBookingNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 99999) + 10000;
    return `LXS-${year}-${random}`;
  }

  private async calculateTotal(
    items: { roomTypeId: string; quantity: number; pricePerNight: number }[],
    checkIn: Date,
    checkOut: Date,
    promoCode?: string,
    addOns?: { addOnId: string; quantity: number }[],
  ): Promise<{ total: number; promoDiscount: number }> {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    let subtotal = 0;

    for (const item of items) {
      subtotal += item.pricePerNight * item.quantity * nights;
    }

    let promoDiscount = 0;
    if (promoCode) {
      const promo = await this.prisma.promoCode.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });
      if (promo) {
        promoDiscount = Number(promo.discount) * subtotal;
      }
    }

    if (addOns?.length) {
      for (const ao of addOns) {
        const addOn = await this.prisma.addOn.findUnique({
          where: { id: ao.addOnId },
        });
        if (addOn) subtotal += Number(addOn.price) * ao.quantity;
      }
    }

    const total = Math.max(0, subtotal - promoDiscount);
    return { total, promoDiscount };
  }

  async create(dto: CreateBookingDto, user?: RequestUser) {
    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const { total } = await this.calculateTotal(
      dto.items,
      checkIn,
      checkOut,
      dto.promoCode,
      dto.addOns,
    );

    let guestId: string | null = null;
    if (user?.id) {
      const guest = await this.prisma.guest.findUnique({
        where: { userId: user.id },
      });
      guestId = guest?.id ?? null;
    }

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber: this.generateBookingNumber(),
        guestId,
        createdById: user?.role && user.role !== 'GUEST' ? user.id : null,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestEmail: dto.guestEmail,
        guestFirstName: dto.guestFirstName,
        guestLastName: dto.guestLastName,
        guestPhone: dto.guestPhone,
        specialRequests: dto.specialRequests,
        totalAmount: total,
        status: BookingStatus.PENDING,
        items: {
          create: dto.items.map((item) => {
            const nights = Math.ceil(
              (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
            );
            const itemTotal = item.pricePerNight * item.quantity * nights;
            return {
              roomTypeId: item.roomTypeId,
              quantity: item.quantity,
              pricePerNight: item.pricePerNight,
              totalPrice: itemTotal,
            };
          }),
        },
      },
      include: {
        items: { include: { roomType: true } },
      },
    });

    if (dto.addOns?.length) {
      for (const ao of dto.addOns) {
        const addOn = await this.prisma.addOn.findUnique({
          where: { id: ao.addOnId },
        });
        if (addOn) {
          await this.prisma.bookingAddOn.create({
            data: {
              bookingId: booking.id,
              addOnId: ao.addOnId,
              quantity: ao.quantity,
              price: Number(addOn.price) * ao.quantity,
            },
          });
        }
      }
    }

    return this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        items: { include: { roomType: true } },
        addOns: { include: { addOn: true } },
      },
    });
  }

  async findMyBookings(userId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { userId },
    });
    if (!guest) return { data: [], meta: { page: 1, limit: 20, total: 0 } };
    return this.findAll({ guestId: guest.id });
  }

  async findAll(filters?: { status?: BookingStatus; guestId?: string; page?: number; limit?: number }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.guestId) where.guestId = filters.guestId;

    const page = filters?.page ?? 1;
    const limit = Math.min(filters?.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          items: { include: { roomType: true } },
          guest: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total },
    };
  }

  async findByNumber(bookingNumber: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { bookingNumber: bookingNumber.toUpperCase().replace(/\s/g, '') },
      include: {
        items: { include: { roomType: true } },
        addOns: { include: { addOn: true } },
        payments: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        items: { include: { roomType: true } },
        addOns: { include: { addOn: true } },
        payments: true,
        guest: { include: { user: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus) {
    await this.findById(id);
    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { items: { include: { roomType: true } } },
    });
  }

  /**
   * Check for booking conflicts within a date range
   * Returns true if conflict found, false if available
   */
  async checkConflicts(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        AND: [
          { items: { some: { roomTypeId } } },
          { id: { not: excludeBookingId } },
          { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } },
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
        ],
      },
      select: { id: true },
    });

    return conflictingBookings.length > 0;
  }

  /**
   * Check availability for multiple rooms
   */
  async checkAvailability(
    items: { roomTypeId: string; quantity: number }[],
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<{ available: boolean; unavailableRoomTypes: string[] }> {
    const unavailableRoomTypes: string[] = [];

    for (const item of items) {
      const hasConflict = await this.checkConflicts(
        item.roomTypeId,
        checkInDate,
        checkOutDate,
      );

      if (hasConflict) {
        unavailableRoomTypes.push(item.roomTypeId);
      }
    }

    return {
      available: unavailableRoomTypes.length === 0,
      unavailableRoomTypes,
    };
  }

  /**
   * Create temporary reservation hold (10 minutes)
   */
  async createReservationHold(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    sessionId: string,
    quantity: number = 1,
  ): Promise<{ id: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const reservation = await this.prisma.reservation.create({
      data: {
        roomTypeId,
        checkInDate,
        checkOutDate,
        sessionId,
        quantity,
        expiresAt,
        status: 'ACTIVE',
      },
    });

    return { id: reservation.id, expiresAt: reservation.expiresAt };
  }

  /**
   * Cancel reservation hold
   */
  async cancelReservationHold(reservationId: string): Promise<void> {
    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Advanced search and filtering for admin bookings management
   */
  async searchBookings(filters: {
    searchTerm?: string; // booking number or guest name
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'amount' | 'status';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const sortOrder = filters.sortOrder ?? 'desc';

    const where: Record<string, unknown> = {};

    // Search by booking number or guest name
    if (filters.searchTerm) {
      where.OR = [
        { bookingNumber: { contains: filters.searchTerm.toUpperCase() } },
        { guestFirstName: { contains: filters.searchTerm } },
        { guestLastName: { contains: filters.searchTerm } },
        { guestEmail: { contains: filters.searchTerm } },
      ];
    }

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      where.checkInDate = {};
      if (filters.dateFrom) {
        (where.checkInDate as Record<string, Date>).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.checkInDate as Record<string, Date>).lte = filters.dateTo;
      }
    }

    // Filter by amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.totalAmount = {};
      if (filters.minAmount !== undefined) {
        (where.totalAmount as Record<string, number>).gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        (where.totalAmount as Record<string, number>).lte = filters.maxAmount;
      }
    }

    // Determine sort field
    let orderBy: Record<string, string> = { createdAt: sortOrder };
    if (filters.sortBy === 'amount') {
      orderBy = { totalAmount: sortOrder };
    } else if (filters.sortBy === 'status') {
      orderBy = { status: sortOrder };
    } else if (filters.sortBy === 'date') {
      orderBy = { checkInDate: sortOrder };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          items: { include: { roomType: true } },
          guest: true,
          payments: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookings by date range for calendar/timeline view
   */
  async getBookingsByDateRange(checkInFrom: Date, checkInTo: Date) {
    return this.prisma.booking.findMany({
      where: {
        checkInDate: { gte: checkInFrom, lte: checkInTo },
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        items: { include: { roomType: true } },
        guest: true,
      },
      orderBy: { checkInDate: 'asc' },
    });
  }

  /**
   * Get revenue metrics for a date range
   */
  async getRevenueMetrics(dateFrom: Date, dateTo: Date, groupBy?: 'day' | 'week' | 'month') {
    const bookings = await this.prisma.booking.findMany({
      where: {
        checkInDate: { gte: dateFrom, lte: dateTo },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
      },
      include: { payments: true },
    });

    const metrics: Record<string, { revenue: number; bookings: number; avgValue: number }> = {};

    bookings.forEach((booking) => {
      let key: string;

      if (groupBy === 'day') {
        key = booking.checkInDate.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const date = new Date(booking.checkInDate);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // month
        key = booking.checkInDate.toISOString().substring(0, 7);
      }

      if (!metrics[key]) {
        metrics[key] = { revenue: 0, bookings: 0, avgValue: 0 };
      }

      const completedPayments = booking.payments.filter((p) => p.status === 'COMPLETED');
      const revenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      metrics[key].revenue += revenue;
      metrics[key].bookings += 1;
      metrics[key].avgValue = metrics[key].revenue / metrics[key].bookings;
    });

    return Object.entries(metrics).map(([period, data]) => ({
      period,
      ...data,
    }));
  }

  /**
   * Get occupancy metrics for rooms in a date range
   */
  async getOccupancyMetrics(dateFrom: Date, dateTo: Date) {
    const roomTypes = await this.prisma.roomType.findMany();
    const bookings = await this.prisma.booking.findMany({
      where: {
        AND: [
          { checkInDate: { lt: dateTo } },
          { checkOutDate: { gt: dateFrom } },
          { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] } },
        ],
      },
      include: { items: true },
    });

    const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));

    const occupancy = roomTypes.map((rt) => {
      const occupiedNights = bookings
        .filter((b) => b.items.some((i) => i.roomTypeId === rt.id))
        .reduce((sum, b) => {
          const start = Math.max(b.checkInDate.getTime(), dateFrom.getTime());
          const end = Math.min(b.checkOutDate.getTime(), dateTo.getTime());
          const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);

      const totalCapacity = rt.totalUnits * days;
      const occupancyRate = totalCapacity > 0 ? (occupiedNights / totalCapacity) * 100 : 0;

      return {
        roomTypeId: rt.id,
        roomTypeName: rt.name,
        occupiedNights,
        totalCapacity,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
      };
    });

    return occupancy;
  }
}
