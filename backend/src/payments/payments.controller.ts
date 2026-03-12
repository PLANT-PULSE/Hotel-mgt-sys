import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStripePaymentIntentDto } from './dto/create-stripe-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PaymentStatus } from '@prisma/client';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private stripeService: StripeService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment for booking (non-Stripe)' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  // ========== Stripe Payment Endpoints ==========

  @Post('stripe/create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Payment Intent for booking' })
  async createPaymentIntent(@Body() dto: CreateStripePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(
      dto.bookingId,
      dto.amount ?? 0,
      dto.currency ?? 'usd',
    );
  }

  @Get('stripe/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details with Stripe info' })
  async getPayment(@Param('id') id: string) {
    return this.stripeService.getPayment(id);
  }

  @Get('stripe/intent/:paymentIntentId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Payment Intent status' })
  async getPaymentIntentStatus(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.getPaymentIntentStatus(paymentIntentId);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      return { received: false, error: 'No payload' };
    }
    return this.stripeService.processWebhook(payload, signature);
  }

  // ========== Existing Endpoints ==========

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for booking' })
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBookingId(bookingId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status (staff)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus; transactionId?: string },
  ) {
    return this.paymentsService.updateStatus(
      id,
      body.status,
      body.transactionId,
    );
  }
}
