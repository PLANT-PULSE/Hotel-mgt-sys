import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment for booking' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

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
