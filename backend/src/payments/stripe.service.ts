import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  /**
   * Create a Stripe Payment Intent for a booking
   */
  async createPaymentIntent(bookingId: string, amount: number, currency: string = 'usd') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Calculate remaining amount to pay
    const paidTotal = booking.payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remaining = Number(booking.totalAmount) - paidTotal;
    const paymentAmount = amount || remaining;

    if (paymentAmount <= 0) {
      throw new BadRequestException('Booking is already fully paid');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
      },
      description: `Hotel Booking ${booking.bookingNumber}`,
    });

    // Create payment record with Stripe details
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: paymentAmount,
        currency: currency.toUpperCase(),
        method: 'CARD' as any,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount,
      currency: currency.toUpperCase(),
    };
  }

  /**
   * Confirm payment intent was successful (for webhook handling)
   */
  async confirmPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this payment intent');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    // Check if booking is fully paid and confirm it
    const allPayments = await this.prisma.payment.findMany({
      where: { bookingId: payment.bookingId },
    });

    const paidTotal = allPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalAmount = Number(payment.booking.totalAmount);

    if (paidTotal >= totalAmount - 0.01) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' as any },
      });
    }

    return { success: true, bookingId: payment.bookingId };
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { success: true };
  }

  /**
   * Get payment by ID with Stripe details
   */
  async getPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get payment intent status from Stripe
   */
  async getPaymentIntentStatus(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      throw new NotFoundException('Payment intent not found');
    }
  }

  /**
   * Process Stripe webhook
   */
  async processWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      if (this.webhookSecret) {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          this.webhookSecret,
        );
      } else {
        // For testing without webhook signature
        event = JSON.parse(payload.toString());
      }
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(failedPaymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Create or retrieve Stripe customer
   */
  async createOrGetCustomer(email: string, name: string) {
    // Search for existing customer
    const customers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    return this.stripe.customers.create({
      email,
      name,
    });
  }
}
