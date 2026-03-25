import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ReservationLockService } from './reservation-lock.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private reservationLocks: ReservationLockService,
    private events: EventsGateway,
  ) {}

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

    const lock = await this.reservationLocks.getLock(dto.lockId);
    if (!lock) {
      throw new BadRequestException('Invalid or expired reservation lock');
    }

    const requestedRoomTypeIds = Array.from(new Set(dto.items.map((i) => i.roomTypeId)));
    if (requestedRoomTypeIds.length !== 1) {
      throw new BadRequestException('Reservation lock supports exactly one room type per booking');
    }
    const requestedRoomTypeId = requestedRoomTypeIds[0];
    const requestedQty = dto.items.reduce((sum, i) => sum + i.quantity, 0);
    if (requestedRoomTypeId !== lock.roomTypeId) {
      throw new BadRequestException('Reservation lock does not match requested room type');
    }
    if (requestedQty !== lock.quantity) {
      throw new BadRequestException('Reservation lock quantity does not match requested quantity');
    }
    if (lock.checkInDate.getTime() !== checkIn.getTime() || lock.checkOutDate.getTime() !== checkOut.getTime()) {
      throw new BadRequestException('Reservation lock dates do not match requested dates');
    }

    const availability = await this.reservationLocks.checkAvailability(
      lock.roomTypeId,
      lock.checkInDate,
      lock.checkOutDate,
      lock.sessionToken,
    );
    if (availability.availableQuantity < requestedQty) {
      throw new BadRequestException(
        `Not enough rooms available. Only ${availability.availableQuantity} rooms left for these dates.`,
      );
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

    await this.reservationLocks.confirmBookingFromLock(dto.lockId, booking.id);
    this.events.broadcastBookingCreated(booking.id, {
      bookingNumber: booking.bookingNumber,
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
}
