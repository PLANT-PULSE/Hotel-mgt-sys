import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { ReservationLockService } from './reservation-lock.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReservationLockDto } from './dto/create-reservation-lock.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { UserRole } from '@prisma/client';
import { BookingStatus } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private reservationLockService: ReservationLockService,
  ) {}

  @Get('availability')
  @Public()
  @ApiOperation({ summary: 'Check room availability for dates' })
  @ApiQuery({ name: 'roomTypeId', required: true })
  @ApiQuery({ name: 'checkInDate', required: true })
  @ApiQuery({ name: 'checkOutDate', required: true })
  async checkAvailability(
    @Query('roomTypeId') roomTypeId: string,
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
  ) {
    return this.reservationLockService.checkAvailability(
      roomTypeId,
      new Date(checkInDate),
      new Date(checkOutDate),
    );
  }

  @Post('reservation-lock')
  @Public()
  @ApiOperation({ summary: 'Hold rooms temporarily to prevent double booking during checkout' })
  async createReservationLock(@Body() dto: CreateReservationLockDto) {
    return this.reservationLockService.createLock(
      dto.roomTypeId,
      new Date(dto.checkInDate),
      new Date(dto.checkOutDate),
      dto.quantity ?? 1,
    );
  }

  @Delete('reservation-lock/:token')
  @Public()
  @ApiOperation({ summary: 'Release a reservation hold' })
  async releaseReservationLock(@Param('token') token: string) {
    await this.reservationLockService.releaseLock(token);
    return { message: 'Lock released' };
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create booking (guest checkout)' })
  async create(@Body() dto: CreateBookingDto, @CurrentUser() user?: RequestUser) {
    return this.bookingsService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all bookings (staff)' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: BookingStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingsService.findAll({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my bookings (guest)' })
  async getMyBookings(@CurrentUser() user: RequestUser) {
    return this.bookingsService.findMyBookings(user.id);
  }

  @Get('lookup/:number')
  @Public()
  @ApiOperation({ summary: 'Lookup booking by number (e.g. LXS-2024-00123)' })
  async lookup(@Param('number') number: string) {
    return this.bookingsService.findByNumber(number);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto.status);
  }
}
