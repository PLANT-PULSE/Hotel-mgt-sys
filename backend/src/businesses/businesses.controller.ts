import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, BusinessStatus } from '@prisma/client';

@ApiTags('businesses')
@Controller('businesses')
@UseGuards(RolesGuard)
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Public()
  @Get('search')
  search(@Query() query: Record<string, string>) {
    return this.businessesService.search({
      q: query.q,
      city: query.city,
      type: query.type,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      minRating: query.minRating ? Number(query.minRating) : undefined,
      amenities: query.amenities ? query.amenities.split(',') : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      sort: query.sort as 'price_asc' | 'price_desc' | 'rating' | 'popular',
    });
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateBusinessDto, @CurrentUser() user: { id: string }) {
    return this.businessesService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  findAll(
    @Query('status') status?: BusinessStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.businessesService.findAll({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
  }

  @Get('platform/stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  platformStats() {
    return this.businessesService.getPlatformStats();
  }

  @Patch(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.businessesService.suspend(id, reason ?? 'Policy violation', user.id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  restore(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.businessesService.restore(id, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.businessesService.softDelete(id, user.id);
  }

  @Patch(':id/theme')
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  updateTheme(@Param('id') id: string, @Body() body: Record<string, string>) {
    return this.businessesService.updateTheme(id, body);
  }
}
