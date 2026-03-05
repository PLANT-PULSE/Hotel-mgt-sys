import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}
