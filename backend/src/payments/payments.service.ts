import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { payments: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const paidTotal = booking.payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remaining = Number(booking.totalAmount) - paidTotal;
    if (dto.amount > remaining) {
      throw new BadRequestException(`Amount exceeds remaining balance ($${remaining})`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        amount: dto.amount,
        method: dto.method,
        transactionId: dto.transactionId,
        metadata: dto.metadata as object | undefined,
        status: dto.transactionId ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paidAt: dto.transactionId ? new Date() : null,
      },
    });

    const newPaidTotal = paidTotal + dto.amount;
    if (Math.abs(newPaidTotal - Number(booking.totalAmount)) < 0.01) {
      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    return payment;
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByBookingId(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: PaymentStatus, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        transactionId: transactionId ?? payment.transactionId,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : payment.paidAt,
      },
    });
  }
}
