import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { StripeService } from './stripe.service';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '@prisma/client';

@ApiTags('payments')
@Controller('payments/webhooks')
export class StripeWebhookController {
  private logger = new Logger(StripeWebhookController.name);

  constructor(
    private stripeService: StripeService,
    private bookingsService: BookingsService,
  ) {}

  @Post('stripe')
  @Public()
  @ApiOperation({ summary: 'Stripe Webhook - Handles payment events' })
  async handleStripeWebhook(
    @RawBodyRequest() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const event = this.stripeService.constructWebhookEvent(
        req.body as Buffer,
        signature,
      );

      this.logger.log(`Processing Stripe webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error}`);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      this.logger.warn(`No bookingId in payment intent metadata: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    await this.stripeService.updatePaymentStatusFromWebhook(
      paymentIntent.id,
      'succeeded',
    );

    // Update booking status to CONFIRMED
    try {
      await this.bookingsService.updateStatus(bookingId, BookingStatus.CONFIRMED);
      this.logger.log(`Booking confirmed: ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to confirm booking: ${error}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);

    await this.stripeService.updatePaymentStatusFromWebhook(
      paymentIntent.id,
      'payment_failed',
    );
  }

  private async handleChargeRefunded(charge: any) {
    this.logger.log(`Charge refunded: ${charge.id}`);

    // Handle refund logic here if needed
    // This might involve updating booking status, notifying guests, etc.
  }
}
