import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityStatus, UserRole, Prisma } from '@prisma/client';

export interface LogActivityInput {
  userId?: string;
  role?: UserRole;
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  status?: ActivityStatus;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(input: LogActivityInput) {
    return this.prisma.activityLog.create({
      data: {
        userId: input.userId,
        role: input.role,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        browser: input.browser ?? this.parseBrowser(input.userAgent),
        status: input.status ?? ActivityStatus.SUCCESS,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async findMany(options: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    status?: ActivityStatus;
  }) {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(options.userId && { userId: options.userId }),
      ...(options.action && { action: { contains: options.action, mode: 'insensitive' as const } }),
      ...(options.status && { status: options.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private parseBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }
}
