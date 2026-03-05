import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationType =
  | 'bookingConfirmation'
  | 'reminder'
  | 'paymentReceipt'
  | 'cancellation';

export interface CreateNotificationInput {
  bookingId?: string;
  type: NotificationType;
  title: string;
  message: string;
  email?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        bookingId: data.bookingId,
        type: data.type,
        title: data.title,
        message: data.message,
        email: data.email,
      },
    });

    // Email-ready: Integrate with SendGrid, SES, etc.
    // await this.emailService.send({ to: data.email, subject: data.title, body: data.message });
    return notification;
  }

  async sendBookingConfirmation(bookingId: string, email: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { roomType: true } } },
    });
    if (!booking) return null;

    return this.create({
      bookingId,
      type: 'bookingConfirmation',
      title: 'Booking Confirmed!',
      message: `Your booking #${booking.bookingNumber} has been confirmed.`,
      email,
    });
  }

  async sendPaymentReceipt(bookingId: string, email: string, amount: number) {
    return this.create({
      bookingId,
      type: 'paymentReceipt',
      title: 'Payment Received',
      message: `Payment of $${amount} received for your booking.`,
      email,
    });
  }

  async getByBookingId(bookingId: string) {
    return this.prisma.notification.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
