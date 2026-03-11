import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor(private prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Create a Stripe Payment Intent for a booking
   */
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency: string = 'usd',
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // Fetch booking details
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          bookingId,
          bookingNumber: booking.bookingNumber,
          guestEmail: booking.guestEmail,
        },
        description: `Hotel Booking - ${booking.bookingNumber}`,
      });

      // Update or create payment record
      const payment = await this.prisma.payment.upsert({
        where: { id: bookingId }, // This might need adjustment based on your schema
        update: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
        create: {
          bookingId,
          amount: amount,
          currency: currency.toUpperCase(),
          method: 'STRIPE',
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      });

      this.logger.log(
        `Payment intent created for booking ${bookingId}: ${paymentIntent.id}`,
      );

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error}`);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  /**
   * Retrieve payment intent status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error}`);
      throw new BadRequestException('Failed to retrieve payment status');
    }
  }

  /**
   * Update payment status based on webhook event
   */
  async updatePaymentStatusFromWebhook(
    paymentIntentId: string,
    status: string,
  ): Promise<void> {
    try {
      let paymentStatus = PaymentStatus.PENDING;

      if (status === 'succeeded') {
        paymentStatus = PaymentStatus.COMPLETED;
      } else if (status === 'payment_failed') {
        paymentStatus = PaymentStatus.FAILED;
      } else if (status === 'canceled') {
        paymentStatus = PaymentStatus.FAILED;
      }

      await this.prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: {
          status: paymentStatus,
          paidAt: paymentStatus === PaymentStatus.COMPLETED ? new Date() : null,
        },
      });

      this.logger.log(
        `Payment status updated for intent ${paymentIntentId}: ${paymentStatus}`,
      );
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);

      await this.prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: PaymentStatus.FAILED },
      });

      this.logger.log(`Payment intent cancelled: ${paymentIntentId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent: ${error}`);
    }
  }

  /**
   * Construct webhook event from raw body
   */
  constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    try {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error}`);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }
}
