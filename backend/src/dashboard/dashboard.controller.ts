import { Controller, Get, Post, Delete, Query, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue overview' })
  @ApiQuery({ name: 'months', required: false })
  async getRevenue(@Query('months') months?: string) {
    return this.dashboardService.getRevenueOverview(
      months ? parseInt(months) : 6,
    );
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  @ApiQuery({ name: 'limit', required: false })
  async getRecentBookings(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentBookings(
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get booking trends' })
  @ApiQuery({ name: 'days', required: false })
  async getTrends(@Query('days') days?: string) {
    return this.dashboardService.getBookingTrends(
      days ? parseInt(days) : 30,
    );
  }

  // ============ CALENDAR / OCCUPANCY ============
  @Get('calendar/occupancy')
  @ApiOperation({ summary: 'Get calendar occupancy view' })
  @ApiQuery({ name: 'months', required: false })
  async getCalendarOccupancy(@Query('months') months?: string) {
    return this.dashboardService.getCalendarOccupancy(
      months ? parseInt(months) : 12,
    );
  }

  @Get('calendar/rooms')
  @ApiOperation({ summary: 'Get room bookings calendar' })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getRoomBookingsCalendar(
    @Query('roomId') roomId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getRoomBookingsCalendar(
      roomId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ============ ANALYTICS ============
  @Get('analytics/daily-bookings')
  @ApiOperation({ summary: 'Get daily bookings for chart' })
  @ApiQuery({ name: 'days', required: false })
  async getDailyBookings(@Query('days') days?: string) {
    return this.dashboardService.getDailyBookings(
      days ? parseInt(days) : 30,
    );
  }

  @Get('analytics/most-booked-rooms')
  @ApiOperation({ summary: 'Get most booked room types' })
  @ApiQuery({ name: 'limit', required: false })
  async getMostBookedRooms(@Query('limit') limit?: string) {
    return this.dashboardService.getMostBookedRooms(
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('analytics/booking-status')
  @ApiOperation({ summary: 'Get booking status breakdown' })
  async getBookingStatusBreakdown() {
    return this.dashboardService.getBookingStatusBreakdown();
  }

  @Get('analytics/revenue-by-room-type')
  @ApiOperation({ summary: 'Get revenue by room type' })
  async getRevenueByRoomType() {
    return this.dashboardService.getRevenueByRoomType();
  }

  @Get('analytics/guest-stats')
  @ApiOperation({ summary: 'Get guest statistics' })
  async getGuestStats() {
    return this.dashboardService.getGuestStats();
  }

  // ============ BLOCKED DATES ============
  @Post('block-dates')
  @ApiOperation({ summary: 'Block dates for a room' })
  async blockDates(
    @Body() dto: { roomId: string; startDate: string; endDate: string; reason?: string },
  ) {
    return this.dashboardService.blockDates(
      dto.roomId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.reason,
    );
  }

  @Get('block-dates')
  @ApiOperation({ summary: 'Get blocked dates' })
  @ApiQuery({ name: 'roomId', required: false })
  async getBlockedDates(@Query('roomId') roomId?: string) {
    return this.dashboardService.getBlockedDates(roomId);
  }

  @Delete('block-dates/:id')
  @ApiOperation({ summary: 'Delete blocked date' })
  async deleteBlockedDate(@Param('id') id: string) {
    return this.dashboardService.deleteBlockedDate(id);
  }
}
