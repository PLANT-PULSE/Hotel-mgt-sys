import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('guests')
@Controller('guests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
@ApiBearerAuth()
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Get()
  @ApiOperation({ summary: 'List all guests' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.guestsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  async findOne(@Param('id') id: string) {
    return this.guestsService.findById(id);
  }
}
