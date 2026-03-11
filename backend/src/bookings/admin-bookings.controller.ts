import { Controller, Get, Query, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, BookingStatus } from '@prisma/client';

@ApiTags('admin/bookings')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth()
export class AdminBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Advanced booking search and filtering' })
  @ApiQuery({ name: 'searchTerm', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'minAmount', required: false })
  @ApiQuery({ name: 'maxAmount', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async searchBookings(
    @Query('searchTerm') searchTerm?: string,
    @Query('status') status?: BookingStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'date' | 'amount' | 'status',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.bookingsService.searchBookings({
      searchTerm,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sortBy,
      sortOrder,
    });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get bookings for calendar/timeline view' })
  @ApiQuery({ name: 'from', required: true, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: true, description: 'ISO date' })
  async getBookingsByDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.bookingsService.getBookingsByDateRange(
      new Date(from),
      new Date(to),
    );
  }

  @Get('revenue-metrics')
  @ApiOperation({ summary: 'Get revenue metrics for a date range' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'groupBy', required: false })
  async getRevenueMetrics(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.bookingsService.getRevenueMetrics(
      new Date(from),
      new Date(to),
      groupBy,
    );
  }

  @Get('occupancy-metrics')
  @ApiOperation({ summary: 'Get occupancy metrics by room type' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async getOccupancyMetrics(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.bookingsService.getOccupancyMetrics(
      new Date(from),
      new Date(to),
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }
}
