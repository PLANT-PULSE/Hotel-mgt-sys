import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from '../common/services/activity-log.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('activity-logs')
@Controller('activity-logs')
@UseGuards(RolesGuard)
export class ActivityLogsController {
  constructor(
    private activityLog: ActivityLogService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('status') status?: ActivityStatus,
  ) {
    return this.activityLog.findMany({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      action,
      status,
    });
  }

  @Post('broadcast')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async broadcast(
    @Body() body: { title: string; message: string; targetRole?: UserRole },
    @CurrentUser() user: { id: string },
  ) {
    const message = await this.prisma.broadcastMessage.create({
      data: {
        title: body.title,
        message: body.message,
        targetRole: body.targetRole,
        sentById: user.id,
      },
    });

    await this.activityLog.log({
      userId: user.id,
      role: UserRole.SUPER_ADMIN,
      action: 'BROADCAST_SENT',
      entity: 'BroadcastMessage',
      entityId: message.id,
    });

    return message;
  }

  @Get('emergency-alerts')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  getEmergencyAlerts() {
    return this.prisma.emergencyAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
